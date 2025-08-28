
# `generate_user_story()` – Field Reference and Flow Integration

This document describes the input fields, behavior, and output of the `generate_user_story` function used in the PO Toolkit App.

---

## ⚙️ How It Works

The function constructs a layered prompt by combining all available fields:

1. A **system instruction** sets GPT’s role:  
   → _“You are a senior Product Owner generating a user story…”_

2. The **context** dictionary is unpacked and **kb_files_text** is injected and included as a metadata block.

3. The **raw_input** is used as the core task.

4. The **custom_prompt**, if provided, is added last as a targeted modifier.

5. **file_content**, if available, is injected into its own section to provide implementation references and reusable knowledge.

---

## 🔍 Input Fields

### Story-Specific

- **`raw_input`**  
  The user’s freeform story request. Often incomplete or messy (e.g., “new login for suppliers, Q3 priority”). This becomes the primary task instruction for the AI. It doesn’t need to follow a specific format—GPT will structure it.

- **`custom_prompt`** *(optional)*  
  Story-specific instructions from the user, layered on top of the default behavior. Used to tweak or override tone, focus, or structure. For example:  
  → “Focus on FDA compliance”  
  → “Use fewer technical terms”

- **`file_content`** *(optional)*  
  Summarized and sanitized content extracted from files uploaded by the user alongside their story request. These files are specific to the current task (e.g., annotated mockups, spreadsheets, technical specs). PII and unsupported formats are filtered out.

### Project-Settings

- **`context`**  
  A dictionary of project-specific metadata retrieved from the Knowledge Base in Step 3 of the flow. This includes the structured guidance the AI should follow:
    - `project_name`: Product or platform name (e.g., "Apollo")
    - `project_description`: Short summary of the product’s purpose
    - `tone`: Desired writing tone (e.g., "Professional", "Conversational")
    - `format` (or 'style guidelines'): Output structure (e.g., "User Story")

- **`kb_files_text`** *(optional)*  
  Summarized content from reusable project-linked documents (e.g., SOPs, architectural blueprints, reusable test strategies). These are tied to the selected project and loaded automatically in Step 3. Injected only if safe and relevant.

---

## 📊 Summary Table

| Field             | Purpose                                                                    |
|-------------------|-----------------------------------------------------------------------------|
| `raw_input`       | User’s core story request — messy or partial                                |
| `custom_prompt`   | Optional story-specific instruction to steer the generation                 |
| `file_content`    | Summarized content from files uploaded by the user for this story           |
| `context`         | Product-level metadata: tone, format, and KB guidance                       |
| `kb_files_text`   | Summarized reusable content from project-linked documents                   |

---

## Code Snippet (Simplified)

```python
response = client.responses.create(
    model="gpt-4o",
    instructions=instruction,
    input={
        "raw_input": raw_input,
        "context": context,
        "file_content": file_content,
        "custom_prompt": custom_prompt,
        "kb_files_text": kb_files_text
    },
    temperature=0.0
)
```
