import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Initialize Firebase Admin
if not firebase_admin._apps:
    service_account_raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    if service_account_raw:
        try:
            import json
            import base64
            # Handle both raw JSON and base64 encoded JSON
            try:
                service_account_info = json.loads(service_account_raw)
            except json.JSONDecodeError:
                service_account_info = json.loads(base64.b64decode(service_account_raw).decode('utf-8'))
            
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Error initializing with FIREBASE_SERVICE_ACCOUNT: {e}")
            firebase_admin.initialize_app()
    else:
        # Use service account json if available locally
        try:
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        except Exception:
            # Fallback for production environments with env vars or ADC
            firebase_admin.initialize_app()

db = firestore.client()
app = FastAPI(title="NexLayer Operations System API")

# Security
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = auth.verify_id_token(res.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- Models ---
class UserRequest(BaseModel):
    name: str
    phone: str
    topic: str
    deadline: str
    description: str
    budget: Optional[str] = None

class ProjectAssignment(BaseModel):
    member_emails: List[str]
    priority: Optional[str] = "Medium"
    deadline: Optional[str] = None

class DailyReport(BaseModel):
    project_id: str
    work_done: str
    issues: Optional[str] = None
    next_task: str

class Message(BaseModel):
    project_id: str
    content: str

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "version": "1.0.3", "timestamp": "2026-02-12T07:25:00Z"}

@app.post("/api/requests")
async def create_client_request(req: UserRequest, user: dict = Depends(get_current_user)):
    try:
        new_request = {
            "clientId": user['uid'], # Link to the authenticated client
            "name": req.name,
            "phone": req.phone,
            "topic": req.topic,
            "deadline": req.deadline,
            "description": req.description,
            "budget": req.budget,
            "status": "pending",
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        _, doc_ref = db.collection('requests').add(new_request)
        return {"id": doc_ref.id, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/requests")
async def get_all_requests(user: dict = Depends(get_current_user)):
    # Check if user is CEO
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists or user_doc.to_dict().get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    docs = db.collection('requests').where('status', '==', 'pending').stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.patch("/api/requests/{request_id}/approve")
async def approve_request(request_id: str, user: dict = Depends(get_current_user)):
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists or user_doc.to_dict().get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    req_ref = db.collection('requests').document(request_id)
    req_doc = req_ref.get()
    if not req_doc.exists:
        raise HTTPException(status_code=404, detail="Request not found")
    
    data = req_doc.to_dict()
    # Create project
    project_data = {
        "clientId": data.get('clientId'),
        "clientName": data['name'],
        "clientPhone": data['phone'],
        "topic": data['topic'],
        "projectTitle": data['topic'],
        "deadline": data['deadline'],
        "budget": data.get('budget'),
        "status": "approved", # Initial status after approval
        "description": data['description'],
        "progress": 0,
        "assignedMembers": [],
        "priority": "Medium",
        "createdAt": firestore.SERVER_TIMESTAMP
    }
    _, proj_ref = db.collection('projects').add(project_data)
    req_ref.update({"status": "approved", "projectId": proj_ref.id})
    
    return {"projectId": proj_ref.id, "status": "approved"}

@app.post("/api/projects/{project_id}/assign")
async def assign_members(project_id: str, assignment: ProjectAssignment, user: dict = Depends(get_current_user)):
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists or user_doc.to_dict().get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    proj_ref = db.collection('projects').document(project_id)
    update_data = {
        "assignedMembers": assignment.member_emails,
        "status": "in-progress"
    }
    if assignment.priority:
        update_data["priority"] = assignment.priority
    if assignment.deadline:
        update_data["deadline"] = assignment.deadline
        
    proj_ref.update(update_data)
    return {"status": "success", "assigned": assignment.member_emails}

@app.post("/api/reports")
async def submit_report(report: DailyReport, user: dict = Depends(get_current_user)):
    # Check if user is assigned to the project or is CEO
    user_email = user.get('email')
    proj_doc = db.collection('projects').document(report.project_id).get()
    
    if not proj_doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")
    
    proj_data = proj_doc.to_dict()
    assigned = proj_data.get('assignedMembers', [])
    
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"

    if user_role != 'CEO' and user_email not in assigned:
        raise HTTPException(status_code=403, detail="Access denied: You are not assigned to this project")

    report_data = {
        "projectId": report.project_id,
        "memberId": user['uid'],
        "memberEmail": user_email,
        "workDone": report.work_done,
        "issues": report.issues,
        "nextTask": report.next_task,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    _, report_ref = db.collection('reports').add(report_data)
    return {"id": report_ref.id, "status": "success"}

@app.get("/api/projects")
async def get_projects(user: dict = Depends(get_current_user)):
    user_email = user.get('email')
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"

    if user_role == 'CEO':
        docs = db.collection('projects').stream()
    elif user_role == 'Client':
        # Clients see projects they requested
        docs = db.collection('projects').where('clientId', '==', user['uid']).stream()
    else:
        # Team members see assigned projects
        docs = db.collection('projects').where('assignedMembers', 'array-contains', user_email).stream()
    
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.get("/api/reports")
async def get_all_reports(user: dict = Depends(get_current_user)):
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"

    if user_role != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required for global reports")

    docs = db.collection('reports').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.get("/api/reports/{project_id}")
async def get_reports_per_project(project_id: str, user: dict = Depends(get_current_user)):
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"

    if user_role != 'CEO':
        # Members can only see reports for projects they are assigned to
        proj_doc = db.collection('projects').document(project_id).get()
        if not proj_doc.exists or user.get('email') not in proj_doc.to_dict().get('assignedMembers', []):
            raise HTTPException(status_code=403, detail="Access Denied")

    docs = db.collection('reports').where('projectId', '==', project_id).stream()
    reports = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    
    # Sort in memory to avoid composite index requirements
    def get_timestamp(x):
        ts = x.get('timestamp')
        try:
            return ts.timestamp() if ts else 0
        except AttributeError:
            return 0
        
    reports.sort(key=get_timestamp, reverse=True)
    return reports


@app.get("/api/users")
async def get_all_users(user: dict = Depends(get_current_user)):
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists or user_doc.to_dict().get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    docs = db.collection('users').stream()
    users = []
    for doc in docs:
        data = doc.to_dict()
        # Filter out sensitive info if necessary, but for CEO view, emails/phones are fine.
        users.append({
            "id": doc.id,
            "name": data.get("name", "Unknown"),
            "email": data.get("email", ""),
            "role": data.get("role", "Member"),
            "phone": data.get("phone", ""),
            "status": "active" # Placeholder or derived from last activity
        })
    return users

# --- Messaging Endpoints ---

@app.post("/api/projects/{project_id}/messages")
async def send_message(project_id: str, msg: Message, user: dict = Depends(get_current_user)):
    user_email = user.get('email')
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"
    
    # Check access (CEO always has access, others if linked/assigned)
    if user_role != 'CEO':
        proj_doc = db.collection('projects').document(project_id).get()
        if not proj_doc.exists:
            raise HTTPException(status_code=404, detail="Project not found")
        
        proj_data = proj_doc.to_dict()
        if user_role == 'Client' and proj_data.get('clientId') != user['uid']:
            raise HTTPException(status_code=403, detail="Access denied")
        if user_role == 'Member' and user_email not in proj_data.get('assignedMembers', []):
            raise HTTPException(status_code=403, detail="Access denied")

    message_data = {
        "projectId": project_id,
        "senderId": user['uid'],
        "senderName": user.get('name') or user.get('displayName') or user_email,
        "senderRole": user_role,
        "content": msg.content,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    _, msg_ref = db.collection('messages').add(message_data)
    return {"id": msg_ref.id, "status": "success"}

@app.get("/api/projects/{project_id}/messages")
async def get_messages(project_id: str, user: dict = Depends(get_current_user)):
    user_email = user.get('email')
    user_role_doc = db.collection('users').document(user['uid']).get()
    user_role = user_role_doc.to_dict().get('role') if user_role_doc.exists else "Client"
    
    # Check access
    if user_role != 'CEO':
        proj_doc = db.collection('projects').document(project_id).get()
        if not proj_doc.exists:
            raise HTTPException(status_code=404, detail="Project not found")
        
        proj_data = proj_doc.to_dict()
        if user_role == 'Client' and proj_data.get('clientId') != user['uid']:
            raise HTTPException(status_code=403, detail="Access denied")
        if user_role == 'Member' and user_email not in proj_data.get('assignedMembers', []):
            raise HTTPException(status_code=403, detail="Access denied")

    docs = db.collection('messages').where('projectId', '==', project_id).stream()
    messages = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    
    # Sort in memory to avoid composite index requirements
    def get_timestamp(x):
        ts = x.get('timestamp')
        try:
            return ts.timestamp() if ts else 0
        except AttributeError:
            return 0
            
    messages.sort(key=get_timestamp)
    return messages

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
