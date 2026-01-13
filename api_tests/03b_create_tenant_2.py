from utils import make_request, load_data, save_data, get_random_string

print("--- Creating Tenant ---")

# We need the owner to create a tenant
status, data = make_request("POST", "/tenants/", {
    "name": f"Tech Store 2 {get_random_string()}",
}, token_file="owner2_token.txt")

if status in [200, 201]:
    print("SUCCESS")
    # Save tenant info if needed, though usually bound to user
    print(data)
else:
    print("FAILED")
