from utils import make_request, load_data

print("--- Testing Owner 1 Access (Should Succeed) ---")

product_id_str = load_data("product_id.txt")
if not product_id_str:
    exit(1)
product_id = int(product_id_str)

print(f"Targeting Product ID: {product_id} (Belongs to Tenant 1)")

# 1. Edit
print("\nAttempting to EDIT Product as Owner 1...")
status, data = make_request("PUT", f"/products/{product_id}/", {
    "name": "Updated by Owner 1",
    "price": "100.00"
}, token_file="owner_token.txt")

if status == 200:
    print("SUCCESS: Owner 1 Updated Product")
else:
    print(f"FAIL: Owner 1 could not update. Status: {status}")

# 2. Delete
print("\nAttempting to DELETE Product as Owner 1...")
status, data = make_request("DELETE", f"/products/{product_id}/", token_file="owner_token.txt")

if status == 204:
    print("SUCCESS: Owner 1 Deleted Product")
else:
    print(f"FAIL: Owner 1 could not delete. Status: {status}")
