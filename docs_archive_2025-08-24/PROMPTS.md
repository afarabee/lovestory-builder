# 🧠 PROMPTS.md

This file contains all literal prompt templates used by the `lovestory-builder` application for AI-assisted user story generation and refinement. These are designed for use with LangChain's `PromptTemplate` or equivalent components, with dynamic variables injected based on project settings, user input, and UI state.

###File needs to be updated to include retrieval functions###

---

## 📌 `generate_user_story_prompt`

Used to create the initial user story from Raw Input fields, incorporating project settings, user persona context, and tone/format preferences.

```
You are helping write a user story for the project "{{project_name}}".

Project Description:
{{project_description}}

User Persona:
{{relevant_persona}}

AI Preferences:
- Tone: {{tone}}
- Format: {{format}}

Now generate a user story using the following format:
"As a {{role}}, I want to {{goal}} so that {{benefit}}."

Only return the formatted user story sentence. Do not include explanation or justification.
```

---

## ✍️ `refine_user_story_prompt`

Used when a user requests a change to the story title, description, or acceptance criteria via the chat panel. Injects current values and the user's request into the prompt.

```
You are helping refine an agile user story. Here is the current version:

Title: {{title}}
Description: {{description}}
Acceptance Criteria: {{acceptance_criteria}}

The user has requested the following change:
"{{user_input}}"

Please suggest an improved version of the field that best fits their request.

Only return the new version of the affected field. Do not modify unrelated fields. Do not include any commentary or rationale.
```

---

## 🛠️ `dev_notes_prompt` *(Optional Future Prompt)*

Generates optional developer context or implementation notes based on the story details and project context.

```
You are a technical writer generating Dev Notes for the following user story:

Title: {{title}}
Description: {{description}}
Acceptance Criteria: {{acceptance_criteria}}

Project Description:
{{project_description}}

Provide a short list of technical considerations or backend implementation notes. Use concise bullet points. Do not restate the user story.
```

---

## ✅ `acceptance_criteria_improvement_prompt` *(Optional)*

Used to improve or expand the acceptance criteria with better clarity, structure, or coverage.

```
Improve or expand the acceptance criteria for this user story.

Title: {{title}}
Description: {{description}}
Current Acceptance Criteria:
{{acceptance_criteria}}

Keep them clear, concise, and testable. Return only the updated list of acceptance criteria in bullet point format.
```

---

## 📦 Variable Notes

- `{{project_name}}`, `{{project_description}}` — come from Project Settings
- `{{relevant_persona}}` — injected from file library based on feature context
- `{{tone}}`, `{{format}}` — pulled from AI preferences in Project Settings
- `{{role}}`, `{{goal}}`, `{{benefit}}` — entered by user in Raw Input
- `{{title}}`, `{{description}}`, `{{acceptance_criteria}}` — come from current story state
- `{{user_input}}` — chat message entered by user

---

These prompts are modular and designed to be reusable across multiple stages of the user story lifecycle.
