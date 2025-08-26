from openai import OpenAI
import json
import uuid
from refinement import refine_user_story

# This dictionary will store the chat history for each session.
# In a real application, you would use a database like Firestore for this.
session_history = {}

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
    project_context: str = "",
    model: str = "gpt-4o"
):
    """
    Turns raw input into a structured user story using project context.
    The function handles both valid JSON and plain-text output from the model.
    """

    # The 'instruction' variable is a well-formatted prompt for the model.
    instruction = f"""You are an expert AI product partner helping Agile Product Owners generate high-quality user stories and testable acceptance criteria for export to Azure DevOps.

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
    The user story should include a title, description, and testable acceptance criteria in bullet points.
    Do NOT include a 'definition of done' section.
    Do NOT use Gherkin (Given/When/Then) format for the acceptance criteria.
    Return JSON if possible, but if not, just return text.
    """

    # Make the API call to OpenAI.
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": instruction}],
        temperature=0.0
    )

    output = response.choices[0].message.content

    # Try to parse the output as strict JSON.
    try:
        parsed = json.loads(output)
        # Explicitly remove the "definition_of_done" key if it exists.
        parsed.pop("definition_of_done", None)
        return parsed  # Return a dictionary if the parsing is successful.
    except json.JSONDecodeError:
        # This block runs if the output is not valid JSON.
        print("⚠️ Model did not return valid JSON. Showing formatted output instead.\n")
        # You may need to manually process the text output to remove "Definition of Done".
        return pretty_print(output)  # Fallback to formatting as a plain string.

if __name__ == "__main__":
    # --- STEP 1: INITIAL GENERATION ---
    raw_input = "As a user, I want to reset my password so that I can regain access if I forget it."
    context = {
        "project_name": "eCommerce Platform",
        "project_description": "An eCommerce platform that offers research models for early stage drug development studies.",
        "persona": "Research models buyer",
        "tone": "Professional",
        "format": "User Story"
    }
    
    initial_story = generate_user_story(raw_input, context)
    
    print("--- Initial User Story Generated ---")
    if isinstance(initial_story, dict):
        # We need to turn the initial story into a string for the chat.
        initial_story_string = json.dumps(initial_story, indent=2)
        print(initial_story_string)
    else:
        initial_story_string = initial_story
        print(initial_story_string)

    # Create a unique session ID for this conversation.
    current_session_id = str(uuid.uuid4())

    # --- STEP 2: FIRST REFINEMENT TURN ---
    refinement_message_1 = f"Please add a note about password complexity to the acceptance criteria. The rule is: 'must be at least 12 characters, include a number and a symbol'.\n\nCurrent Story:\n{initial_story_string}"
    
    refined_story_1 = refine_user_story(current_session_id, refinement_message_1, client=client, pretty_print=pretty_print)
    
    print("\n--- First Refinement Turn ---")
    print(refined_story_1)

    # --- STEP 3: SECOND REFINEMENT TURN ---
    refinement_message_2 = "Can you also add a bullet point about logging all password reset attempts for security auditing?"

    refined_story_2 = refine_user_story(current_session_id, refinement_message_2, client=client, pretty_print=pretty_print)

    print("\n--- Second Refinement Turn ---")
    print(refined_story_2)
