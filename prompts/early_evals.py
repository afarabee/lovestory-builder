# early_evals.py (non-Gherkin, testable bullets)

from typing import Any, Dict, List, Tuple, TypedDict
from copy import deepcopy
import re

Story = Dict[str, Any]

# --- Tunables (easy to tweak without editing logic) ---
MIN_TITLE_LEN = 3
MAX_TITLE_LEN = 120
MIN_DESC_LEN = 20
SP_MIN, SP_MAX = 1, 13
VERB_RATIO_TARGET = 0.5        # at least 50% of AC start with a verb
MEASURABLE_RATIO_TARGET = 1 / 3  # at least ~1/3 are measurable
REQUIRED_TAGS = {"chatgpt", "ai-story-gen"}  # lint-only; auto-added to proposed_fix

# Heuristics for “vague” language that harms testability
_VAGUE_REGEXES = [
    re.compile(r"\b(maybe|should|could|might|ideally|nice to have)\b", re.I),
    re.compile(r"\b(etc\.?|and so on)\b", re.I),
    re.compile(r"\b(user-friendly|intuitive|fast|optimi[sz]e|robust|scalable)\b", re.I),
]

# Weak signals that a bullet is measurable/specific (not required, just boosts confidence)
_MEASURABLE_REGEXES = [
    re.compile(r"\bwithin\s+\d+\s*(ms|s|sec|seconds|minutes|min|hours|days)\b", re.I),
    re.compile(r"\b(at\s+least|no\s+more\s+than|up\s+to|fewer\s+than|less\s+than)\s+\d+", re.I),
    re.compile(r"\b\d+\s*(errors|items|retries|attempts|characters|fields|records|results)\b", re.I),
    re.compile(r"\b(returns|displays|sends|logs|stores|validates|rejects|applies)\b", re.I),  # concrete verb
]

# Acceptable starting verbs (customize for your org)
_START_VERBS = [
    "allow", "prevent", "display", "show", "hide", "return", "send", "log", "store",
    "validate", "reject", "accept", "apply", "calculate", "update", "create", "delete",
    "paginate", "mask", "encrypt", "truncate", "format"
]


def _is_str(x) -> bool:
    return isinstance(x, str) and bool(x.strip())


def _dedupe_preserve_order(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for it in items:
        key = re.sub(r"\s+", " ", it.strip().lower())
        if key not in seen:
            seen.add(key)
            out.append(it)
    return out


def _score_weight(points: List[Tuple[bool, int]]) -> int:
    if not points:
        return 0
    total = sum(w for _, w in points)
    got = sum(w for ok, w in points if ok)
    return int(round((got / total) * 100))


def _starts_with_verb(text: str) -> bool:
    first = text.strip().split()[:1]
    if not first:
        return False
    return first[0].lower().rstrip("s") in _START_VERBS  # crude “verb-ish” check


def _has_vague_language(text: str) -> bool:
    return any(rx.search(text) for rx in _VAGUE_REGEXES)


def _is_measurable(text: str) -> bool:
    return any(rx.search(text) for rx in _MEASURABLE_REGEXES)


class EvalFinding(TypedDict):
    id: str
    ok: bool
    severity: str
    msg: str

class EvalResult(TypedDict):
    ok: bool
    score: int
    findings: List[EvalFinding]
    proposed_fix: Story


def early_evals(story: Story) -> EvalResult:
    """
    Fast, dependency-free lint/validation for a generated/refined story
    using plain, testable bullet acceptance criteria (non-Gherkin).
    """
    findings: List[EvalFinding] = []
    weights: List[Tuple[bool, int]] = []
    fixed: Story = deepcopy(story)

    # ---- 1) Structure & types ----
    required_fields = ["title", "description", "acceptance_criteria", "story_points", "tags"]
    for k in required_fields:
        ok = k in story
        findings.append({"id": f"struct.has_{k}", "ok": ok, "severity": "error" if not ok else "info",
                         "msg": f"{'Missing' if not ok else 'Present'}: {k}"})
        weights.append((ok, 10 if k in ("title", "acceptance_criteria") else 6))

    # ---- 2) Title ----
    title = story.get("title")
    ok_title_type = isinstance(title, str)
    findings.append({"id": "title.type", "ok": ok_title_type, "severity": "error", "msg": "Title must be a string."})
    weights.append((ok_title_type, 6))
    if ok_title_type:
        t = title.strip()
        ok_len = MIN_TITLE_LEN <= len(t) <= MAX_TITLE_LEN
        findings.append({"id": "title.length", "ok": ok_len, "severity": "warn" if not ok_len else "info",
                         "msg": f"Title length {len(t)} (expected {MIN_TITLE_LEN}..{MAX_TITLE_LEN})."})
        weights.append((ok_len, 5))
        if t != title:
            fixed["title"] = t

    # ---- 3) Description ----
    desc = story.get("description")
    ok_desc_type = isinstance(desc, str)
    findings.append({"id": "desc.type", "ok": ok_desc_type, "severity": "error", "msg": "Description must be a string."})
    weights.append((ok_desc_type, 6))
    if ok_desc_type:
        d = desc.strip()
        ok_len = len(d) >= MIN_DESC_LEN
        findings.append({"id": "desc.length", "ok": ok_len, "severity": "warn" if not ok_len else "info",
                         "msg": f"Description length {len(d)} (expected >= {MIN_DESC_LEN})."})
        weights.append((ok_len, 5))
        if d != desc:
            fixed["description"] = d

    # ---- 4) Acceptance Criteria (plain bullets) ----
    ac = story.get("acceptance_criteria")

    if isinstance(ac, list):
        ok_ac_type = all(isinstance(x, str) for x in ac)
        findings.append({"id": "ac.type", "ok": ok_ac_type, "severity": "error",
                        "msg": "Acceptance criteria must be a list of strings."})
        weights.append((ok_ac_type, 10))

        if ok_ac_type:
            ac_list: List[str] = [x for x in ac if isinstance(x, str)]
            trimmed = [a.strip().rstrip(".") for a in ac_list if _is_str(a)]
            ok_non_empty = len(trimmed) >= 1
            findings.append({"id": "ac.non_empty", "ok": ok_non_empty,
                            "severity": "error" if not ok_non_empty else "info",
                            "msg": "At least one acceptance criterion required."})
            weights.append((ok_non_empty, 8))

            # Dedupe
            uniq = _dedupe_preserve_order(trimmed)
            removed = len(trimmed) - len(uniq)
            findings.append({"id": "ac.duplicates", "ok": removed == 0,
                            "severity": "warn" if removed else "info",
                            "msg": f"{'Removed ' + str(removed) if removed else 'No'} duplicate AC."})
            weights.append((removed == 0, 3))

            # Bullet quality heuristics
            starts_ok_count = sum(_starts_with_verb(x) for x in uniq)
            vague_count = sum(_has_vague_language(x) for x in uniq)
            measurable_count = sum(_is_measurable(x) for x in uniq)

            ok_starts = starts_ok_count >= max(1, int(len(uniq) * VERB_RATIO_TARGET))
            findings.append({"id": "ac.starts_with_verb_ratio", "ok": ok_starts,
                            "severity": "warn" if not ok_starts else "info",
                            "msg": f"{starts_ok_count}/{len(uniq)} AC start with an actionable verb."})
            weights.append((ok_starts, 6))

            ok_vague = (vague_count == 0) or (vague_count <= len(uniq) // 4)
            findings.append({"id": "ac.vague_ratio", "ok": ok_vague,
                            "severity": "warn" if not ok_vague else "info",
                            "msg": f"{vague_count}/{len(uniq)} AC contain vague terms (aim for 0)."})
            weights.append((ok_vague, 5))

            ok_measurable = measurable_count >= max(1, int(len(uniq) * MEASURABLE_RATIO_TARGET))
            findings.append({"id": "ac.measurable_ratio", "ok": ok_measurable,
                            "severity": "warn" if not ok_measurable else "info",
                            "msg": f"{measurable_count}/{len(uniq)} AC show measurable specifics."})
            weights.append((ok_measurable, 4))

            fixed["acceptance_criteria"] = uniq
    else:
        # Not a list at all (or missing)
        findings.append({"id": "ac.type", "ok": False, "severity": "error",
                        "msg": "Acceptance criteria must be a list of strings."})
        weights.append((False, 10))


    # ---- 5) Definition of Done (optional) ----
    dod = story.get("definition_of_done")
    if isinstance(dod, list):
        ok_dod_type = all(isinstance(x, str) and x.strip() for x in dod)
        findings.append({
            "id": "dod.type",
            "ok": ok_dod_type,
            "severity": "warn" if not ok_dod_type else "info",
            "msg": "Definition of Done should be a non-empty list of strings."
        })
        weights.append((ok_dod_type, 3))
        if ok_dod_type:
            fixed["definition_of_done"] = [x.strip().rstrip(".") for x in dod]
    elif dod is None:
        findings.append({
            "id": "dod.present",
            "ok": False,
            "severity": "warn",
            "msg": "Definition of Done missing (recommended)."
        })
        weights.append((False, 3))
    else:
        findings.append({
            "id": "dod.type",
            "ok": False,
            "severity": "warn",
            "msg": "Definition of Done should be a list of strings."
        })
        weights.append((False, 3))

    # ---- 6) Story points ----
    sp = story.get("story_points")
    ok_sp_type = isinstance(sp, int)
    findings.append({"id": "sp.type", "ok": ok_sp_type, "severity": "error", "msg": "Story points must be an integer."})
    weights.append((ok_sp_type, 6))
    if ok_sp_type:
        ok_sp_range = SP_MIN <= sp <= SP_MAX
        findings.append({"id": "sp.range", "ok": ok_sp_range, "severity": "warn" if not ok_sp_range else "info",
                         "msg": f"Story points should be between {SP_MIN} and {SP_MAX}."})
        weights.append((ok_sp_range, 4))

    # ---- 7) Tags ----
    tags = story.get("tags")
    if isinstance(tags, list):
        ok_tags_type = all(isinstance(t, str) for t in tags)
        findings.append({
            "id": "tags.type",
            "ok": ok_tags_type,
            "severity": "error",
            "msg": "Tags must be a list of strings."
        })
        weights.append((ok_tags_type, 5))

        if ok_tags_type:
            tags_list: List[str] = [t for t in tags if isinstance(t, str)]
            norm = [re.sub(r"\s+", "-", t.strip().lower()) for t in tags_list if t.strip()]
            # simple dedupe
            seen, norm_dedup = set(), []
            for t in norm:
                if t not in seen:
                    seen.add(t)
                    norm_dedup.append(t)

            # Required tags check (lint-only, non-blocking)
            missing = REQUIRED_TAGS - set(norm_dedup)
            if missing:
                findings.append({
                    "id": "tags.required",
                    "ok": False,
                    "severity": "warn",  # non-blocking
                    "msg": f"Missing required tags (auto-added in quick-fix): {', '.join(sorted(missing))}"
                })
                # do not penalize score
                # auto-fix: inject them
                norm_dedup.extend(sorted(missing))
            else:
                findings.append({
                    "id": "tags.required",
                    "ok": True,
                    "severity": "info",
                    "msg": "All required tags present."
                })

            if norm_dedup != tags:
                findings.append({
                    "id": "tags.normalized",
                    "ok": False,
                    "severity": "info",
                    "msg": f"Normalized/deduped tags: {norm_dedup}"
                })
            else:
                findings.append({
                    "id": "tags.normalized",
                    "ok": True,
                    "severity": "info",
                    "msg": "Tags look good."
                })
            fixed["tags"] = norm_dedup
    else:
        findings.append({
            "id": "tags.type",
            "ok": False,
            "severity": "error",
            "msg": "Tags must be a list of strings."
        })
        weights.append((False, 5))

    # ---- Final score & ok ----
    score = _score_weight(weights)
    ok = all(f["ok"] for f in findings if f["severity"] == "error")

    return {
        "ok": ok,
        "score": score,
        "findings": findings,
        "proposed_fix": fixed
    }


def apply_quick_fixes(story: Story, result: EvalResult) -> Story:
    """
    Merge normalized fields from proposed_fix back to the story.
    Safe for a UI 'Apply quick fixes' button.
    """
    fixed = result.get("proposed_fix", {})
    out = deepcopy(story)
    for key in ("title", "description", "acceptance_criteria", "definition_of_done", "tags"):
        if key in fixed:
            out[key] = fixed[key]
    return out


# --- sanity test ---
if __name__ == "__main__":
    sample = {
        "title": "  Reset password  ",
        "description": "As a user, I want to reset my password so that I can regain access.",
        "acceptance_criteria": [
            "Display a success message within 2 seconds.",
            "Validate password complexity (12+ chars, symbol, number).",
            "Send a reset email containing a one-time link",
            "Send a reset email containing a one-time link"  # duplicate
        ],
        "story_points": 5,
        "tags": [" Security ", "password reset", "security"]  # missing required ones; will be added in quick-fix
    }

    res = early_evals(sample)
    from pprint import pprint
    print("Score:", res["score"])
    pprint(res["findings"])
    print("\n--- Quick-fix ---")
    fixed = apply_quick_fixes(sample, res)
    pprint(fixed)
