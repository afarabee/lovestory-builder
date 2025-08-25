# 💜 AI-Assisted User Story Generator

AI-assisted tool for generating, refining, and exporting Agile user stories into Azure DevOps (ADO).  
Built with **React + TypeScript + Vite**, styled with **Tailwind**, and extended with custom AI refinement logic.  

---

## 🚀 Features

### 🆕 New User Story Flow
- Start fresh with **raw input fields** (Role, Action, Goal, Benefit).  
- Confirmation modal appears before wiping a draft.  
- When confirmed → all fields cleared, chat reset, UI returns to fullscreen raw input.  

### 📖 User Story Generation
- **Generate User Story** button reveals:
  - User Story Details (Title, Description, Acceptance Criteria)  
  - Developer Notes  
  - Push to ADO section  
  - Story Refinement Chat (expanded by default)  
- Story Points auto-suggested but editable.  

### 💬 Story Refinement Chat
- Suggestions limited to **actions supported in UI** (update title, description, AC).  
- **Apply Suggestion** only shows when actionable.  
- **Undo Suggestion** reverts last change.  
- Auto-scrolls to latest message, with sticky **Scroll to Bottom** button.  
- Filters out repetitive phrases like *“I understand you want to refine…”*.  
- Accepts nonsense input but still returns mock refinement suggestions.  

### 🧪 Test Data
- Hidden by default; toggleable via sidebar.  
- Displays **sample inputs, edge cases, and mock API responses**.  
- Updates when suggestions are applied.  
- No “test data updated” pop-ups.  

### 🕰️ Version History
- **Sidebar only** (redundant right-hand card removed).  
- New snapshot created:
  - On field edits (Title, Description, AC).  
  - Or via optional autosave interval.  
- Each version includes:
  - Timestamp  
  - Diff view (shows all field changes, not just description)  
  - Restore button  

### ⚙️ Project Settings Modal
- Accessed via top-right header only.  
- Opens as modal (not full page).  
- Fields include:
  - Project metadata  
  - Prompt behavior toggles  
  - GitHub repo integration (Dev Notes & static project context)  

---

## 🛠️ Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)  
- [Vite](https://vitejs.dev/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [Lucide Icons](https://lucide.dev/)  
- [Lovable](https://lovable.dev/) for prototyping  

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+  
- npm v9+  

### Installation
```bash
# Clone repo
git clone https://github.com/afarabee/lovestory-builder.git

# Enter folder
cd lovestory-builder

# Install dependencies
npm install
