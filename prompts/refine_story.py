#refines the entire story, not just a single field

from openai import OpenAI
import json

client = OpenAI(api_key="sk-...")  # or rely on env var

def pretty_print(output: str):
    try:
        parsed = json.loads(output)
        return json.dumps(parsed, indent=2)
    except Exception:
        return output.strip()

def refine_story(
    existing_story: dict,
    user_instruction: str,
    model: str = "gpt-4o"
):
    """
    Refine an existing story based on user instruction.
    Returns updated JSON if valid, otherwise formatted text.
    """

    prompt = f"""You are an AI product partner refining an Agile user story.

Here is the current story (JSON):
{json.dumps(existing_story, indent=2)}

Instruction: {user_instruction}

Task:
- Apply the instruction while keeping the INVEST format.
- Preserve all existing fields unless changes are requested.
- Return JSON if possible with these fields:
  {{
    "title": "...",
    "description": "...",
    "acceptance_criteria": ["...", "..."],
    "story_points": 5,
    "tags": ["..."]
  }}
"""

    resp = client.responses.create(
        model=model,
        input=prompt,
        temperature=0.0,
    )

    output = resp.output_text

    try:
        return json.loads(output)
    except json.JSONDecodeError:
        print("⚠️ Model did not return valid JSON. Showing formatted output instead.\n")
        return pretty_print(output)


# --- Example run ---
if __name__ == "__main__":
    existing_story = {
        "title": "Reset Password Functionality",
        "description": "As a user, I want to reset my password so that I can regain access if I forget it.",
        "acceptance_criteria": [
            "User can request password reset via email",
            "Reset link expires after 24 hours"
        ],
        "story_points": 5,
        "tags": ["security", "auth"]
    }

    user_instruction = "Make the acceptance criteria more detailed and add a definition of done."
    result = refine_story(existing_story, user_instruction)

    if isinstance(result, dict):
        print(json.dumps(result, indent=2))
    else:
        print(result)
