# part of chat refinement loop
# includes building the suggestion and applying the suggestion
# invoke right after LLM response, whether from refine_story or refine_field

import time
import hashlib
import json
from typing import Any, Dict, List, Optional
from copy import deepcopy

Story = Dict[str, Any]

def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

def _sha(obj: Any) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode("utf-8")).hexdigest()

def _diff_dict(before: Any, after: Any, path: str = "") -> List[Dict[str, Any]]:
    """
    Minimal JSON 'patch-like' diff without external deps.
    Emits ops: replace / add / remove for scalars, arrays and dicts.
    Good enough for UI previews; not a full RFC 6902.
    """
    diffs: List[Dict[str, Any]] = []

    # Both dicts
    if isinstance(before, dict) and isinstance(after, dict):
        bkeys, akeys = set(before.keys()), set(after.keys())
        for k in sorted(bkeys - akeys):
            diffs.append({"op": "remove", "path": f"{path}/{k}" if path else f"/{k}", "before": before[k]})
        for k in sorted(akeys - bkeys):
            diffs.append({"op": "add", "path": f"{path}/{k}" if path else f"/{k}", "after": after[k]})
        for k in sorted(akeys & bkeys):
            diffs.extend(_diff_dict(before[k], after[k], f"{path}/{k}" if path else f"/{k}"))
        return diffs

    # Both lists (naive index-by-index)
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

    # Scalars or mismatched types → replace if different
    if before != after:
        diffs.append({"op": "replace", "path": path or "/", "before": before, "after": after})
    return diffs


def build_suggestion(
    before_story: Story,
    after_story: Story,
    *,
    scope: str,                          # "full" or "field"
    field_name: Optional[str] = None,    # required if scope == "field"
    model: str = "gpt-4o",
    temperature: float = 0.3,
    retrieval_used: bool = False,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a UI-ready suggestion object with diff.
    Use this immediately after a refine call succeeds.
    """
    if scope == "field" and not field_name:
        raise ValueError("field_name is required when scope='field'.")

    # (Optional) assert that after_story looks like a full story for field scope
    # if scope == "field" and set(after_story.keys()) <= {field_name}:
    #     raise ValueError("after_story should be a full story JSON; merge field updates before calling.")

    # Deepcopy to freeze snapshot at creation time
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

# Applies the suggestion
def apply_suggestion(current_story: Story, suggestion: Dict[str, Any]) -> Story:
    """Safely apply a suggestion produced by build_suggestion()."""
    # Optional drift check: user may have edited since suggestion was created
    before = suggestion.get("before")
    if before is not None and before != current_story:
        # log/warn or block; for now we just proceed
        # print("⚠️ Warning: current story differs from suggestion.before")
        pass

    after = suggestion.get("after")
    if not isinstance(after, dict):
        raise ValueError("Invalid suggestion: missing or non-dict 'after' field.")

    # Return a copy to avoid accidental in-place mutation by callers
    return deepcopy(after)

# sanity check
if __name__ == "__main__":
    before_story = {"title": "T1", "tags": ["a"]}
    after_story  = {"title": "T1 updated", "tags": ["a","b"]}
    suggestion = build_suggestion(before_story, after_story, scope="full", model="gpt-4o")
    applied = apply_suggestion(before_story, suggestion)
    print("Applied:", applied)
