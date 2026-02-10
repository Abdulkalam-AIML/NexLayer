import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

CEO_EMAIL = "abdulkalamro20@gmail.com"
TEAM_EMAILS = [
    "akhilnadhdonka@gmail.com",
    "intidevaonyx@gmail.com",
    "aggalaaneeshram@gmail.com",
    "vinayrajchinnam@gmail.com",
    "syedfidaemohmmed@gmail.com"
]

def seed_users():
    print("Starting user seeding...")
    
    # 1. Process CEO
    process_user(CEO_EMAIL, "CEO")
    
    # 2. Process Team Members
    for email in TEAM_EMAILS:
        process_user(email, "Member")

    print("Seeding complete.")

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
        
        user_ref = db.collection('users').document(uid)
        user_ref.set({
            "email": email,
            "role": role,
            "name": user.display_name,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
        print(f"Set role '{role}' for {email} (UID: {uid}) in Firestore.")
    except Exception as e:
        print(f"Error processing {email}: {e}")

if __name__ == "__main__":
    seed_users()
