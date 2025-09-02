# test_story_suggestion.py
# Pytest scaffold for build_suggestion and apply_suggestion

import pytest
from story_suggestion import build_suggestion, apply_suggestion

def test_build_suggestion_full_scope():
    before = {"title": "Old", "tags": ["a"]}
    after = {"title": "New", "tags": ["a"]}
    suggestion = build_suggestion(before, after, scope="full")

    assert suggestion["scope"] == "full"
    assert suggestion["diff"][0]["op"] == "replace"
    assert suggestion["diff"][0]["path"] == "/title"
    assert suggestion["after"]["title"] == "New"

def test_build_suggestion_field_scope():
    before = {"title": "Old"}
    after = {"title": "New"}
    suggestion = build_suggestion(before, after, scope="field", field_name="title")

    assert suggestion["scope"] == "field"
    assert suggestion["field_name"] == "title"
    assert suggestion["diff"][0]["path"] == "/title"

def test_apply_suggestion_updates_story():
    before = {"title": "Old"}
    after = {"title": "New"}
    suggestion = build_suggestion(before, after, scope="full")
    updated_story = apply_suggestion(before, suggestion)

    assert updated_story["title"] == "New"

def test_apply_suggestion_drift_warning(capsys):
    before = {"title": "Original"}
    after = {"title": "Updated"}
    suggestion = build_suggestion(before, after, scope="full")

    # Simulate drift: current story differs from suggestion.before
    current_story = {"title": "Changed outside suggestion"}
    apply_suggestion(current_story, suggestion)

    captured = capsys.readouterr()
    assert "differs from the suggestion's 'before'" in captured.out

def test_apply_invalid_suggestion():
    before = {"title": "Original"}
    suggestion = {"after": "invalid"}  # malformed after field

    with pytest.raises(ValueError):
        apply_suggestion(before, suggestion)
