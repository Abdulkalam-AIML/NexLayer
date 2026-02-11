import firebase_admin
from firebase_admin import credentials, firestore
import os

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing: {e}")
        exit(1)

db = firestore.client()

try:
    print("--- User Directory ---")
    users = db.collection('users').stream()
    for user in users:
        data = user.to_dict()
        print(f"Role: {data.get('role', 'Member')} | Name: {data.get('name', 'Unknown')} | Email: {data.get('email')}")
    print("----------------------")

except Exception as e:
    print(f"Error: {e}")
