# AI-Assisted User Story Flow (Markmap View)

## Step-by-Step Flow

### 1. App Initialization
- Display only Raw Input
- No AI processing yet

### 2. User Completes Raw Input Form
- Enters Role, Goal, Benefit
- Input is passed to backend service
- Backend prepares data for prompt generation

### 2.5 Inject Project Settings and Context
- Include project metadata (name, personas, domain)
- Apply AI preferences (tone, structure, format)
- If files exist, retrieve relevant content
- Assemble all into a structured system prompt

### 3. AI Generates Story
- Prompt is sent to the model (e.g., OpenAI)
- Output: title, description, acceptance criteria, story points

### 4. UI Updates with Story
- Populate Story Details panel
- Display Dev Notes button
- Expand Chat Panel
- Show Session Data Viewer if toggled

### 5. Chat Panel Activated
- User types refinement suggestions
- Request sent to backend for re-generation

### 6. Backend Handles Refinement
- Build new prompt using story + user input
- If needed, re-query relevant context
- Return only the improved field

### 7. Suggestion Displayed
- If actionable → show Apply and Undo
- Update session data only (not saved)

### 8. Apply Suggestion
- Updates session data
- UI reflects changes

### 9. Version Snapshot Triggered
- Automatically snapshot story content on update
- Store timestamped version in session history

### 10. Push to ADO
- User clicks Push to ADO
- Send final story fields via ADO integration
- Optional: Add commit message or tagging

## Optional: Contextual Enhancements
- Retrieve file-based context when story is first generated
- Use retrieved examples to support refinement requests
