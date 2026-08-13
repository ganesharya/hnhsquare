import json
import base64
import os

base_dir = r'C:\Users\csc\Desktop\hnhsquare-fullstack'
templates_dir = os.path.join(base_dir, 'templates')
static_dir = os.path.join(base_dir, 'static')

# Collect templates
templates = {}
for root, dirs, files in os.walk(templates_dir):
    for f in files:
        if f.endswith('.html'):
            rel_path = os.path.relpath(os.path.join(root, f), templates_dir).replace('\\', '/')
            with open(os.path.join(root, f), 'r', encoding='utf-8') as fh:
                templates[rel_path] = fh.read()

# Collect static files (css, js, images, etc.)
static_files = {}
for root, dirs, files in os.walk(static_dir):
    for f in files:
        rel_path = os.path.relpath(os.path.join(root, f), static_dir).replace('\\', '/')
        with open(os.path.join(root, f), 'rb') as fh:
            static_files[rel_path] = base64.b64encode(fh.read()).decode('ascii')

# Write embedded.py
def py_repr_string(s):
    return json.dumps(s, ensure_ascii=True)

templates_json = json.dumps(templates, ensure_ascii=True)
static_json = json.dumps(static_files, ensure_ascii=True)

output = f'''# Auto-generated embedded assets
import json
import base64

TEMPLATES = json.loads({py_repr_string(templates_json)})

STATIC_FILES = json.loads({py_repr_string(static_json)})
'''

output_path = os.path.join(base_dir, 'embedded.py')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Generated embedded.py")
print(f"  Templates: {len(templates)}")
print(f"  Static files: {len(static_files)}")

# Verify no surrogates
exec_globals = {}
with open(output_path, 'r', encoding='utf-8') as f:
    exec(compile(f.read(), output_path, 'exec'), exec_globals)

for name, content in exec_globals['TEMPLATES'].items():
    surr = [c for c in content if 0xD800 <= ord(c) <= 0xDFFF]
    if surr:
        print(f"WARNING: surrogates in {name}")

print("Verification complete!")
