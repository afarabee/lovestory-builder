# test_early_evals.py

from early_evals import early_evals, apply_quick_fixes, REQUIRED_TAGS

def test_valid_story_passes():
    story = {
        "title": "Reset password",
        "description": "As a user, I want to reset my password so that I can regain access.",
        "acceptance_criteria": [
            "Display a success message within 2 seconds",
            "Validate password complexity (12+ chars, symbol, number)"
        ],
        "story_points": 5,
        "tags": ["security", "chatgpt", "ai-story-gen"]
    }

    result = early_evals(story)
    assert result["ok"] is True
    assert result["score"] > 80
    assert all(f["ok"] for f in result["findings"] if f["severity"] == "error")

def test_missing_required_tags_warns_and_fixes():
    story = {
        "title": "Reset password",
        "description": "A short desc",  # too short on purpose
        "acceptance_criteria": ["Send a reset email"],
        "story_points": 3,
        "tags": ["security"]
    }

    result = early_evals(story)

    # should warn about required tags
    tag_findings = [f for f in result["findings"] if f["id"] == "tags.required"]
    assert tag_findings, "tags.required finding should exist"
    assert tag_findings[0]["severity"] == "warn"

    # quick-fix should add them
    fixed = apply_quick_fixes(story, result)
    for req in REQUIRED_TAGS:
        assert req in fixed["tags"]

def test_acceptance_criteria_needs_at_least_one():
    story = {
        "title": "Reset password",
        "description": "This description is long enough to pass the length check.",
        "acceptance_criteria": [],  # empty on purpose
        "story_points": 3,
        "tags": ["chatgpt", "ai-story-gen"]
    }

    result = early_evals(story)
    ac_findings = [f for f in result["findings"] if f["id"] == "ac.non_empty"]
    assert ac_findings and ac_findings[0]["ok"] is False

def test_story_points_out_of_range_warns():
    story = {
        "title": "Reset password",
        "description": "A valid long description for password reset functionality.",
        "acceptance_criteria": ["Send reset email", "Validate password"],
        "story_points": 20,  # invalid
        "tags": ["chatgpt", "ai-story-gen"]
    }

    result = early_evals(story)
    sp_findings = [f for f in result["findings"] if f["id"] == "sp.range"]
    assert sp_findings and sp_findings[0]["ok"] is False
