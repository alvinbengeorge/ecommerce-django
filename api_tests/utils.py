import json
import os
import random
import string
import requests

BASE_URL = "http://localhost:8000/api"

def get_random_string(length=8):
    return ''.join(random.choice(string.ascii_letters) for i in range(length))

def get_file_path(filename):
    # Get the directory where this script (or utils.py) is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, filename)

def save_data(filename, data):
    path = get_file_path(filename)
    with open(path, 'w') as f:
        f.write(data)
    print(f"Saved data to {path}")

def load_data(filename):
    path = get_file_path(filename)
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        return f.read().strip()

def make_request(method, endpoint, data=None, token_file=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-type": "application/json"}
    
    if token_file:
        token = load_data(token_file)
        if token:
            headers['Authorization'] = f"Bearer {token}"
        else:
            print(f"Warning: Token file {token_file} needed but not found.")

    print(f"Request: {method} {url}")
    
    try:
        response = requests.request(method, url, json=data, headers=headers)
        print(f"Response Status: {response.status_code}")
        
        try:
            json_response = response.json()
            return response.status_code, json_response
        except ValueError:
            return response.status_code, response.text
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return 0, None
