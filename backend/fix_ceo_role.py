import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

# Initialize Firebase (reuse logic from main.py or just simple init)
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing: {e}")
        exit(1)

db = firestore.client()

email = "abdulkalamro20@gmail.com"

try:
    # First get UID from Auth
    user = auth.get_user_by_email(email)
    uid = user.uid
    print(f"Found User UID: {uid}")

    # Check Firestore
    doc_ref = db.collection('users').document(uid)
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        print(f"Firestore Data: {data}")
        if data.get('role') != 'CEO':
            print("Role is NOT CEO. Updating...")
            doc_ref.update({'role': 'CEO', 'name': 'Syed Abdul Kalam'})
            print("Updated to CEO.")
        else:
            print("Role is already CEO.")
    else:
        print("User document does NOT exist in Firestore. Creating...")
        doc_ref.set({
            'email': email,
            'role': 'CEO',
            'name': 'Syed Abdul Kalam',
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        print("Created CEO document.")

except Exception as e:
    print(f"Error: {e}")
