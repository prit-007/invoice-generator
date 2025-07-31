import os
import google.generativeai as genai

# --- Configuration ---
# IMPORTANT: Replace "YOUR_API_KEY" with your actual Gemini API key.
# You can get a key from https://ai.google.dev/
API_KEY = "AIzaSyAeplW1K1y-DgcPO8Z8ZS1b7m3Dmj_7bAA"

# The Gemini model to use. 'gemini-1.5-flash' is a fast and versatile model.
MODEL_NAME = "gemini-2.0-flash"

# The prompt you want to send to the API.
PROMPT = "How much line of code can you provide me If I use you as a agentic AI Tool?"


def call_gemini_api(api_key, model_name, prompt):
    """
    Calls the Gemini API to generate content based on a prompt.

    Args:
        api_key: Your Gemini API key.
        model_name: The name of the Gemini model to use.
        prompt: The text prompt to send to the model.

    Returns:
        The generated text from the model, or an error message if something goes wrong.
    """
    try:
        # Configure the Gemini API with your key.
        genai.configure(api_key=api_key)

        # Create a GenerativeModel instance.
        model = genai.GenerativeModel(model_name)

        # Generate content.
        response = model.generate_content(prompt)

        return response.text
    except Exception as e:
        return f"An error occurred: {e}"


if __name__ == "__main__":
    # It's recommended to set the API key as an environment variable for security.
    # However, for this example, we are setting it directly in the script.
    # To set it as an environment variable, you would do something like:
    # os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY"
    # and then you wouldn't need to pass it to the configure function.

    if API_KEY == "YOUR_API_KEY":
        print("Please replace 'YOUR_API_KEY' with your actual Gemini API key.")
    else:
        print(f"Sending prompt to Gemini: '{PROMPT}'")
        print("-" * 20)
        result = call_gemini_api(API_KEY, MODEL_NAME, PROMPT)
        print("Gemini's Response:")
        print(result)