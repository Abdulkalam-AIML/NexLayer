import firebase_admin
from firebase_admin import credentials, firestore
import random
from datetime import datetime, timedelta

# Initialize Firebase
cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

FOUNDERS = {
    "CTO": "akhilnadhdonka@gmail.com",
    "Operations": "intidevaonyx@gmail.com",
    "Admin Head": "aggalaaneeshram@gmail.com",
    "Marketing": "vinayrajchinnam@gmail.com"
}

ROLE_TASKS = {
    "CTO": ["Architecture Review", "Security implementation", "API performance tuning", "Lead backend sprint", "Cloud infra setup", "Code quality audit"],
    "Admin Head": ["Resource planning", "Client contract review", "Budget allocation", "Stakeholder reporting", "Compliance check", "Executive summary"],
    "Operations": ["Workflow automation", "Delivery timeline audit", "Project risk assessment", "Standardize SOPs", "Cross-team sync", "Logistics coordination"],
    "Marketing": ["Brand strategy dev", "GTM plan execution", "Social media campaign", "Client acquisition", "Content calendar review", "SEO optimization"]
}

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
        # Assign one specific task for each founder per project
        for role, email in FOUNDERS.items():
            task_title = random.choice(ROLE_TASKS[role])
            task_data = {
                "title": f"[{role}] {task_title}",
                "projectId": proj_id,
                "assignedTo": email,
                "deadline": (datetime.now() + timedelta(days=random.randint(5, 20))).strftime("%Y-%m-%d"),
                "priority": random.choice(["Low", "Medium", "High"]),
                "status": random.choice(["Pending", "In Progress", "Done"]),
                "createdAt": firestore.SERVER_TIMESTAMP,
                "createdBy": "abdulkalamro20@gmail.com"
            }
            db.collection('tasks').add(task_data)
            total_created += 1
            
    # Add a few extra tasks to reach exactly 48 if needed (8 projects * 5 founders = 40, need 8 more)
    # We will just do a final pass for 8 random founders
    for _ in range(8):
        role = random.choice(list(FOUNDERS.keys()))
        task_data = {
            "title": f"[{role}] Priority {random.choice(ROLE_TASKS[role])}",
            "projectId": random.choice(project_list),
            "assignedTo": FOUNDERS[role],
            "deadline": (datetime.now() + timedelta(days=random.randint(2, 5))).strftime("%Y-%m-%d"),
            "priority": "High",
            "status": "Pending",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "createdBy": "abdulkalamro20@gmail.com"
        }
        db.collection('tasks').add(task_data)
        total_created += 1
            
    print(f"Successfully seeded {total_created} tasks.")

if __name__ == "__main__":
    seed_tasks()
