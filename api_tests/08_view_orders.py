from utils import make_request

print("--- Listing Orders ---")

status, data = make_request("GET", "/orders/", token_file="customer_token.txt")

if status == 200:
    print("SUCCESS")
    print(f"Found {len(data)} orders")
    for order in data:
        print(f"Order #{order['id']}: Total ${order['total_amount']} ({len(order['items'])} items)")
else:
    print("FAILED")
