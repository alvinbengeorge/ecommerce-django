import json
from utils import make_request, load_data, save_data

print("--- Logging in Owner 2 ---")

creds_raw = load_data("owner2_creds.json")
if not creds_raw:
    print("No owner 2 credentials found. Run 01b_register_owner_2.py first.")
    exit(1)

creds = json.loads(creds_raw)

status, data = make_request("POST", "/auth/login/", creds)

if status == 200 and 'access' in data:
    print("SUCCESS")
    token = data['access']
    save_data("owner2_token.txt", token)
else:
    print("FAILED")
