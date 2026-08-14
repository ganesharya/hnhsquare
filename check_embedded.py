from embedded import TEMPLATES
print('login.html' in TEMPLATES)
for k in sorted(TEMPLATES.keys()):
    print(' ', k)
