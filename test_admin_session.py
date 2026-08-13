from app import app

with app.test_client() as c:
    # Login as admin with JSON
    r = c.post('/login', json={'email': 'admin@hnhsquare.com', 'password': 'admin123'})
    print('Login:', r.status_code, r.get_json())
    
    # Access dashboard
    r2 = c.get('/admin/dashboard')
    print('Dashboard status:', r2.status_code)
    print('Dashboard len:', len(r2.data))
    html = r2.data.decode('utf-8')
    print('Has chart-container:', 'chart-container' in html)
    print('Has activity-item:', 'activity-item' in html)
    print('Has quick-actions:', 'quick-actions' in html)
    print('Has category-row:', 'category-row' in html)
    print('Has status-grid:', 'status-grid' in html)
    print('Has stat-card:', 'stat-card' in html)
    
    # Save HTML for inspection
    with open('dashboard_test.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Saved to dashboard_test.html')
