# AI-Assisted User Story Flow (Markmap View)

## Step-by-Step Flow

### 1. App Initialization
- Display only Raw Input
- No LLM call yet

### 2. User Completes Raw Input Form
- Enters Role, Goal, Benefit
- Passes input to LangChain
- Uses PromptTemplate

### 2.5 Inject Project Settings
- Project metadata
- AI preferences (tone, format)
- File library content
- Adds to prompt prefix

### 3. LLM Generates Story
- LLMChain or ChatOpenAI
- Output: title, description, acceptance criteria

### 4. UI Updates with Story
- Populate Story Details panel
- Expand Chat Panel
- Show Session Data Viewer (if toggled)

### 5. Chat Panel Activated
- User types refinement suggestions
- Routed to refinement prompt

### 6. LangChain Handles Refinement
- Inject current story + user input into template
- Route by field (title, desc, AC)
- Return suggestion only

### 7. Suggestion Displayed
- If actionable → show Apply + Undo
- Store to session data only

### 8. Apply Suggestion
- Updates session data
- Updates UI (not saved yet)

### 9. Version Snapshot Triggered
- Auto-create snapshot on update
- Save to internal history

### 10. Push to ADO (future)
- Manual step
- Send fields via ADO API
- Optional: AI formats commit message

## Optional: RAG Enhancements
- Between Steps 2–3: Retrieve past stories
- In Chat: Use vector search for similar refinements
