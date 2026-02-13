import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

FIDA_EMAIL = "syedfidaemohmmed@gmail.com"

def cleanup_fida():
    print(f"Searching for tasks assigned to {FIDA_EMAIL}...")
    tasks = db.collection('tasks').where('assignedTo', '==', FIDA_EMAIL).stream()
    
    deleted_count = 0
    for task in tasks:
        db.collection('tasks').document(task.id).delete()
        deleted_count += 1
    
    print(f"Successfully deleted {deleted_count} tasks assigned to Fida.")

if __name__ == "__main__":
    cleanup_fida()
