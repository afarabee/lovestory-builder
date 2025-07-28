# REQUIREMENTS.md

This document outlines all core functionality requirements for the **Story Generator** application.

---

## 🧭 Application Overview
The Story Generator allows users to create, refine, and manage user stories for software development. It includes real-time chat refinement, version history, test data management, and export capabilities.

---

## ✅ Core Features

### 1. Story Builder Interface
- Users can enter a raw user story input to generate a structured story.
- After generation, UI expands to show:
  - Title
  - Description
  - Acceptance Criteria (with add/remove/edit options)
  - Story Points dropdown
  - Developer Notes section
  - Push to Azure DevOps section

### 2. Story Refinement Chat
- Appears only after a story is generated.
- Automatically opens in expanded mode on first generation.
- Responds to user prompts to:
  - Refine acceptance criteria
  - Explore edge cases
  - Adjust story points
  - Provide implementation notes
- **Suggestions must match UI functionality** (e.g., no suggesting to split stories if UI doesn’t support it).
- **Apply Suggestion** is only visible when a suggestion is actually provided.
- **Undo Suggestion** reverts the last applied suggestion.
- Scroll-to-bottom behavior is supported.
- Collapsing the chat expands the Story Builder view to full width.

### 3. Left Navigation (Sidebar)
- Includes:
  - New User Story
  - Restart Story
  - Show Test Data (relocated from main panel)
  - Version History
- **Version History Functionality**:
  - A new version is saved whenever content is changed or autosaved.
  - Clicking a version shows a **Diff View** (mock or real).
  - Users can click "Restore Version" to overwrite current data.
  - "Apply Version" applies content without overwriting current draft.

### 4. Apply Suggestion Functionality
- Applies mock or real data updates to test data or user story fields.
- No backend confirmation (e.g., “Test Data Updated”) is shown.

### 5. Chat Prompt Behavior
- Handles junk input gracefully by returning mock suggestions.
- Limits repetition of stock phrases like “I understand you want to refine…”
- Always maintains 10+ mock suggestions in memory to respond with.

---

## ⛔️ Not Supported (Yet)
- Persistent save between browser sessions
- Splitting stories into multiple child stories
- ADO push integration (placeholder only)

---

## 📌 Visual / UI Requirements
- Chat auto-scrolls to latest message on input
- Chat supports a scroll-to-bottom button if disconnected
- Version History panel in the right sidebar is removed (only shown in left)
- Story Builder resizes dynamically based on chat panel state

---

## 📁 File Structure Expectations
- Components are modular (e.g., `SettingsModal`, `StoryBuilder`, `ChatPanel`, etc.)
- Prompting logic and test data updates are separated in backend handlers

---

Let me know if you need a condensed checklist version of this file for dev implementation or QA testing.