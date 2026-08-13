from app import app

c = app.test_client()

routes = ['/', '/catalogue', '/products', '/vr-walkthrough', '/design-studio', '/about', '/contact', '/admin/login', '/static/css/style.css']

for route in routes:
    r = c.get(route)
    print(f'{route}: {r.status_code}')
