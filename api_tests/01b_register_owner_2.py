from utils import make_request, get_random_string, save_data

username = f"owner_{get_random_string()}"
password = "testpass123"
email = f"{username}@test.com"

print(f"--- Registering Owner: {username} ---")

status, data = make_request("POST", "/auth/register/", {
    "username": username,
    "password": password,
    "email": email,
    "role": "OWNER"
})

if status == 201:
    print("SUCCESS")
    # Save credentials for the login script to use
    save_data("owner2_creds.json", f'{{"username": "{username}", "password": "{password}"}}')
else:
    print("FAILED")
