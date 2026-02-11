import firebase_admin
from firebase_admin import credentials, auth
import os

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing: {e}")
        exit(1)

# List of users to update
users_to_update = [
    "abdulkalamro20@gmail.com",
    "akhilnadhdonka@gmail.com",
    "intidevaonyx@gmail.com",
    "aggalaaneeshram@gmail.com",
    "vinayrajchinnam@gmail.com",
    "syedfidaemohmmed@gmail.com"
]

default_password = "NexLayer@2026"

print(f"--- Resetting Passwords to '{default_password}' ---")

for email in users_to_update:
    try:
        # Check if user exists
        try:
            user = auth.get_user_by_email(email)
            uid = user.uid
            # Update password
            auth.update_user(uid, password=default_password)
            print(f"✅ Updated password for: {email}")
        except firebase_admin.auth.UserNotFoundError:
            # Create user if not found
            print(f"⚠️ User not found: {email}. Creating...")
            user = auth.create_user(email=email, password=default_password)
            print(f"✅ Created user: {email} (UID: {user.uid})")
            
    except Exception as e:
        print(f"❌ Error updating {email}: {e}")

print("------------------------------------------------")
