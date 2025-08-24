# ✅ DEV_CHECKLIST.md

## 🧱 Foundational Setup
- [x] Project bootstrapped (React + TypeScript)
- [x] Component layout follows modular structure (`/components/story`, `/components/ui`, etc.)
- [x] Global styling consistent with design system
- [x] Routing and state management ready

---

## 🔄 New User Story Flow
- [x] `+ New User Story` button in header and sidebar
- [x] Triggers confirmation modal before clearing current story
- [x] Clears all story fields, test data, and chat when confirmed
- [x] Returns UI to fullscreen Raw Input state (no side panels)

---

## ✍️ Raw Input
- [x] Only visible on app load or when creating new story
- [x] Fields for Feature Name, Description, Role/Action/Goal
- [x] Full-screen until story is generated

---

## 📜 Story Generation
- [x] `Generate User Story` button reveals:
  - [x] User Story Details (title, description, AC)
  - [x] Dev Notes section
  - [x] Push to ADO section
  - [x] Chat panel (expanded by default)
- [x] Fields auto-filled with LLM output

---

## 💬 Story Refinement Chat
- [x] Opens automatically after generation
- [x] Horizontal collapse only (button styled clearly)
- [x] Collapsing chat expands Story Builder to full width
- [x] Auto-scrolls to latest message
- [x] Includes sticky "Scroll to Bottom" button
- [x] Filters repeated boilerplate messages (e.g., "I understand you want to refine...")
- [x] Supports mock/test responses for invalid input

### ✨ Chat Feature Logic
- [x] Apply Suggestion only appears if:
  - [x] Suggestion relates to title, description, or AC
  - [x] Test data update is supported (even if mocked)
- [x] Undo Suggestion appears after Apply, reverts to previous test state
- [x] Suggestions must align with UI capabilities (e.g., no "split story")

---

## 🧪 Test Data Viewer
- [x] Hidden by default
- [x] Only shown if toggled via `Show Test Data`
- [x] Updates when Apply Suggestion is triggered
- [x] No pop-ups or "test data updated" banners
- [x] Auto-hides if chat opens without manual test view

---

## 🕰️ Version History
- [x] Sidebar panel only (right panel removed)
- [x] Automatically snapshots on:
  - [x] Field content change (title, desc, AC)
  - [x] Optional: Autosave interval
- [x] Each version shows:
  - [x] Timestamp
  - [x] Field snapshot
  - [x] `Restore` button (replaces current fields)
  - [x] `Diff View` (shows all field changes, not just description)

---

## ⚙️ Project Settings Modal
- [x] Launches from top-right header only
- [x] Opens modal (not full page)
- [x] Persists until user exits manually
- [x] Contains:
  - [x] Project metadata fields
  - [x] Prompt behavior toggles
  - [x] GitHub integration fields

---

## ⚠️ UI Consistency & Constraints
- [x] ⚠️ AC warning icon shown only if title or description changed
- [x] Vertical collapse button removed from chat
- [x] Redundant right-side panels (e.g., version history) removed
- [x] Chat responses limited to what can be done in interface
