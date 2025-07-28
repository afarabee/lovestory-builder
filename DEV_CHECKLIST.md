
# ✅ Developer Checklist for StoryBuilder AI App

This checklist tracks feature completion, UI alignment, and behavior consistency based on current app requirements.

---

## 🔁 Core Flow

- [ ] **New User Story** button triggers confirmation modal before wiping data
- [ ] **Raw Input Fields Only** visible on new or initial load
- [ ] **Generate User Story** populates:  
  - [ ] Title  
  - [ ] Description  
  - [ ] Acceptance Criteria  
  - [ ] Dev Notes  
  - [ ] Push to ADO section  
  - [ ] Expands and opens Chat Panel

---

## 💬 Story Refinement Chat

- [ ] Chat panel is expanded by default after story is generated
- [ ] Vertical expand/collapse button removed
- [ ] Horizontal collapse button:
  - [ ] Visibly styled and placed
  - [ ] Fully collapses chat panel
  - [ ] Expands StoryBuilder panel to full width
  - [ ] Preserves chat history on re-expand
- [ ] Chat scroll behavior:
  - [ ] Automatically scrolls to new responses
  - [ ] "Scroll to Bottom" button appears when not at bottom
- [ ] Chat responses limited to actionable in-UI changes:
  - [ ] Title
  - [ ] Description
  - [ ] Acceptance Criteria
- [ ] Apply Suggestion:
  - [ ] Only visible when valid suggestion exists
  - [ ] Updates test data (mocked is fine)
  - [ ] Button label: `Apply Suggestion`
  - [ ] Undo button: `Undo Suggestion`
- [ ] LLM suggestions avoid repeating default phrasing
- [ ] Test data-related prompts are deprioritized unless explicitly relevant

---

## 🧪 Test Data Panel

- [ ] Hidden by default until "Show Test Data" is clicked
- [ ] Panel space not reserved if not visible
- [ ] Test data shows in right panel only when requested
- [ ] Test data mock is acceptable

---

## 🕓 Version History (Left Sidebar)

- [ ] Only version history appears in left sidebar
- [ ] New version auto-created:
  - [ ] On story content change  
  - [ ] Or via auto-save (every 2–5 mins)
- [ ] Version cards show:
  - [ ] Timestamp
  - [ ] Title snippet
  - [ ] Description
  - [ ] "Apply This Version" button
  - [ ] "Diff View" option showing field-level diffs

---

## 🧭 Quick Actions Sidebar

- [ ] Ordered as:
  1. `+ New User Story`
  2. `Restart Story`
  3. `Show Test Data`
- [ ] All actions functional and responsive
- [ ] "Quick Actions" always expanded (no collapse toggle)

---

## ⚙️ Settings

- [ ] Only accessible from top-right header
- [ ] Left nav settings entry removed

---

## 🔔 Alerts and Validation

- [ ] Warning on Acceptance Criteria shown ONLY when title/description changes
- [ ] "New User Story" triggers confirmation modal before clearing data

---

## 📦 Clean UI State

- [ ] On first load or new story, only raw input form visible
- [ ] No empty panels shown until triggered by interaction

---

## 📁 File Requirements

- [x] REQUIREMENTS.md up to date
- [ ] DEV_NOTES.md pending update after final features confirmed
