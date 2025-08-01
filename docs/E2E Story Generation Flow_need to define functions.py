
import openai

# Replace with your actual API key or use environment variable
openai.api_key = "sk-..."

###

## Step-by-Step Flow

### 1. App Initialization
#- User opens app or clicks `+ New User Story`
#- UI displays only `Raw Input` section (Role, Action, Goal, Feature Name/Description)
#- No LLM handoff or AI processing yet
#- Component: React UI + global state reset

###

### 2. User Completes Raw Input Form
#- User enters:
#  - Role (e.g., “Admin”)
#  - Goal (e.g., “reset a password”)
#  - Benefit (e.g., “so users don’t contact support”)
#- Form validation confirms readiness
#- Input is passed to backend service
#- Context/Prompt Builder (LangChain in the future) Component: `PromptTemplate`
#- Backend prepares data for prompt generation
#- Prompt Ref: `generate_user_story_prompt` #referenced in Step 3

###

### 2.5. Inject Project Settings into Prompt Context
#           This high-level explanation describes what the system *should* do
#           Gather and inject product-specific context (metadata, tone, preferences, examples) into the prompt to guide the LLM output.
#- System checks active Project Settings:
#  - Project metadata (name, personas, domain)
#  - AI prompting preferences (tone, structure, format)
#  - File library references. If files exist, retrieve relevant content
#       For MVP: stub it as a context_snippet parameter that loads from a static file or string.
#       Future: replace with semantic_index.lookup("Study Locking") once you have vector storage.
#- Assembles the system prompt + user prompt into a dynamic prompt prefix block:
#- Example: 
        You are helping write a user story for the project "Tox Studies Dashboard".

        Project Description:
        A digital reporting and visualization tool for toxicology study directors.

        User Persona:
        Study Director - responsible for reviewing study results and sharing data with sponsors.

        AI Preferences:
        - Tone: Professional and concise
        - Format: Must follow: "As a [user], I want [goal] so that [benefit]".
# If project has uploaded files:
        # Extract text
        # Chunk into passages
        # Generate embeddings
        # Query vector DB using prompt context
        # Inject top-N matches into LLM prompt
    #This context is prepended to the prompt before calling the LLM
# Use embeddings to retrieve relevant stories from past examples (RAG input boost)
# Construct final system prompt (prepended)
# Component: 'PromptTemplate' + VectorStoreRetriever, , optional chain memory



# --- Code snippet that *implements* the above logic ---
# Context_injector snippet(project_settings, persona)
#       What the context_injector(...) snippet Is Doing: This is the actual code-level version of 2.5 logic.
# This simulates how project + persona config becomes LLM-friendly context text.
# Pulls values from a local config (e.g., YAML, JSON, DB) to simulate "context memory"
{
  "Apollo": {
    "Study Director": {
      "goals": ["study tracking", "reporting compliance"],
      "systems": ["Document Center", "eSign Workflow"],
      "constraints": ["Audit logging required", "Read-only post-lock"]
    }
  }
}
# That’s your assembled text block — which becomes part of the system prompt or a prepended section of the user prompt.
# Inject that into prompt with:
#   "The Study Director uses the Document Center and eSign Workflow. 
#   Their priorities include traceability and compliance. Actions must be audit-logged."


###

### 3. AI/LLM Generates Story
#- Prompt is sent to the LLM (e.g., OpenAI)
#- Output: LLM returns: title, description, acceptance criteria, story points
#- Component: prompt = refine_story_prompt(...) + call_openai(prompt)
# #Future`ChatOpenAI` or `LLMChain`

# Generate user story 
def construct_story_prompt(inputs, context):
    return f"""
You are a senior CRL Product Owner.

Write a user story based on:
- Role: {inputs['role']}
- Goal: {inputs['goal']}
- Benefit: {inputs['benefit']}
- Feature: {inputs['featureName']}

Project context:
{context}

Output:
1. Title
2. User Story ("As a...")
3. Acceptance Criteria (Given/When/Then format)
4. Definition of Done
5. Tags
6. Estimated story points (1–13)
    """.strip()



# Option for future implementation to generate user story with project context
#def generate_user_story(raw_input, context): #referenced in Step 2
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
#{
  "title": "...",
  "description": "...",
  "acceptance_criteria": ["...", "..."],
  "story_points": 5,
  "tags": ["backend", "compliance"]
}
#Use response = json.loads(...) if the prompt says “Return as JSON” — safer for ADO field mapping.

"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']




###

# call_openai(prompt: str)
# standard GPT API wrapper around the OpenAI Chat API (ChatCompletion.create). Pass in a prompt string, it returns GPT's text response.

def call_openai(prompt, model="gpt-4o", temperature=0.4):
    import openai
    openai.api_key = "your-key"
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a Product Owner assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature
    )
    return response['choices'][0]['message']['content']

###

### 4. UI Updates with Generated Content
#Populate Story Details panel
#- Display:
#  - User Story Details (Title, Description, AC)
#  - Dev Notes section
#  - Push to ADO section
#  - Chat panel (expanded)
#  - Session Data Viewer (if toggled)
#- LLM output injected into state
#- Component: React UI only

###

### 5. Chat Panel Activated for Refinement
#- User types refinement suggestions like:
#  - “Make it more concise”
#  - “Add another AC”
#- Input routed to Context/Prompt Builder (LangChain in the future)
#- Request sent to backend for re-generation
#- Component: `ConversationalChain`
#       Replace with prompt = refine_story_prompt(...) + call_openai(prompt)
#       Wrapped in async function if used in UI-interactive app
#- Prompt Ref: `refine_user_story_prompt`  #referenced in Option #5A


#Option 5A Refine_story_prompt(existing_story, user_instruction)
def refine_story_prompt(existing_story, user_instruction):
    return f"""
Here is an existing user story:

{existing_story}

Instruction: {user_instruction}

Refactor the story accordingly. Keep the original structure unless otherwise stated.
"""

#Option 5B Refine story fields based on interaction with LLM
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


###

### 6. Backend Handles Refinement
#- Build new prompt using story + user request input into prompt
#- If needed, re-query relevant context
#- Return only the improved field
#- Component: prompt = refine_story_prompt(...) + call_openai(prompt)
# #future `LLMChain` + prompt routing #TBD

###


### 7. Story Suggestion Returned + Displayed
#- If actionable → show: 
#  - Apply Suggestion
#  - Undo Suggestion
#- Output → temporary session data
#- Update session data only (not saved)
#- Component: React UI state manager

###

### 8. Apply Suggestion
#- Updates session data
#   - Click Apply
#   - Update in-memory session data
#   - Session Data Viewer reflects changes
#- UI reflects changes
#- Component: React only

###

### 9. Version Snapshot Automatically Triggered
#- Automatically snapshot story content on update
#- Store timestamped version in session history
#- Component: version history manager

###

### 10. Generate Developer Notes (Optional)
#- User clicks `Generate Developer Notes`
#- System sends:
#  - Story title
#  - Description
#  - Acceptance Criteria
#- Context/Prompt Builder (LangChain in the future) queries GitHub repo via integration
#- LLM returns:
#  - Relevant code areas
#  - Suggested changes
#  - Implementation hints
#- Dev Notes appended to the Description field
#- Component: GitHub connector + Context/Prompt Builder (LangChain in the future)

# Generate Dev Notes function
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

###

### 11. Push to ADO
#- User clicks Push to ADO
#- Send final story fields via ADO integration
#- Fields sent to ADO:
#  - Title
#  - Description (with Dev Notes if added)
#  - Acceptance Criteria
#  - Tags, Iteration Path
#- Component: ADO API integration
#Optional: Add commit message or tagging

# Function to format story for export to ADO
def format_for_ado_export(title, description, ac_list, dev_notes):
    return f"""**Title:** {title}
**Description:** {description}
**Acceptance Criteria:**
{chr(10).join('- ' + ac for ac in ac_list)}

**Developer Notes:**
{chr(10).join('- ' + note for note in dev_notes)}
"""

###

## Optional: Contextual Enhancements
#- Retrieve file-based context when story is first generated
#- Use retrieved examples to support refinement requests

## Optional RAG Enhancement Points (Future/Advanced)
#- Between Steps 2–3: retrieve content from file embeddings
#- In chat: retrieve similar refinements using vector search
#- Component: `VectorStoreRetriever` + `RetrievalQA`


# Set up a config toggle for:
#   prompt_style = "structured" vs "natural"
#   context_source = "static" vs "file"

# Wrap call_openai() in a decorator that logs:
#   Prompt length
#   Model used
#   Token cost (if needed)
#   Output preview (first 100 chars)

###

# Config Toggle: prompt_style and context_source
        Lets you test structured vs casual output, Easier prompt A/B testing
        Gives your app a simple config setting (like a dropdown, YAML setting, or variable) that controls how the prompt is generated 
            and where the context comes from — without rewriting your code each time.
        Why it helps:
            Makes your system easier to test ("what happens if I use a natural tone?")
            Lets non-dev users or future teammates change behavior without editing logic
            Keeps your code cleaner by avoiding if raw_input == ... clutter everywhere

        Example config:
        # settings.py or config.json
        config = {
            "prompt_style": "structured",   # or "natural"
            "context_source": "static"      # or "file"
        }
        #How you use it in your code:
        if config["prompt_style"] == "structured":
            prompt = construct_story_prompt(inputs, context)
        else:
            prompt = generate_user_story(raw_input, context)

        if config["context_source"] == "static":
            context = context_snippet_static
        else:
            context = read_context_from_file("project_docs/tox_dashboard.txt")
        #That lets you swap out logic cleanly — perfect for MVP → iterative tuning.


###


### Decorator to Log GPT Call Metadata
        A decorator is a Python way to wrap a function to add functionality without modifying the function itself.
        Adds observability without modifying logic;	Helps you debug, optimize, and scale
        Why you’d want this:
            It lets you automatically log and monitor every LLM call — without rewriting call_openai().
            You can:
                Track prompt size (token usage)
                See which model was used (GPT-4 vs GPT-4o)
                Capture response length or preview
                Log cost if you add pricing math later

        🛠 How it works:
            def gpt_logger(func):
                def wrapper(*args, **kwargs):
                    import time
                    start = time.time()

                    prompt = args[0]
                    print(f"📨 Prompt Length: {len(prompt)} characters")
                    print(f"📌 Model: {kwargs.get('model', 'gpt-4')}")
                    
                    response = func(*args, **kwargs)

                    duration = round(time.time() - start, 2)
                    print(f"✅ Response preview: {response[:100]}...")
                    print(f"⏱️ Duration: {duration} seconds")

                    return response
                return wrapper
        Then just wrap your call_openai() function:


        @gpt_logger
        def call_openai(prompt, model="gpt-4o", temperature=0.4):
            ...
        When you run it, you'll get console output like:


        📨 Prompt Length: 1062 characters
        📌 Model: gpt-4o
        ✅ Response preview: As a lab tech, I want to upload documents...
        ⏱️ Duration: 1.7 seconds
        🔒 Bonus: Token Cost Logging (future)
        You can add this later by returning:


        response['usage']['prompt_tokens']
        and multiplying by OpenAI's cost per token. But for now, string length is a good proxy.

        ✅ TL;DR
        Feature	Why Use It	How It Helps
        prompt_style, context_source toggles	
        GPT logging decorator	



