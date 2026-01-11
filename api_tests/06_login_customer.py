import json
from utils import make_request, load_data, save_data

print("--- Logging in Customer ---")

creds_raw = load_data("customer_creds.json")
if not creds_raw:
    print("No customer credentials found. Run 05_register_customer.py first.")
    exit(1)

creds = json.loads(creds_raw)

status, data = make_request("POST", "/auth/login/", creds)

if status == 200 and 'access' in data:
    print("SUCCESS")
    token = data['access']
    save_data("customer_token.txt", token)
else:
    print("FAILED")
