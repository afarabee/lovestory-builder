# 📘 End-to-End Flow: AI-Assisted User Story Creation with Project Context Integration

This document outlines the complete step-by-step flow of how the `lovestory-builder` application generates and refines user stories using LLMs, LangChain, and project-aware context. Each step includes what’s happening in the system, what data is being passed, and which AI components or frontend modules are involved.

---

## 🔁 Step-by-Step Flow

### **1. App Initialization**
- **User opens app or clicks `+ New User Story`**
- UI displays only `Raw Input` section (Role, Action, Goal, Feature Name/Description)
- 🔄 _No LLM handoff yet_  
- 🖥️ **Component**: React UI + global state reset

---

### **2. User Completes Raw Input Form**
- User enters:
  - Role: _e.g., “Admin”_
  - Goal: _e.g., “reset a password”_
  - Benefit: _e.g., “so users don’t contact support”_
- ✅ Form validation confirms readiness for generation
- 🔄 Passes structured values to LangChain
- 🧩 **LangChain Component**: `PromptTemplate` injects values into story generation prompt  
- 📎 **Prompt Ref**: `generate_user_story_prompt`



---

### **2.5. Inject Project Settings into Prompt Context**
- System checks active Project Settings:
  - Project name and description
  - AI prompting preferences (tone, format, language)
  - Relevant content from file library (e.g., persona definitions, style guides)
- Gathers this into a dynamic system prompt or prefix block:
  - Example:
    ```
    You are helping write a user story for the project "Tox Studies Dashboard".

    Project Description:
    A digital reporting and visualization tool for toxicology study directors.

    User Persona:
    Study Director - responsible for reviewing study results and sharing data with sponsors.

    AI Preferences:
    - Tone: Professional and concise
    - Format: Must follow: "As a [user], I want [goal] so that [benefit]".
    ```
- If project has uploaded files:
  - Extract text
  - Chunk into passages
  - Generate embeddings
  - Query vector DB using prompt context
  - Inject top-N matches into LLM prompt
- This context is prepended to the prompt before calling the LLM
- Use embeddings to retrieve relevant stories from past examples (RAG input boost)
- Construct final system prompt (prepended)
- Component: `PromptTemplate` + `VectorStoreRetriever`

---

### **3. LLM Generates Story**
- LangChain calls the LLM (e.g., OpenAI) with formatted prompt
- LLM returns story output
- 🧠 **Component**: `ChatOpenAI` or `LLMChain`
- 🔄 Output returned as: `story_title`, `story_description`, `acceptance_criteria`

---

### **4. UI Updates with Generated Content**
- Story Builder panels reveal:
  - 📝 User Story Details (auto-filled)
  - 🛠️ Dev Notes (optional prompt-based)
  - 🔄 Push to ADO (integration placeholder)
  - 💬 Chat panel (auto-expanded)
  - 🧪 Test Data Viewer (if toggled previously)
- 🔄 LLM output → React state injection  
- 🖥️ **Component**: UI rendering only; no AI here

---

### **5. Chat Panel Activated for Refinement**
- User can now type freeform suggestions, like:
  - “Make the title more concise”
  - “Add another acceptance criterion”
- 🔄 User input → LangChain chain  
- 🧠 **Component**: `ConversationalChain` or custom chain
- 📎 **Prompt Ref**: `refine_user_story_prompt`

---

### **6. LangChain Routes Refinement Requests**
- Injects message + current field context into refinement prompt
- Example prompt:
  ```
  Based on the original story:
  Title: {{title}}
  Description: {{description}}
  AC: {{acceptance_criteria}}
  The user has asked: "{{user_input}}"
  Suggest an improvement ONLY to the {{field}}. Return suggestion only.
  ```
- Let LangChain retrieve similar refinements from a vector DB before prompting
- 🔄 Component: `VectorStoreRetriever` + `StuffDocumentsChain` or `RetrievalQA`
- Optionally query RAG context again
- Return improved field
- 🧠 **Component**: `LLMChain` + conditional routing logic (e.g., classify → rewrite)
- 🔄 Output = new field value

---

### **7. Story Suggestion Returned + Previewed**
- If actionable (e.g., title/desc/AC), shows:
  - ✔️ `Apply Suggestion`
  - ↩️ `Undo Suggestion` (after apply)
- 🔄 Output → temporary test data only (not yet saved)
- 🖥️ **Component**: React UI + test state manager

---

### **8. Apply Suggestion (Optional)**
- User clicks ✔️
- 🔄 Suggestion is applied to in-memory test data
- 🧪 Test Data Viewer updates silently
- 🖥️ **Component**: UI + state manager (no AI)

---

### **9. Version Snapshot Automatically Triggered**
- Auto-saves current state when title/desc/AC is updated
- Stores snapshot with timestamp
- 🔄 Snapshot stored in local/project state
- 🖥️ **Component**: Internal history manager (no AI)

---

### 10. Generate Developer Notes (Optional)
- User clicks `Generate Developer Notes`
- System sends:
  - Story title
  - Description
  - Acceptance Criteria
- LangChain queries GitHub repo via integration
- LLM returns:
  - Relevant code areas
  - Suggested changes
  - Implementation hints
- Dev Notes appended to the Description field
- Component: GitHub connector + LangChain

---

### **11. Push to ADO (Manual/Planned)**
- User clicks Push to ADO
- Fields sent to ADO:
  - Title
  - Description (with Dev Notes if added)
  - Acceptance Criteria
  - Tags, Iteration Path
- Optional: LLM can summarize for commit messages or ticket descriptions
- Component: ADO API integration

---

## ✨ Optional RAG Enhancement Points (Future/Advanced)

If you integrate RAG down the line, here’s where it would fit:

- **Between Steps 2–3**: Use embeddings to retrieve relevant stories from past examples (RAG input boost)
- **In Chat Refinement**: Let LangChain retrieve similar refinements from a vector DB before prompting
- 🔄 Component: `VectorStoreRetriever` + `StuffDocumentsChain` or `RetrievalQA`
