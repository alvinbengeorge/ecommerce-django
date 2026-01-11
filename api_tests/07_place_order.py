from utils import make_request, load_data

print("--- Placing Order ---")

product_id_str = load_data("product_id.txt")
if not product_id_str:
    print("No product ID found. Run 04_create_product.py first.")
    exit(1)

product_id = int(product_id_str)

status, data = make_request("POST", "/orders/", {
    "items": [
        {"product_id": product_id, "quantity": 1}
    ]
}, token_file="customer_token.txt")

if status == 201:
    print("SUCCESS")
    print(data)
else:
    print("FAILED")
