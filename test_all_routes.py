from app import app

c = app.test_client()

routes = ['/', '/catalogue', '/products', '/vr-walkthrough', '/design-studio', '/about', '/contact', '/admin/login', '/static/css/style.css', '/blog', '/blog/2026-interior-design-trends']

for route in routes:
    r = c.get(route)
    print(f'{route}: {r.status_code}')

# Test dashboard (requires login - should redirect)
r = c.get('/dashboard')
print(f'/dashboard (no auth): {r.status_code}')
