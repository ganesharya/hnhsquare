from app import app

print('Import OK')
client = app.test_client()
r = client.get('/')
print('Status:', r.status_code)
print('Data:', r.data[:300])
