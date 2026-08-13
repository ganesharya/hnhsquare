from app import app

c = app.test_client()

# Test admin dashboard (without auth it should redirect to login)
r = c.get('/admin/dashboard', follow_redirects=True)
print('Status:', r.status_code)
print('Len:', len(r.data))
print('Has chart:', b'chart-container' in r.data)
print('Has activity:', b'activity-item' in r.data)
print('Has quick-actions:', b'quick-actions' in r.data)
print('Has category-row:', b'category-row' in r.data)
print('Has status-grid:', b'status-grid' in r.data)

# Also test other key routes
for route in ['/', '/catalogue', '/products', '/about']:
    r2 = c.get(route)
    print(f'{route}: {r2.status_code}')
