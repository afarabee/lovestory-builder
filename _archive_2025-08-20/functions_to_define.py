
import openai

# Replace with your actual API key or use environment variable
openai.api_key = "sk-..."

def generate_user_story(raw_input, context):
    prompt = f"""You are an expert Agile product owner helping generate a user story.
Context:
Project: {context.get('project_name')}
Description: {context.get('project_description')}
Persona: {context.get('persona')}
Tone: {context.get('tone')}
Format: {context.get('format')}

Task:
Turn the following raw input into a structured user story following INVEST:
'{raw_input}'

Return:
- Title
- Description
- Acceptance Criteria (as bullet points)
- Story Point estimate (1–13)
Format the result as JSON.
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']


def refine_field(field_name, current_value, user_instruction):
    prompt = f"""You are refining the {field_name} of a user story.

Current {field_name}: {current_value}
User Request: {user_instruction}

Return only the improved {field_name}.
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']


def generate_test_cases(user_story, acceptance_criteria):
    prompt = f"""Given this user story and acceptance criteria:

User Story:
{user_story}

Acceptance Criteria:
{chr(10).join('- ' + ac for ac in acceptance_criteria)}

Generate 5 test cases (include 2 negative). Format as JSON.
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']


def generate_dev_notes(title, description, ac_list):
    prompt = f"""You're a senior developer writing dev notes for this user story.

Title: {title}
Description: {description}
Acceptance Criteria:
{chr(10).join('- ' + ac for ac in ac_list)}

Suggest relevant code areas, implementation notes, or risks. Return as bullet points.
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']


def format_for_ado_export(title, description, ac_list, dev_notes):
    return f"""**Title:** {title}
**Description:** {description}
**Acceptance Criteria:**
{chr(10).join('- ' + ac for ac in ac_list)}

**Developer Notes:**
{chr(10).join('- ' + note for note in dev_notes)}
"""
