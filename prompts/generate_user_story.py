from openai import OpenAI
import json

client = OpenAI(api_key="...")  # or just rely on env var


def pretty_print(output: str):
    """
    Try to pretty-print JSON-like text; otherwise return as-is.
    """
    try:
        parsed = json.loads(output)
        return json.dumps(parsed, indent=2)
    except Exception:
        return output.strip()


def generate_user_story(
    raw_input: str,
    context: dict,
    custom_prompt: str = "",
    file_content: str = "",
    project_context: str = "",
    model: str = "gpt-4o"
):
    """
    Generate a user story. Try parsing JSON, but fall back to pretty-print text if invalid.
    """

    instruction = f"""You are an expert AI product partner helping Agile Product Owners generate high-quality user stories
and testable acceptance criteria for export to Azure DevOps.

Context (knowledge base):
- Project: {context.get('project_name')}
- Description: {context.get('project_description')}
- Persona: {context.get('persona')}
- Tone: {context.get('tone')}
- Format: {context.get('format')}

Additional inputs:
- Raw input: {raw_input}
- Custom prompt: {custom_prompt}
- File content: {file_content}
- Project context: {project_context}

Task:
Produce an INVEST-quality user story aligned to the context.
Return JSON if possible, but if not, just return text.
"""

    resp = client.responses.create(
        model=model,
        input=instruction,
        temperature=0.0,
    )

    output = resp.output_text

    # Try strict JSON parsing first
    try:
        parsed = json.loads(output)
        return parsed  # return dict if valid JSON
    except json.JSONDecodeError:
        print("⚠️ Model did not return valid JSON. Showing formatted output instead.\n")
        return pretty_print(output)


if __name__ == "__main__":
    raw_input = "As a user, I want to reset my password so that I can regain access if I forget it."
    custom_prompt = "Focus on security and user experience."
    file_content = "Related requirements: Password must be at least 12 characters, include a number and a symbol."
    project_context = "This is for an eCommerce web application for a Contract Research Organization business."
    context = {
        "project_name": "eCommerce Platform",
        "project_description": "An eCommerce platform that offers research models for early stage drug development studies.",
        "persona": "Research models buyer",
        "tone": "Professional",
        "format": "User Story"
    }

    result = generate_user_story(
        raw_input=raw_input,
        context=context,
        custom_prompt=custom_prompt,
        file_content=file_content,
        project_context=project_context
    )

    # If dict, pretty print JSON; if string, it's already formatted
    if isinstance(result, dict):
        print(json.dumps(result, indent=2))
    else:
        print(result)
