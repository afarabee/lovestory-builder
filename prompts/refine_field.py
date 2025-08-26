# refines a single field in the story

from openai import OpenAI
import json

client = OpenAI()  # use env var OPENAI_API_KEY

def pretty_print(output: str):
    try:
        parsed = json.loads(output)
        return json.dumps(parsed, indent=2)
    except Exception:
        return output.strip()

# Whitelist to prevent arbitrary field edits
# Note: 'definition_of_done' has been removed for consistency.
ALLOWED_FIELDS = {"title", "description", "acceptance_criteria", "story_points", "tags"}

def refine_field(
    existing_story: dict,
    field_name: str,
    user_instruction: str,
    model: str = "gpt-4o"
):
    """
    Refine exactly one field. Returns {field_name: new_value} if JSON; else pretty text.
    """
    if field_name not in ALLOWED_FIELDS:
        raise ValueError(f"Field '{field_name}' is not editable. Allowed: {sorted(ALLOWED_FIELDS)}")

    current_value = existing_story.get(field_name)

    prompt = f"""You are refining ONE field of a user story.

Field: {field_name}
Current value:
{json.dumps(current_value, indent=2) if not isinstance(current_value, str) else current_value}

User request: {user_instruction}

Rules:
- Modify ONLY this field.
- Keep the data type: 
  - title/description => string
  - acceptance_criteria/tags => array of strings
  - story_points => integer 1–13
- Return JSON with ONLY this key.

Return JSON like:
{{ "{field_name}": <new_value> }}
"""
    # CORRECTED API CALL: Use the modern chat.completions endpoint.
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    output = response.choices[0].message.content
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("⚠️ Non-JSON from model. Showing formatted text.\n")
        return pretty_print(output)