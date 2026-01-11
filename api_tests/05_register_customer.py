from utils import make_request, get_random_string, save_data

username = f"customer_{get_random_string()}"
password = "custpass123"
email = f"{username}@test.com"

print(f"--- Registering Customer: {username} ---")

status, data = make_request("POST", "/auth/register/", {
    "username": username,
    "password": password,
    "email": email,
    "role": "CUSTOMER"
})

if status == 201:
    print("SUCCESS")
    save_data("customer_creds.json", f'{{"username": "{username}", "password": "{password}"}}')
else:
    print("FAILED")
