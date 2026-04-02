import re

with open('astro_chatbot.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the API key line
new_text = re.sub(r'const\s+GEMINI_API_KEY\s*=\s*[\'\"].*?[\'\"];', 'const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";', text)

with open('astro_chatbot.js', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('API KEY REPLACED')
