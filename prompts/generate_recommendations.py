import json
from openai import OpenAI
from typing import Any, Dict, List, Optional
from copy import deepcopy

Recommendation = Dict[str, Any]

def generate_recommendations(
    story: dict,
    client: OpenAI,
    model: str = "gpt-4o"
) -> List[Recommendation]:
    """
    Generates a list of recommendations for improving the user story.
    Returns a list of dictionaries, where each dict is a recommendation.
    """
    prompt = f"""You are an AI Product Partner helping a Product Owner improve a user story based on Agile best practices.
    
    Analyze the following user story and provide concrete, actionable recommendations for improvement. Focus on making the story more "INVEST"-compliant and addressing potential gaps in clarity, scope, or testability.
    
    Current User Story (JSON):
    {json.dumps(story, indent=2)}
    
    Task:
    Provide 1 to 3 distinct recommendations. For each recommendation, provide:
    - A concise 'title' (e.g., "Add Technical Dev Notes")
    - A 'description' explaining the recommendation and its value.
    - 'changes', a JSON object representing the suggested updates to the story. This should be a JSON Patch object that the system can apply.
    
    Return as a JSON object with a single key 'recommendations', which is an array of these objects.
    
    Example JSON format:
    {{
      "recommendations": [
        {{
          "title": "Make title more specific",
          "description": "The title is too general. Making it more specific improves searchability and clarity.",
          "changes": {{
            "title": "Add a new 'Create Account' button to the homepage"
          }}
        }}
      ]
    }}
    """
    
    # Use chat.completions.create for a structured response.
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7 # Higher temperature for more creative recommendations
    )
    
    output = response.choices[0].message.content
    try:
        parsed = json.loads(output)
        return parsed.get("recommendations", [])
    except json.JSONDecodeError:
        print("⚠️ Model did not return valid JSON for recommendations.")
        return []

def apply_recommendation(story: dict, recommendation: Recommendation) -> dict:
    """
    Applies the changes from a single recommendation to the story.
    """
    changes = recommendation.get("changes", {})
    updated_story = deepcopy(story) # Start with a deep copy to avoid side effects
    
    for key, value in changes.items():
        if key in updated_story:
            updated_story[key] = value
            
    return updated_story
