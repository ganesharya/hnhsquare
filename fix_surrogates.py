import json, base64, sys, re

path = r'C:\Users\csc\Desktop\hnhsquare-fullstack\embedded.py'

# Load current embedded.py
exec_globals = {}
with open(path, 'rb') as f:
    code = f.read()
exec(compile(code, path, 'exec'), exec_globals)

TEMPLATES = exec_globals['TEMPLATES']
STATIC_FILES = exec_globals['STATIC_FILES']

def clean_surrogates(s):
    """Remove Unicode surrogate characters from a string."""
    return ''.join(c for c in s if not (0xD800 <= ord(c) <= 0xDFFF))

# Clean templates
fixed_templates = {}
for name, content in TEMPLATES.items():
    cleaned = clean_surrogates(content)
    removed = len(content) - len(cleaned)
    if removed:
        print(f"  Template '{name}': removed {removed} surrogate chars")
    fixed_templates[name] = cleaned

# Clean static files (these are base64 encoded, so the JSON string itself may have surrogates)
# Actually static files are base64 strings in JSON - surrogates would be in the JSON text
fixed_static = {}
for name, b64 in STATIC_FILES.items():
    cleaned = clean_surrogates(b64)
    removed = len(b64) - len(cleaned)
    if removed:
        print(f"  Static '{name}': removed {removed} surrogate chars")
    fixed_static[name] = cleaned

# Re-serialize as a clean Python file
def py_repr_string(s):
    """Return a Python-safe double-quoted string representation."""
    return json.dumps(s, ensure_ascii=True)

# Build new embedded.py
templates_json = json.dumps(fixed_templates, ensure_ascii=True)
static_json = json.dumps(fixed_static, ensure_ascii=True)

new_content = f'''# Auto-generated embedded assets (cleaned of surrogates)
import json
import base64

TEMPLATES = json.loads({py_repr_string(templates_json)})

STATIC_FILES = json.loads({py_repr_string(static_json)})
'''

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nWrote cleaned embedded.py ({len(new_content)} chars)")
print(f"Templates: {len(fixed_templates)}, Static files: {len(fixed_static)}")

# Verify by re-loading
exec_globals2 = {}
with open(path, 'r', encoding='utf-8') as f:
    exec(compile(f.read(), path, 'exec'), exec_globals2)

# Verify no surrogates remain
for name, content in exec_globals2['TEMPLATES'].items():
    surr = [c for c in content if 0xD800 <= ord(c) <= 0xDFFF]
    if surr:
        print(f"ERROR: surrogates still in {name}")
        sys.exit(1)

print("Verification passed - no surrogates remain!")
