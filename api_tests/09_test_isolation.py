from utils import make_request, load_data

print("--- Testing Cross-Tenant Access ---")

# 1. Get Product from Tenant 1 (using product_id.txt from original flow)
product_id_str = load_data("product_id.txt")
if not product_id_str:
    print("No product ID found from Tenant 1. Run original tests first.")
    exit(1)
    
product_id = int(product_id_str)
print(f"Targeting Product ID: {product_id} (Belongs to Tenant 1)")

# 2. Try to Edit this product as Owner 2
print("\nAttempting to EDIT Product as Owner 2...")
status, data = make_request("PUT", f"/products/{product_id}/", {
    "name": "HACKED NAME",
    "price": "0.01"
}, token_file="owner2_token.txt")

if status == 404:
    print("SUCCESS: Product not found for Owner 2 (Correct Isolation)")
elif status == 403:
    print("SUCCESS: Permission Denied (Correct Isolation)")
elif status == 200:
    print("FAIL: Owner 2 was able to edit Owner 1's product!")
else:
    print(f"Unexpected Status: {status}")

# 3. Try to Delete this product as Owner 2
print("\nAttempting to DELETE Product as Owner 2...")
status, data = make_request("DELETE", f"/products/{product_id}/", token_file="owner2_token.txt")

if status == 404:
    print("SUCCESS: Product not found for Owner 2 (Correct Isolation)")
elif status == 403:
    print("SUCCESS: Permission Denied (Correct Isolation)")
elif status == 204:
    print("FAIL: Owner 2 was able to delete Owner 1's product!")
else:
    print(f"Unexpected Status: {status}")
