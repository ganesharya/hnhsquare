from embedded import TEMPLATES

d = TEMPLATES.get('admin/dashboard.html', '')
print('Dashboard template len:', len(d))
print('Has chart-container:', 'chart-container' in d)
print('Has activity-item:', 'activity-item' in d)
print('Has quick-actions:', 'quick-actions' in d)
print('Has category-row:', 'category-row' in d)
print('Has status-grid:', 'status-grid' in d)

# Test base template too
b = TEMPLATES.get('admin/base.html', '')
print('Base template len:', len(b))
print('Has dash-grid:', 'dash-grid' in b)
