import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("backend/serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    except Exception:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)

db = firestore.client()

FOUNDERS = {
    "CEO": "abdulkalamro20@gmail.com",
    "CTO": "akhilnadhdonka@gmail.com",
    "Operations": "intidevaonyx@gmail.com",
    "Admin Head": "aggalaaneeshram@gmail.com",
    "Marketing": "vinayrajchinnam@gmail.com",
    "Helper": "syedfidaemohmmed@gmail.com"
}

def seed_users():
    print("Starting user seeding and Custom Claims sync...")
    for role, email in FOUNDERS.items():
        process_user(email, role)
    print("Seeding and role synchronization complete.")

DEFAULT_PASSWORD = "nexlayer@2026"

def process_user(email, role):
    try:
        try:
            user = auth.get_user_by_email(email)
            uid = user.uid
            print(f"User {email} already exists in Auth.")
        except auth.UserNotFoundError:
            user = auth.create_user(
                email=email,
                password=DEFAULT_PASSWORD,
                display_name=email.split('@')[0].replace('.', ' ').title()
            )
            uid = user.uid
            print(f"Created new user {email} in Auth.")
        
        # 2. Sync to Firestore
        user_ref = db.collection('users').document(uid)
        user_ref.set({
            "email": email,
            "role": role,
            "name": user.display_name,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }, merge=True)
        print(f"Set role '{role}' for {email} in Firestore.")

        # 3. Set Custom Claims in Firebase Auth
        auth.set_custom_user_claims(uid, {'role': role})
        print(f"Set Custom Claim 'role={role}' for {email} in Firebase Auth.")
    except Exception as e:
        print(f"Error processing {email}: {e}")

if __name__ == "__main__":
    seed_users()
