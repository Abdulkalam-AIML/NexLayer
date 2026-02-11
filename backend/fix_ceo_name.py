import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

# Initialize Firebase
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
    user = auth.get_user_by_email(email)
    uid = user.uid
    print(f"Found User UID: {uid}")

    doc_ref = db.collection('users').document(uid)
    
    # FORCE UPDATE THE NAME
    print("Force updating name to 'Syed Abdul Kalam'...")
    doc_ref.update({
        'role': 'CEO', 
        'name': 'Syed Abdul Kalam'  # <--- This is the fix
    })
    print("Update Complete.")

except Exception as e:
    print(f"Error: {e}")
