from app import app
client = app.test_client()
print('signup GET:', client.get('/signup').status_code)
