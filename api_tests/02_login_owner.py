import json
from utils import make_request, load_data, save_data

print("--- Logging in Owner ---")

creds_raw = load_data("owner_creds.json")
if not creds_raw:
    print("No owner credentials found. Run 01_register_owner.py first.")
    exit(1)

creds = json.loads(creds_raw)

status, data = make_request("POST", "/auth/login/", creds)

if status == 200 and 'access' in data:
    print("SUCCESS")
    token = data['access']
    save_data("owner_token.txt", token)
else:
    print("FAILED")
