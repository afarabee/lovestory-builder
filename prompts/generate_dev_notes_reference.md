
# 🧪 `generate_dev_notes()` – Function Reference

This function adds **developer-facing guidance** based on the finalized user story.

---

## 🧠 How It Works

GPT returns implementation notes for developers based on the story content and surrounding context.

### 🔍 Inputs

| Field            | Purpose                                      |
|------------------|----------------------------------------------|
| `story`          | Current story (finalized or in-draft)        |
| `context`        | Project context (tone, tech focus)           |
| `kb_files_text`  | Persistent standards / architectural rules   |
| `file_content`   | Story-specific requirements / mockups        |
| `model`          | LLM to use (default: `"gpt-4o"`)             |

### 🤖 Prompt Example

```plaintext
You are a senior developer generating notes for implementation.

Story:
{story}

Attached file references:
{file_content}

Guidance:
{kb_files_text}

Return JSON with a list of dev_notes.
```

### 📦 Sample Output

```json
{
  "developer_notes": [
    "Trigger MFA setup only for unauthenticated users.",
    "Use `AuditLogService` for MFA logging.",
    "Frontend: Extend login modal to support MFA overlay."
  ]
}
```

### 📌 Display Behavior

- Dev Notes appear as a non-editable section in the UI
- Generated automatically after Apply or on demand
- Stored alongside story in history/snapshot

---

*Generated with assistance from ChatGPT and Edited by Me*
