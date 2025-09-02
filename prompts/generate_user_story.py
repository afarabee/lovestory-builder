
from openai import OpenAI
import json

# IMPORTANT: Do not hardcode your API key in production code.
# Use environment variables instead.
client = OpenAI(api_key="...")  # or env var

def pretty_print(output: str):
    """
    Tries to pretty-print JSON-like text; otherwise returns as-is.
    This is useful for making raw JSON output more readable.
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
    kb_files_text: str = "",
    model: str = "gpt-5"
):
    """
    Turns raw input into a structured user story using project context.
    The function handles both valid JSON and plain-text output from the model.
    """

    # The 'instruction' variable is a well-formatted prompt for the model.
    instruction = f"""You are an expert AI product partner helping Agile Product Owners generate high-quality user stories and testable acceptance criteria for export to Azure DevOps.

    Context (knowledge base):
    - Project: {context.get('project_name')}               # Project Name
    - Description: {context.get('project_description')}    # Description
    - Tone: {context.get('tone')}                          # Tone   
    - Format: {context.get('format')}                      # Style guidelines
    - Project Files: {kb_files_text}                       # Knowledge Base Files Text

    Additional inputs:                                     # Raw Input & File Upload
    - Raw input: {raw_input}                               # Specifications & Requirements
    - Custom prompt: {custom_prompt}                       # Custom Prompt
    - File content: {file_content}                         # Upload Reference Files

    Task:
    Produce an INVEST-quality user story aligned to the context.
    The user story should include a title, description, and testable acceptance criteria in bullet points.
    Return JSON if possible, but if not, just return text.
    """

    # Make the API call to OpenAI.
    response = client.responses.create(
        model=model,
        instructions=instruction,
        input={},
        temperature=0.0
    )

    output = response.choices[0].message.content

    try:
        parsed = json.loads(output)
        parsed.pop("definition_of_done", None)
        return parsed
    except json.JSONDecodeError:
        print("⚠️ Model did not return valid JSON. Showing formatted output instead.\n")
        return pretty_print(output)

if __name__ == "__main__":
    raw_input = "As a user, I want to reset my password so that I can regain access if I forget it."
    custom_prompt = "Focus on security and user experience."
    file_content = "Related requirements: Password must be at least 12 characters, include a number and a symbol."
    kb_files_text = "Relevant SOP: Passwords must comply with NIST 800-63b and company policy."
    context = {
        "project_name": "eCommerce Platform",
        "project_description": "An eCommerce platform that offers research models for early stage drug development studies.",
        "tone": "Professional",
        "format": "User Story"
    }

    result = generate_user_story(
        raw_input=raw_input,
        context=context,
        custom_prompt=custom_prompt,
        file_content=file_content,
        kb_files_text=kb_files_text
    )

    if isinstance(result, dict):
        print("✅ Success! The model returned valid JSON.\n")
        print(json.dumps(result, indent=2))
    else:
        print("❌ The model returned text, not JSON.\n")
        print(result)
