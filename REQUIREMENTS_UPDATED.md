# 📋 REQUIREMENTS.md

## Overview
This document outlines the **complete functional, behavioral, and UI/UX requirements** for the `lovestory-builder` application — an AI-assisted tool that generates, refines, and manages agile user stories.

---

## 1. 🧭 Application Navigation

- **Initial Load Behavior**:
  - When app loads or user starts a new story, only the **Raw Input** section is visible (full screen width).
  - Sections like **User Story Details**, **Dev Notes**, **Push to ADO**, **Chat**, and **Test Data** should be hidden.

- **Sidebar (Left Navigation)**:
  - Contains the following Quick Action buttons:
    1. `+ New User Story`
    2. `Restart Story`
    3. `Show Test Data`
    4. `Version History`
  - Version History button opens a history panel.

- **Header (Top Right Controls)**:
  - `+ New User Story` (identical to sidebar action)
  - `Settings` (opens global project configuration modal)

---

## 2. 🏗️ Story Generation Workflow

### Step 1: Raw Input
- Fields:
  - Feature Name
  - Feature Description
  - Role / Action / Goal trio
- Once filled, user clicks `Generate User Story`

### Step 2: Story Generation
- Triggering this reveals:
  - **User Story Details** panel (populated with title, description, and acceptance criteria)
  - **Dev Notes** section (optional technical context)
  - **Push to ADO** integration (placeholder)
  - **Story Refinement Chat** panel (expanded by default)
  - **Test Data Viewer** (if previously toggled)

---

## 3. 💬 Story Refinement Chat

- Auto-expands when a story is generated.
- Collapse behavior:
  - Horizontal collapse button only (visible and styled clearly)
  - When collapsed, story builder expands to full screen
- **Chat Features**:
  - Users can type freeform refinement requests
  - Chatbot can return:
    - Description suggestions (✔️ Apply Suggestion button shown)
    - Title suggestions (✔️ Apply Suggestion button shown)
    - Acceptance criteria suggestions (✔️ Apply Suggestion shown)
    - General guidance (no Apply button)
- Apply Suggestion behavior:
  - Updates **only** the test data in memory (not saved anywhere permanent)
  - Must be tied to valid suggestion type (title, description, AC)
  - ❌ No suggestion = no button shown
- Undo Suggestion:
  - Shows as a button immediately after an applied change
  - Clicking it reverts test data to prior state
- Chat should not repeat the same phrase too often (e.g., "I understand you want to refine...")
- Chat should focus suggestions on Title, Description, and AC — not Test Data
- Chat must respond to nonsense input by mocking realistic suggestions for demo purposes
- Add sticky `Scroll to Bottom` button and auto-scroll to newest message

---

## 4. 🧪 Test Data Viewer

- Initially hidden
- Can be toggled on via `Show Test Data` button in sidebar
- Only visible after story is generated
- Automatically disappears if not manually enabled and chat is opened
- Purpose:
  - Shows internal test data structure used by chat
  - Allows Apply Suggestion to update it
- No banner or "test data updated" messages should be shown to user

---

## 5. 🕰️ Version History

- Located in the **sidebar**
- Behavior:
  - Creates new version snapshot automatically:
    - On every content update to title, description, or AC
    - Or at defined intervals (e.g. every 2 mins) if autosave is configured
- Each version includes:
  - Timestamp
  - Snapshot of title, description, AC
- Options per version:
  - `View Diff`: opens side-by-side comparison showing changes in all fields
  - `Restore`: Replaces current story with that version’s data
  - `Apply this version`: Applies story content but leaves view open

---

## 6. 🛠️ Settings

- Only accessible from top right header
- Opens modal overlay
- Fields include:
  - Project metadata
  - GitHub repo integration (optional)
  - Prompting behavior preferences
  - File library for knowledge base
- Must remain open until user explicitly exits

---

## 7. 🧼 New User Story Flow

- Action from header or sidebar
- Displays confirmation modal:
  - "Are you sure you want to start a new story? This will clear your draft."
  - Buttons: `Cancel`, `Confirm`
- On Confirm:
  - Clears current story, test data, and chat history
  - Reverts UI to show **only Raw Input** full screen
  - Chat panel, story details, dev notes, and ADO sections must be hidden again

---

## 8. 🔄 General UI Rules

- No vertical expand/collapse buttons for chat
- Collapsing chat horizontally should:
  - Hide panel entirely
  - Expand Story Builder view to full width
- Chat panel should **auto-scroll** to show latest response
  - Include sticky `Scroll to Bottom` button
- Avoid repeated phrases like "I understand you want to refine..."

---

## 9. 📦 Miscellaneous Requirements

- Only show the ⚠️ AC warning icon if title or description has changed
- Suggestions from chat must reflect capabilities of current UI (e.g. no "split into multiple stories")
- Diff views in Version History must show all changed fields, not just description
- All "Apply Suggestion" operations must be constrained to test data fields and not shown if the suggestion isn’t actionable in the UI

