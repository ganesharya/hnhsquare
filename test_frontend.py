from app import app

c = app.test_client()

# Test catalogue page
r = c.get('/catalogue')
html = r.data.decode('utf-8')
print('Catalogue status:', r.status_code)
print('Has search input:', 'catalogueSearch' in html)
print('Has search script:', 'catalogueSearch' in html and 'input' in html)
print('Has hover-lift:', 'hover-lift' in html)
print('Has anim-fade-up:', 'anim-fade-up' in html)

# Test home page
r2 = c.get('/')
html2 = r2.data.decode('utf-8')
print('Home status:', r2.status_code)
print('Home has anim-fade-up:', 'anim-fade-up' in html2)

# Test static CSS
r3 = c.get('/static/css/style.css')
css = r3.data.decode('utf-8')
print('CSS status:', r3.status_code)
print('CSS has anim-fade-up transition:', '.anim-fade-up' in css and 'transition' in css)
print('CSS has hover-lift:', '.hover-lift' in css)
