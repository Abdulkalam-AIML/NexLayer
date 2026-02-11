import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin using the same logic as main.py
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("backend/serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing: {e}")
        exit(1)

db = firestore.client()

def check_user(email):
    print(f"Checking user: {email}")
    try:
        # Get UID from Auth
        user = auth.get_user_by_email(email)
        print(f"UID: {user.uid}")
        
        # Get data from Firestore
        doc_ref = db.collection('users').document(user.uid)
        doc = doc_ref.get()
        if doc.exists:
            print(f"Firestore Data: {doc.to_dict()}")
        else:
            print("No Firestore document found for this UID.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_user("abdulkalamro20@gmail.com")
