# ┌────────────────────────────────────────────────────────────────────────────┐
# │ AI-Assisted User Story Generator – Story Point Estimator Scaffolding       │
# │ Full Fibonacci (1–21). 13/21 → "too large for one sprint—must split".      │
# │ Includes: types (dataclasses), estimator_v1, hooks, and pytest tests.      │
# └────────────────────────────────────────────────────────────────────────────┘

# ============================================================================
# File: src/types/story_types.py
# ============================================================================
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Literal, Dict, TypedDict

Fibonacci = Literal[1, 2, 3, 5, 8, 13, 21]
UnknownLevel = Literal["low", "med", "high"]

@dataclass
class Story:
    title: str
    description: str
    acceptance_criteria: List[str]
    attachments: List[str] | None = None
    tags: List[str] | None = None
    id: str | None = None  # local or ADO id

class EstimationComponents(TypedDict):
    duration: int
    complexity: int

class ComplexityBreakdown(TypedDict):
    steps: int
    unknowns: UnknownLevel

class EstimationResult(TypedDict):
    points: Fibonacci
    components: EstimationComponents
    complexity_breakdown: ComplexityBreakdown
    rationale: str
    advisories: List[str]

class DriftAssessment(TypedDict):
    original_points: Fibonacci
    new_points: Fibonacci
    step_change: int
    is_major: bool
    message: str


# ============================================================================
# File: src/estimators/story_points/estimator_v1.py
# ============================================================================
from __future__ import annotations
import re
from typing import List
from ..types.story_types import (
    Story,
    EstimationResult,
    EstimationComponents,
    ComplexityBreakdown,
    Fibonacci,
    UnknownLevel,
)

FIB_SEQUENCE: List[Fibonacci] = [1, 2, 3, 5, 8, 13, 21]


def _map_to_fibonacci(score: int) -> Fibonacci:
    for f in FIB_SEQUENCE:
        if score <= f:
            return f
    return 21


def _classify_unknowns(text: str, acs: List[str]) -> UnknownLevel:
    hay = (text + " " + " ".join(acs)).lower()
    unknown_cues = [
        "tbd",
        "unknown",
        "investigate",
        "spike",
        "blocked",
        "requires access",
        "integrate",
        "dependency",
        "external",
        "not defined",
        "new pattern",
    ]
    hits = sum(1 for c in unknown_cues if c in hay)
    if hits >= 3:
        return "high"
    if hits == 2:
        return "med"
    return "low"


def _count_steps(description: str, acs: List[str]) -> int:
    # Simple proxy: AC count + imperative-like hints in description
    hints = re.findall(r"\b(then|and|next|verify|click|enter|submit)\b", description, flags=re.I)
    return len(acs) + min(len(hints), 5)


def estimate_points_v1(story: Story) -> EstimationResult:
    steps = _count_steps(story.description, story.acceptance_criteria)
    unknowns = _classify_unknowns(story.description, story.acceptance_criteria)

    # Duration proxy: more ACs ~ more time; gentle scaling
    duration = max(1, round(len(story.acceptance_criteria) * 0.8))

    # Complexity: steps + unknowns weighting (low=0, med=1, high=3)
    unknown_weight = 3 if unknowns == "high" else 1 if unknowns == "med" else 0
    complexity = max(0, round(steps * 0.6) + unknown_weight)

    points = _map_to_fibonacci(duration + complexity)  # full Fibonacci; may be 13 or 21

    advisories: List[str] = []
    if points >= 13:
        advisories.append("Too large for one sprint—must split")
    elif points > 8:
        advisories.append("Consider splitting: baseline > 8 points")
    if unknowns == "high":
        advisories.append("Unknowns high: add clarifications / DoR checks")
    if points == 1:
        advisories.append("Very small: consider batching with adjacent work")

    rationale = (
        f"Duration ≈ {duration}; Complexity ≈ {complexity} "
        f"(steps={steps}, unknowns={unknowns}). Estimate={points}."
    )

    result: EstimationResult = {
        "points": points,
        "components": {"duration": duration, "complexity": complexity},
        "complexity_breakdown": {"steps": steps, "unknowns": unknowns},
        "rationale": rationale,
        "advisories": advisories,
    }
    return result


# ============================================================================
# File: src/hooks/on_generate_story_success.py
# ============================================================================
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from ..types.story_types import Story, Fibonacci
from ..estimators.story_points.estimator_v1 import estimate_points_v1


@dataclass
class StoryMeta:
    original_points: Optional[Fibonacci] = None
    last_estimate: Optional[dict] = None  # EstimationResult runtime shape


@dataclass
class SessionState:
    story: Optional[Story] = None
    story_meta: Optional[StoryMeta] = None


def on_generate_story_success(story_draft: Story, session: SessionState) -> SessionState:
    est = estimate_points_v1(story_draft)
    story_meta = StoryMeta(original_points=est["points"], last_estimate=est)
    return SessionState(story=story_draft, story_meta=story_meta)


# ============================================================================
# File: src/hooks/on_restart_story.py
# ============================================================================
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Tuple, List
from ..types.story_types import Story, Fibonacci
from ..estimators.story_points.estimator_v1 import estimate_points_v1


@dataclass
class DriftBanner:
    show: bool
    message: Optional[str] = None


def on_restart_story(new_story: Story, session: "SessionState") -> Tuple["SessionState", DriftBanner]:
    est = estimate_points_v1(new_story)
    original = session.story_meta.original_points if session.story_meta and session.story_meta.original_points else est["points"]

    fib_order: List[Fibonacci] = [1, 2, 3, 5, 8, 13, 21]
    step_change = abs(fib_order.index(est["points"]) - fib_order.index(original))
    is_major = step_change >= 2

    if est["points"] >= 13:
        banner = DriftBanner(show=True, message=f"Estimate is {est['points']} (too large for one sprint—must split).")
    elif is_major:
        banner = DriftBanner(show=True, message=f"Scope changed: estimate moved from {original} → {est['points']}. Consider splitting or clarifying.")
    else:
        banner = DriftBanner(show=False)

    updated = type(session)(story=new_story, story_meta=type(session.story_meta)(original_points=original, last_estimate=est))
    return updated, banner


# ============================================================================
# File: src/hooks/apply_suggestion.py
# ============================================================================
from __future__ import annotations
from dataclasses import dataclass
from typing import Literal
from ..types.story_types import Story, Fibonacci
from ..estimators.story_points.estimator_v1 import estimate_points_v1

SuggestionField = Literal["title", "description", "acceptance_criteria"]

@dataclass
class Suggestion:
    field: SuggestionField
    value: str | list[str]


def apply_suggestion(current: Story, suggestion: Suggestion, session: "SessionState") -> "SessionState":
    updated = Story(
        title=current.title,
        description=current.description,
        acceptance_criteria=list(current.acceptance_criteria),
        attachments=current.attachments,
        tags=current.tags,
        id=current.id,
    )

    if suggestion.field == "title" and isinstance(suggestion.value, str):
        updated.title = suggestion.value
    elif suggestion.field == "description" and isinstance(suggestion.value, str):
        updated.description = suggestion.value
    elif suggestion.field == "acceptance_criteria" and isinstance(suggestion.value, list):
        updated.acceptance_criteria = suggestion.value

    est = estimate_points_v1(updated)
    original: Fibonacci = session.story_meta.original_points if session.story_meta and session.story_meta.original_points else est["points"]

    return type(session)(story=updated, story_meta=type(session.story_meta)(original_points=original, last_estimate=est))


# ============================================================================
# File: tests/test_estimator_v1.py  (pytest)
# ============================================================================
from __future__ import annotations
import pytest
from src.types.story_types import Story
from src.estimators.story_points.estimator_v1 import estimate_points_v1


def test_returns_full_fibonacci_value():
    story = Story(
        title="As a user, I can log in",
        description="User enters credentials and clicks submit.",
        acceptance_criteria=[
            "Given valid credentials, when user logs in, then they see dashboard",
            "Show error for invalid credentials",
        ],
    )
    res = estimate_points_v1(story)
    assert res["points"] in {1, 2, 3, 5, 8, 13, 21}


def test_explicit_split_advisory_for_13_or_21():
    story = Story(
        title="Big integration spike",
        description="Integrate with external system; blocked on access; TBD endpoints; investigate auth.",
        acceptance_criteria=[f"AC {i+1}" for i in range(20)],
    )
    res = estimate_points_v1(story)
    assert res["points"] in {13, 21}
    assert any("too large for one sprint—must split" in a.lower() for a in res["advisories"])  # case-insensitive check


# ============================================================================
# File: tests/test_hooks.py  (pytest)
# ============================================================================
from __future__ import annotations
from src.types.story_types import Story
from src.hooks.on_generate_story_success import on_generate_story_success, SessionState
from src.hooks.on_restart_story import on_restart_story
from src.hooks.apply_suggestion import apply_suggestion, Suggestion


def test_on_generate_story_success_sets_original_points():
    story = Story(
        title="Login",
        description="Enter username and password, then submit",
        acceptance_criteria=["Valid login shows dashboard"],
    )
    session = SessionState()
    updated = on_generate_story_success(story, session)
    assert updated.story_meta is not None
    assert updated.story_meta.original_points in {1, 2, 3, 5, 8, 13, 21}


def test_restart_story_triggers_drift_or_split_banner():
    base = Story(
        title="Small thing",
        description="Click button",
        acceptance_criteria=["Click shows modal"],
    )
    s0 = on_generate_story_success(base, SessionState())

    bigger = Story(
        title="Big integration",
        description="Integrate with external; TBD; investigate; blocked; requires access",
        acceptance_criteria=[f"AC {i+1}" for i in range(16)],
    )
    s1, banner = on_restart_story(bigger, s0)
    assert banner.show is True
    assert banner.message is not None


def test_apply_suggestion_updates_and_reestimates():
    story = Story(
        title="Login",
        description="Enter username and password",
        acceptance_criteria=["Valid login shows dashboard"],
    )
    session = on_generate_story_success(story, SessionState())

    suggestion = Suggestion(field="acceptance_criteria", value=["Valid login shows dashboard", "Invalid shows error"])
    updated_session = apply_suggestion(story, suggestion, session)

    assert updated_session.story is not None
    assert len(updated_session.story.acceptance_criteria) == 2
    assert updated_session.story_meta is not None


# ============================================================================
# File: pyproject.toml (pytest + packaging, optional)
# ============================================================================
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "po_toolkit_story_estimator"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []

[tool.pytest.ini_options]
addopts = "-q"
pythonpath = ["."]


# ============================================================================
# Quickstart (README excerpt)
# ============================================================================
# 1) Create this structure in your repo:
#    src/
#      types/story_types.py
#      estimators/story_points/estimator_v1.py
#      hooks/on_generate_story_success.py
#      hooks/on_restart_story.py
#      hooks/apply_suggestion.py
#    tests/
#      test_estimator_v1.py
#      test_hooks.py
#    pyproject.toml
#
# 2) Install pytest:  pip install pytest
# 3) Run tests:       pytest
# 4) Use it:
#    from src.types.story_types import Story
#    from src.estimators.story_points.estimator_v1 import estimate_points_v1
#    res = estimate_points_v1(Story(title="...", description="...", acceptance_criteria=["..."]))
#    print(res["points"], res["advisories"])
