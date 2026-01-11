import os
import glob

files_to_remove = [
    "owner_creds.json",
    "owner_token.txt",
    "customer_creds.json",
    "customer_token.txt",
    "product_id.txt"
]

print("--- Resetting Test State ---")

base_dir = os.path.dirname(os.path.abspath(__file__))

for filename in files_to_remove:
    path = os.path.join(base_dir, filename)
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"Removed {path}")
        except Exception as e:
            print(f"Error removing {path}: {e}")
    else:
        print(f"Skipped {filename} (not found in {base_dir})")

print("--- Cleanup Complete ---")
print("Note: This script only cleans up local test artifacts.")
print("To reset the database, run: python manage.py flush --no-input")
