
# 💡 `generate_recommendations()` – Function Reference

This function analyzes the current user story and provides **1–3 improvement suggestions**, each with a:
- Title (summary)
- Description (why it's helpful)
- Proposed change as JSON

---

## 🧠 How It Works

This function analyzes the current user story and provides recommendations to improve INVEST quality, clarity, or testability.

### 🔍 Inputs

| Field            | Purpose                                         |
|------------------|-------------------------------------------------|
| `story`          | The current user story (full JSON)              |
| `context`        | Metadata for tone and structure alignment       |
| `kb_files_text`  | Reusable program guidance or conventions        |
| `file_content`   | User-uploaded content specific to the task      |
| `model`          | LLM to use (default: `"gpt-4o"`)                |

### 🧠 Prompt Structure

```plaintext
You are an AI Product Partner helping improve a user story.

Story:
{story}

Provide up to 3 recommendations. For each, return:
- title
- description
- changes: JSON patch (partial fields)

Include project context and reusable files:
- Project: {project_name}
- Format: {format}
- Guidance: {kb_files_text}
```

### 📦 Sample Output

```json
{
  "recommendations": [
    {
      "title": "Clarify Acceptance Criteria",
      "description": "Improve clarity by splitting vague ACs into specific testable steps.",
      "changes": {
        "acceptance_criteria": [
          "- User receives MFA email within 60 seconds",
          "- Email expires in 10 minutes"
        ]
      }
    }
  ]
}
```

### 🧩 How It’s Used

- Appears as a “Get AI Suggestions” button in the chat panel
- Each recommendation is previewed in UI
- If applied, it’s passed to `build_suggestion()` for diff display

---

*Generated with assistance from ChatGPT and Edited by Me*
