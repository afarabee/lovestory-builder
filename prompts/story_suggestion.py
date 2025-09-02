
"""
story_suggestion.py

Contains both build_suggestion and apply_suggestion, including their purpose,
structure, and usage within the AI User Story Generator refinement loop.
"""

import json
import time
import hashlib
from copy import deepcopy
from typing import Any, Dict, List, Optional

Story = Dict[str, Any]

# -------------------------------
# 🧩 build_suggestion
# -------------------------------

def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

def _sha(obj: Any) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode("utf-8")).hexdigest()

def _diff_dict(before: Any, after: Any, path: str = "") -> List[Dict[str, Any]]:
    """
    Minimal JSON 'patch-like' diff.
    Emits ops: replace / add / remove.
    """
    diffs: List[Dict[str, Any]] = []

    if isinstance(before, dict) and isinstance(after, dict):
        bkeys, akeys = set(before.keys()), set(after.keys())
        for k in sorted(bkeys - akeys):
            diffs.append({"op": "remove", "path": f"{path}/{k}" if path else f"/{k}", "before": before[k]})
        for k in sorted(akeys - bkeys):
            diffs.append({"op": "add", "path": f"{path}/{k}" if path else f"/{k}", "after": after[k]})
        for k in sorted(akeys & bkeys):
            diffs.extend(_diff_dict(before[k], after[k], f"{path}/{k}" if path else f"/{k}"))
        return diffs

    if isinstance(before, list) and isinstance(after, list):
        maxlen = max(len(before), len(after))
        for i in range(maxlen):
            p = f"{path}/{i}" if path else f"/{i}"
            if i >= len(before):
                diffs.append({"op": "add", "path": p, "after": after[i]})
            elif i >= len(after):
                diffs.append({"op": "remove", "path": p, "before": before[i]})
            else:
                diffs.extend(_diff_dict(before[i], after[i], p))
        return diffs

    if before != after:
        diffs.append({"op": "replace", "path": path or "/", "before": before, "after": after})
    return diffs

def build_suggestion(
    before_story: Story,
    after_story: Story,
    *,
    scope: str,
    field_name: Optional[str] = None,
    model: str = "gpt-5",
    temperature: float = 0.0,
    retrieval_used: bool = False,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Compares two story versions and returns a structured suggestion object,
    including diff metadata for UI rendering and audit logging.

    - Supports both full and field-level scopes
    - Produces unique, traceable suggestion IDs
    - Does not mutate input objects
    """
    if scope == "field" and not field_name:
        raise ValueError("field_name is required when scope='field'.")

    before_copy = deepcopy(before_story)
    after_copy = deepcopy(after_story)
    diff = _diff_dict(before_copy, after_copy)
    sid = f"sugg_{_sha({'b': before_copy, 'a': after_copy})[:12]}"

    return {
        "id": sid,
        "scope": scope,
        "field_name": field_name,
        "before": before_copy,
        "after": after_copy,
        "diff": diff,
        "metadata": {
            "created_at": _now_iso(),
            "model": model,
            "temperature": temperature,
            "retrieval_used": retrieval_used,
            **(meta or {})
        }
    }

# -------------------------------
# ✅ apply_suggestion
# -------------------------------

def apply_suggestion(current_story: Story, suggestion: Dict[str, Any]) -> Story:
    """
    Applies the given suggestion object to the current story state.

    - Optional drift check warns if 'before' state doesn't match
    - Returns a deep copy of the updated 'after' story
    - Caller is responsible for snapshot, dev notes, and undo stack

    Parameters:
        current_story (dict): Current story in session
        suggestion (dict): Suggestion object from build_suggestion()

    Returns:
        dict: Updated story
    """
    if suggestion.get("before") and suggestion["before"] != current_story:
        print("⚠️ Warning: The current story differs from the suggestion's 'before' state.")

    after = suggestion.get("after")
    if not isinstance(after, dict):
        raise ValueError("Invalid suggestion: missing or malformed 'after' field.")

    return deepcopy(after)
