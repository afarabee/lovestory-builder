
# 🛠️ `refine_story()` and `refine_field()` – Field Reference and Flow Integration

This document outlines how the refinement functions operate, including prompt structure, inputs, outputs, and how they align with the broader PO Toolkit App flow.

---

## ⚙️ How It Works

Both functions are used **after a story is initially generated**, allowing the user to refine the content either holistically (`refine_story`) or in part (`refine_field`).

The process follows this layered structure:

1. A **system instruction** sets GPT’s role (e.g., "You are refining a user story...")
2. The **original story JSON** is included as the base context
3. The **user instruction** is injected (e.g., “Make the ACs more specific”)
4. The **context** dictionary is unpacked, and `kb_files_text` is included for reusable knowledge
5. **file_content**, if available, is injected separately for task-specific references

The resulting output is a new version of the story or field, returned in structured JSON.

---

## 🔍 Input Fields

### Shared by Both Functions

| Field           | Purpose |
|------------------|---------|
| `story`          | The current story to refine; passed as structured JSON |
| `instruction`    | User's instruction on what to improve (e.g., "Simplify ACs") |
| `context`        | Project-level metadata (project_name, description, tone, format) |
| `kb_files_text`  | Reusable project documents (SOPs, architecture, etc.) |
| `file_content`   | Story-specific files (e.g., mockups, custom inputs) |
| `model`          | LLM to use (default: `"gpt-4o"`) |

### Specific to `refine_field(...)`

| Field           | Purpose |
|------------------|---------|
| `field_name`     | Which field to refine (e.g., "acceptance_criteria") |
| `current_value`  | The current value of that field (string or list) |

---

## ✂️ When to Use Which

| Function         | Use Case                                                  | Input Scope     | Output           |
|------------------|------------------------------------------------------------|------------------|------------------|
| `refine_story`   | User wants to revise the **entire story** (e.g., tone, clarity, AC) | Full JSON story | Full updated story |
| `refine_field`   | User wants to update **only a single field**               | Single field     | `{ "field": value }` |

---

## 🧠 Prompt Structure

Each function uses a structured prompt like:

```plaintext
You are refining a user story.

Existing story:
{story}

User instruction:
"Make the acceptance criteria clearer."

Project Context:
- Project: Apollo
- Description: Customer-facing self-service platform
- Tone: Professional
- Format: User Story
- Project Files: {kb_files_text}

Attached file content (if any):
{file_content}

Return the full updated story as JSON.
```

---

## 📊 Summary Table

| Function         | What It Refines | Input Shape             | Output Shape          | GPT Call | Part of Chat Loop? |
|------------------|------------------|--------------------------|------------------------|----------|---------------------|
| `refine_story`   | Full story       | Story + instruction      | Full story JSON        | ✅ Yes   | ✅ Yes              |
| `refine_field`   | Single field     | Field + instruction      | Partial field JSON     | ✅ Yes   | ✅ Yes              |

---

## 📦 Sample Output (refine_story)

```json
{
  "title": "Enable MFA from Login Screen",
  "description": "As a returning user, I want to set up MFA during login for added security.",
  "acceptance_criteria": [
    "- User sees MFA prompt if not enrolled",
    "- Enrolled users bypass prompt",
    "- System logs MFA enrollment status"
  ],
  "story_points": 5,
  "tags": ["security", "login"]
}
```

---

## 🚫 Prompt Guardrails

- Output must be JSON
- No `definition_of_done`
- No Gherkin syntax (Given/When/Then)
- Format ACs as plain bullets
- Must preserve required fields (Title, Description, ACs, Points, Tags)

---

*Generated with assistance from ChatGPT and Edited by Me*
