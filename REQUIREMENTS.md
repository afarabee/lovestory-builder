# REQUIREMENTS.md

## Project Overview

This is an AI-powered Story Builder interface designed to help Product Owners generate, refine, and manage user stories with the assistance of large language models (LLMs). It includes structured prompts, version history, and collaborative AI chat features.

---

## Functional Requirements

### 1. Raw Input Entry (Initial View)
- Only the raw input fields are visible when the Story Builder loads or when a new user story is started.
- No user story details, dev notes, test data, or chat should be visible until the user clicks “Generate User Story.”

### 2. Generate User Story
- Upon clicking “Generate User Story,” the following UI sections appear:
  - User Story Details
  - Developer Notes
  - Push to ADO
  - Story Refinement Chat (open by default)
  - Test Data Panel (closed unless toggled open)

---

## Story Refinement Chat

### Visibility Rules
- Chat panel appears after generating the user story.
- Chat opens by default and can be collapsed horizontally.
- Chat collapse button should be more visually prominent.
- When collapsed, the Story Builder panel should expand to full width.
- Remove vertical expand/collapse button from chat.
- “Apply Suggestion” is only shown if the LLM provides an actionable update to:
  - Title
  - Description
  - Acceptance Criteria
- LLM suggestions should align with actions that are actually supported by the UI.
- Include “Undo Suggestion” button to reverse last applied suggestion.
- Chat should automatically scroll to the latest message.
- Include a “Scroll to Bottom” button when needed.

---

## Quick Actions (Sidebar)

1. **+ New User Story**
   - Triggers confirmation modal: “Are you sure you want to start a new story?”
   - Wipes out current draft and returns to raw input state.
2. **Restart Story**
3. **Show Test Data**
   - Moves test data toggle to sidebar.
   - No empty space should be reserved in layout unless Test Data is toggled open.
4. **Version History**
   - Available only in sidebar.
   - Clicking a version allows:
     - Restore Version → overwrites current story with selected version.
     - View Diff → shows test/mock diff of title, description, and AC compared to current.
   - No requirement for persistent draft saves, but version is auto-created:
     - On any story update
     - Or every X minutes (TBD)

---

## UI Cleanup and Layout

- Remove unneeded sidebar options (e.g., Settings, extra Version History)
- Keep Settings only in the top-right corner of the header
- Chat-related suggestion types should reflect actual interface capabilities only
- Hide success alerts like “Test Data Updated” unless essential

---

## Non-Functional

- Prompt templates must support mocking (no valid data required)
- LLM should handle garbage input and return diverse, realistic mock responses
- All data interactions (chat refinements, apply suggestion, etc.) should update test data mock
- No permanent storage required at this stage
- All visible data may be mocked/test content

---

_Last updated: 2025-07-28_
