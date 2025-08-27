
# `generate_user_story()` – Field Reference and Flow Integration

This document describes the input fields, behavior, and output of the `generate_user_story` function used in the PO Toolkit App.

---

## 🧩 Input Fields and Their Purpose

- **`raw_input`**  
  The user’s freeform story request. Often incomplete or messy (e.g., “new login for suppliers, Q3 priority”). This becomes the primary task instruction for the AI. It doesn’t need to follow a specific format—GPT will structure it.

- **`context`**  
  A dictionary of project-specific metadata retrieved from the Knowledge Base in Step 3 of the flow. This includes the structured guidance the AI should follow:
    - `project_name`: Product or platform name (e.g., "Apollo")
    - `project_description`: Short summary of the product’s purpose
    - `persona`: Target user (e.g., "Lab Manager", "IT Buyer")
    - `tone`: Desired writing tone (e.g., "Professional", "Conversational")
    - `format`: Output structure (e.g., "User Story")
    - `style_preferences`, `compliance_notes`: Optional story guidance

- **`custom_prompt`** *(optional)*  
  Story-specific instructions from the user, layered on top of the default behavior. Used to tweak or override tone, focus, or structure. For example:  
  → “Focus on FDA compliance”  
  → “Use fewer technical terms”

- **`attachments_text`** *(optional)*  
  Summarized and sanitized content extracted from files uploaded by the user alongside their story request. These files are specific to the current task (e.g., annotated mockups, spreadsheets, technical specs). PII and unsupported formats are filtered out.

- **`kb_files_text`** *(optional)*  
  Summarized content from reusable project-linked documents (e.g., SOPs, architectural blueprints, reusable test strategies). These are tied to the selected project and loaded automatically in Step 3. Injected only if safe and relevant.

- **`model`**  
  Specifies which OpenAI model to use. Defaults to `"gpt-4o"` for structured, instruction-tuned generation. This can be overridden in advanced or experimental modes.

---

## ⚙️ How It Works

The function constructs a layered prompt by combining all available fields:

1. A **system instruction** sets GPT’s role:  
   → _“You are a senior Product Owner generating a user story…”_

2. The **context** dictionary is unpacked and included as a metadata block.

3. The **raw_input** is used as the core task.

4. The **custom_prompt**, if provided, is added last as a targeted modifier.

5. **attachments_text** and **kb_files_text**, if available, are injected into their own sections to provide implementation references and reusable knowledge.

The assembled payload is passed to the **OpenAI Responses API** like so:

```python
client.responses.create(
    instructions=...,   # role + metadata + formatting guidance
    model="gpt-4o",
    input=...,          # raw_input, context, attachments, etc.
)
```

The function then parses the JSON output and returns a validated story object.

---

### 📦 Sample Output
```json
{
  "title": "Enable MFA Enrollment from Login Screen",
  "description": "As a returning user, I want to enroll in multi-factor authentication during login so that my account is more secure.",
  "acceptance_criteria": [
    "Given a user is not enrolled, When they log in, Then they are prompted to enroll in MFA",
    "Given a user completes MFA setup, Then they return to their dashboard"
  ],
  "story_points": 5,
  "tags": ["security", "login"]
}
```

---

## 📊 Summary Table

| Field             | Purpose                                                                    |
|-------------------|-----------------------------------------------------------------------------|
| `raw_input`       | User’s core story request — messy or partial                                |
| `context`         | Product-level metadata: tone, persona, format, and KB guidance              |
| `custom_prompt`   | Optional story-specific instruction to steer the generation                 |
| `attachments_text`| Summarized content from files uploaded by the user for this story           |
| `kb_files_text`   | Summarized reusable content from project-linked documents                   |
| `model`           | Specifies which LLM to use (default: `"gpt-4o"`)                            |


## Code Example

```python
def generate_user_story(
    raw_input: str,
    context: dict,
    custom_prompt: Optional[str] = None,
    attachments_text: Optional[str] = None,
    kb_files_text: Optional[str] = None,
    model: str = "gpt-4o"
) -> dict:
    """
    Generates a structured user story using the OpenAI Responses API.

    This function composes a multi-layered instruction to guide the LLM in generating
    a complete, structured user story object. It uses the OpenAI `responses.create()` 
    method instead of the legacy `chat.completions` endpoint. The prompt includes 
    raw input from the user, backend-injected project context (via the Knowledge Base), 
    optional user file uploads, and optional project-linked documents (also from the Knowledge Base).

    --- Parameters ---

    raw_input : str
        The user’s freeform story input, often partial or informal. This is the core
        task instruction used to generate the story.

    context : dict
        A structured dictionary of project metadata from the Knowledge Base. 
        Common fields include:
            - project_name
            - project_description
            - persona
            - tone
            - format
            - style_preferences
            - compliance_notes

    custom_prompt : Optional[str]
        Optional user-supplied modifier to guide tone, emphasis, or framing.
        For example: "Emphasize FDA compliance" or "Use concise language".

    attachments_text : Optional[str]
        Text extracted and summarized from user-uploaded files specific to this story request.
        Typically includes requirements, mockups, or reference content. 
        Scrubbed for PII and summarized before injection.

    kb_files_text : Optional[str]
        Text extracted from files attached to the project context (Knowledge Base).
        Includes SOPs, architectural standards, or reusable patterns that should 
        apply to all stories in this project.

    model : str
        The LLM model used to generate the story (default: "gpt-4o").

    --- Responses API Usage ---

    - instructions: System role prompt ("You are a senior Product Owner...")
    - input: Combined raw_input, context, attachments_text, kb_files_text, and custom_prompt
    - model: AI model used
    - output_format: Expected structured response (JSON story)

    --- Returns ---

    A dictionary with the following story fields:
        {
            "title": "...",
            "description": "...",
            "acceptance_criteria": ["...", "..."],
            "story_points": 5,
            "tags": ["backend", "compliance"]
        }

  
    The output is passed to Early EVALS before display or use.
    """
```

