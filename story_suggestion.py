
"""
story_suggestion.py

This module provides two core functions for handling AI-driven story refinements:
`build_suggestion()` and `apply_suggestion()`.

They form the bridge between AI-generated outputs (from refine_story, refine_field,
or generate_recommendations) and user-applied changes in the PO Toolkit App.

---

## 🔁 Overview of Roles

| Function            | Purpose                                                       | Trigger                           |
|---------------------|---------------------------------------------------------------|------------------------------------|
| `build_suggestion()` | Creates a structured diff object after GPT modifies a story  | Called after refine or recommend  |
| `apply_suggestion()` | Applies the selected suggestion to the working story object  | Called when user clicks “Apply”   |

---

## 🔨 `build_suggestion()`

### Purpose
- Compares two versions of a story
- Produces a structured suggestion object including:
  - Diff (patch-like list of changes)
  - Before/after story states
  - Metadata (model, timestamp, session)

### Developer Notes
- Uses a minimal diff algorithm to highlight changes
- Generates unique IDs with SHA
- Normalizes diff paths (e.g., `/acceptance_criteria/1`)
- Skips suggestions with no differences
- Does not mutate inputs

---

## ✅ `apply_suggestion()`

### Purpose
- Accepts a suggestion object and merges it into the current story
- Performs optional drift check to detect differences from suggestion.before
- Returns a deep copy of the updated story

### Developer Notes
- Caller must handle undo stack, version snapshots, and dev notes regeneration
- Designed to be simple, non-blocking, and auditable

---

## 🧪 Testing Scenarios

| Scenario                                | Expectation                                       |
|-----------------------------------------|--------------------------------------------------|
| User applies full-scope suggestion      | Entire story updated; undo works                 |
| User applies field-level suggestion     | Only that field changes                          |
| Suggestion has no diff                  | Should be skipped or flagged                     |
| Drift detected                          | Warn or log discrepancy                          |
| Multiple suggestions applied sequentially | All tracked with unique IDs + metadata           |

---

## 🔧 Example UI/UX Tie-Ins

| UI Element      | Backed By                     |
|------------------|-------------------------------|
| Diff viewer      | `build_suggestion().diff`     |
| Undo button      | `apply_suggestion().before`   |
| Tooltip (source) | `suggestion.metadata.model`   |
| Audit trail      | `suggestion.id`, `created_at` |

---


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
    """Minimal JSON 'patch-like' diff."""
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
    """Constructs a suggestion object from before/after story versions."""
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
    """Applies a suggestion object to the current story."""
    if suggestion.get("before") and suggestion["before"] != current_story:
        print("⚠️ Warning: The current story differs from the suggestion's 'before' state.")

    after = suggestion.get("after")
    if not isinstance(after, dict):
        raise ValueError("Invalid suggestion: missing or malformed 'after' field.")

    return deepcopy(after)
