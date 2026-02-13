import firebase_admin
from firebase_admin import credentials, firestore
import random
from datetime import datetime, timedelta

# Initialize Firebase
cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

TEAM_MEMBERS = [
    "akhilnadhdonka@gmail.com",
    "intidevaonyx@gmail.com",
    "aggalaaneeshram@gmail.com",
    "vinayrajchinnam@gmail.com",
    "syedfidaemohmmed@gmail.com"
]

TASK_TITLES = [
    "Design UI Mockups", "Implement Backend Auth", "Database Schema Optimization",
    "Frontend API Integration", "Write Unit Tests", "Deploy to Staging",
    "Client Review Session", "Bug Fixing Phase 1", "Performance Benchmarking",
    "Documentation Update", "Security Audit", "Final QA Testing"
]

def seed_tasks():
    # Get all projects
    projects = db.collection('projects').stream()
    project_list = [doc.id for doc in projects]
    
    if not project_list:
        print("No projects found to seed tasks for.")
        return

    print(f"Found {len(project_list)} projects. Seeding 6 tasks each...")

    total_created = 0
    for proj_id in project_list:
        # Create 6 tasks for each project
        for i in range(6):
            task_data = {
                "title": f"{random.choice(TASK_TITLES)} - {i+1}",
                "projectId": proj_id,
                "assignedTo": random.choice(TEAM_MEMBERS),
                "deadline": (datetime.now() + timedelta(days=random.randint(5, 20))).strftime("%Y-%m-%d"),
                "priority": random.choice(["Low", "Medium", "High"]),
                "status": random.choice(["Pending", "In Progress", "Done"]),
                "createdAt": firestore.SERVER_TIMESTAMP,
                "createdBy": "abdulkalamro20@gmail.com" # SEO's email
            }
            db.collection('tasks').add(task_data)
            total_created += 1
            
    print(f"Successfully seeded {total_created} tasks.")

if __name__ == "__main__":
    seed_tasks()
