# 📋 REQUIREMENTS.md

## Overview
This document outlines the complete functional, behavioral, and UI/UX requirements for the Story Builder application — an AI-assisted tool that generates, refines, and manages agile user stories, and pushes finalized stories to Azure DevOps (ADO) as Product Backlog Items (PBIs).

---

## 1. 🧭 Application Navigation

- **Initial Load Behavior**:
  - When app loads or user starts a new story, only the **Raw Input** section is visible (full screen width).
  - Sections like **User Story Details**, **Dev Notes**, **Push to ADO**, **Chat**, and **Session Data** should be hidden.

- **Sidebar (Left Navigation)**:
  - Contains the following Quick Action buttons:
    1. `+ New User Story`
    2. `Restart Story`
    3. `Show Session Data`
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
  - **Session Data Viewer** (if previously toggled)

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
  - Updates **only** the session data in memory (not saved anywhere permanent)
  - Must be tied to valid suggestion type (title, description, AC)
  - Suggestions without actionable content do not show the Apply button.
- Undo Suggestion:
  - Shows as a button immediately after an applied change
  - Clicking it reverts session data to prior state
- Avoid repetitive phrases like “I understand you want to refine…” to keep interaction natural.
- Chat should focus suggestions on Title, Description, and AC — not session Data
- Chat must respond to nonsense input by mocking realistic suggestions for demo purposes
- Add sticky `Scroll to Bottom` button and auto-scroll to newest message

---

## 4. 🧪 Session Data Viewer
- The term “Session Data” is the canonical name for the in-memory, editable story state used during refinement and chat interactions. All references to previous terms such as “Test Data” must be replaced consistently to avoid ambiguity.
- Initially hidden
- Can be toggled on via `Show Session Data` button in sidebar
- Only visible after story is generated
- Automatically disappears if not manually enabled and chat is opened
- Purpose:
  - Shows internal session data structure used by chat
  - Allows Apply Suggestion to update it
- No banner or "session data updated" messages should be shown to user

---

## 5. 🕰️ Version History

- Located in the **sidebar**.
- Automatically creates new version snapshots:  
  - On every update to Title, Description, or Acceptance Criteria, debounced to no more than once every 10 seconds to avoid excessive snapshots during rapid edits.
  - At set intervals (e.g., every 2 minutes) while the user is actively editing.
- The system retains a maximum of 50 snapshots per story, pruning oldest versions automatically.
- Each version snapshot includes:  
  - Timestamp  
  - Snapshot of Title, Description, and Acceptance Criteria as they existed at the time
- Per-version options:  
  - `View Diff`: opens side-by-side comparison of changes across all fields  
  - `Restore`: replaces current story with that version’s data, **after user confirmation**  
  - `Apply this version`: applies story content, **after user confirmation**, and keeps version history open for further review  
- Confirmation dialogs for Restore and Apply include **Confirm** and **Cancel** buttons; Cancel aborts action and keeps the view open.  
- Users exit version history via the **Close** button or **Escape** key, without further prompts.
- All interactions support keyboard and screen reader accessibility.

---

## 6. 🛠️ Settings

- Only accessible from top right header
- Opens modal overlay that blocks interaction with the main UI until explicitly closed by the user
- Fields include:
  - Project Metadata
  - Azure DevOps (ADO) Integration
  - GitHub Repository Integration (used for Developer Notes generation)
  - Prompting Behavior Preferences
  - File Library for Knowledge Base
- All project settings and uploaded files must be incorporated into the prompt context.
- File uploads require a RAG pipeline: extracted, chunked, embedded, and queried at runtime.
- Must remain open until user explicitly exits

---

## 7. 🧑‍💻 Developer Notes

- After generating a user story, users can optionally click `Generate Developer Notes`.
- This triggers a call to the integrated GitHub repository using the following as input:
  - Story title
  - Description
  - Acceptance Criteria
- The system queries the codebase and suggests:
  - Relevant files, functions, or modules likely impacted
  - Code patterns or areas to update
  - High-level implementation ideas or steps
- Output is formatted and **appended to the story’s Description field** before pushing to ADO.
- Developer Notes are visible in the UI and editable prior to push.

---

## 8. 🧼 New User Story Flow

- Action from header or sidebar
- Displays confirmation modal:
  - "Are you sure you want to start a new story? This will clear your draft."
  - Buttons: `Cancel`, `Confirm`
- On Confirm:
  - Clears current story, session data, and chat history
  - Reverts UI to show **only Raw Input** full screen
  - Chat panel, story details, dev notes, and ADO sections must be hidden again

---

## 9. 🔄 General UI Rules

- No vertical expand/collapse buttons for chat
- Collapsing chat horizontally should:
  - Hide panel entirely
  - Expand Story Builder view to full width
- Chat panel should **auto-scroll** to show latest response
  - Include sticky `Scroll to Bottom` button
- Avoid repeated phrases like "I understand you want to refine..."

---

## 10. 📦 Miscellaneous Requirements

- Only show the ⚠️ AC warning icon if title or description has changed
- Suggestions from chat must reflect capabilities of current UI (e.g. no "split into multiple stories")
- Diff views in Version History must show all changed fields, not just description
- All "Apply Suggestion" operations must be constrained to session data fields and not shown if the suggestion isn’t actionable in the UI

---

## 11. ADO Requirements

- Creating a work item via push to ADO results in a Product Backlog Item (PBI) of type “Story” within the Area Path defined in the Story Builder’s Project Settings.
- The Iteration Path and Tags applied in ADO exactly match those specified in the Story Builder configuration for the story.
- The “chatgpt” tag (case-sensitive) is automatically added to every created story in ADO.
- The Created By field on the ADO story correctly reflects the user’s name who performed the push, not a system or service account.
- All Acceptance Criteria are formatted as bullet points, preserving clear, individual criteria lines within the story.
- If Developer Notes were generated, they are appended to the Description field in ADO.
