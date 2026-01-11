from utils import make_request, load_data, save_data, get_random_string
import json

print("--- Creating Product ---")

status, data = make_request("POST", "/products/", {
    "name": f"Laptop {get_random_string()}",
    "description": "High performance laptop",
    "price": "1299.99",
    "stock": 50
}, token_file="owner_token.txt")

if status == 201:
    print("SUCCESS")
    print(data)
    save_data("product_id.txt", str(data['id']))
else:
    print("FAILED")
    print(data)
