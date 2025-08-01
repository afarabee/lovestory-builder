
import time

# Decorator to log GPT call metadata
def gpt_logger(func):
    def wrapper(*args, **kwargs):
        prompt = args[0]
        model = kwargs.get("model", "gpt-4")

        print(f"📨 Prompt Length: {len(prompt)} characters")
        print(f"📌 Model: {model}")

        start = time.time()
        response = func(*args, **kwargs)
        duration = round(time.time() - start, 2)

        preview = response[:100].replace("\n", " ")
        print(f"✅ Response Preview: {preview}...")
        print(f"⏱️ Duration: {duration} seconds")

        return response
    return wrapper


# Sample usage
@gpt_logger
def call_openai(prompt, model="gpt-4", temperature=0.4):
    # This is a stub response — replace with real OpenAI API call
    return f"Simulated GPT-4 response for: {prompt[:30]}... [truncated]"
