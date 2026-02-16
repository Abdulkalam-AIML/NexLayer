import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from starlette.requests import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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
            # Construct absolute path to serviceAccountKey.json
            base_path = os.path.dirname(os.path.abspath(__file__))
            cred_path = os.path.join(base_path, "serviceAccountKey.json")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print(f"Successfully initialized Firebase with credentials from {cred_path}")
        except Exception as e:
            print(f"Failed to load serviceAccountKey.json: {e}")
            # Fallback for production environments with env vars or ADC
            firebase_admin.initialize_app()

# Initialize Firebase Admin
# ... (existing code) ...

db = firestore.client()
app = FastAPI(title="NexLayer Operations System API")

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security
security = HTTPBearer()

# Production Security Configuration
TRUSTED_ORIGINS = [
    "https://nex-layer.vercel.app",
    "http://localhost:5173",  # For local development
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=TRUSTED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- Firewall Layer: Malicious Pattern Blocking ---
MALICIOUS_PATTERNS = [
    "UNION SELECT", "drop table", "--", ";--", "scripts", 
    "<script>", "alert(", "javascript:", "../", "etc/passwd", 
    "cmd.exe", "/bin/sh"
]

# --- Security Logging Helper ---
def log_security_event(event_type: str, details: dict, request: Request):
    try:
        event_data = {
            "type": event_type,
            "ip": request.client.host if request.client else "unknown",
            "path": str(request.url.path),
            "method": request.method,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details,
            "userAgent": request.headers.get("user-agent", "unknown")
        }
        db.collection("security_logs").add(event_data)
    except Exception as e:
        print(f"Failed to log security event: {e}")

@app.middleware("http")
async def request_firewall(request: Request, call_next):
    # Scan query parameters
    query_params = str(request.query_params).lower()
    for pattern in MALICIOUS_PATTERNS:
        if pattern.lower() in query_params:
            log_security_event("FIREWALL_BLOCK", {"pattern": pattern, "source": "query_params"}, request)
            return JSONResponse(
                status_code=403,
                content={"detail": "Security Firewall: Malicious pattern detected in URL", "code": "FIREWALL_BLOCK"}
            )
    
    # Scan headers
    for header, value in request.headers.items():
        for pattern in MALICIOUS_PATTERNS:
            if pattern.lower() in value.lower():
                log_security_event("FIREWALL_BLOCK", {"pattern": pattern, "source": f"header:{header}"}, request)
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Security Firewall: Malicious pattern detected in headers", "code": "FIREWALL_BLOCK"}
                )

    response = await call_next(request)
    return response

@app.middleware("http")
async def security_audit_logging(request: Request, call_next):
    response = await call_next(request)
    if response.status_code in [401, 403]:
        log_security_event("AUTH_FAILURE", {"status_code": response.status_code}, request)
    return response

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Admin email(s) for fallback role assignment
ADMIN_EMAILS = ["abdulkalamro20@gmail.com"]

async def get_current_user(res: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = auth.verify_id_token(res.credentials)
        
        # 1. Check JWT custom claims first
        role = decoded_token.get('role')
        
        # 2. If no role in JWT, check Firestore users collection
        if not role:
            try:
                user_doc = db.collection('users').document(decoded_token['uid']).get()
                if user_doc.exists:
                    role = user_doc.to_dict().get('role')
            except Exception:
                pass
        
        # 3. Fallback: check admin email list
        if not role:
            email = decoded_token.get('email', '')
            if email in ADMIN_EMAILS:
                role = 'CEO'
            else:
                role = 'Member'
        
        decoded_token['role'] = role
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

class ProjectSchema(BaseModel):
    projectTitle: str
    clientName: str
    description: str
    deadline: str
    progress: Optional[int] = 0
    assignedMembers: Optional[List[str]] = []
    status: Optional[str] = "Active"

class TaskSchema(BaseModel):
    title: str
    projectId: str
    assignedTo: str
    deadline: str
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    next_task: str

class Message(BaseModel):
    project_id: str
    content: str

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "version": "1.0.3", "timestamp": "2026-02-12T07:25:00Z"}

@app.post("/api/login")
@limiter.limit("5/minute")
async def login_api(request: Request):
    # This is a dummy for rate-limiting verification, 
    # real login is handled by Firebase Client SDK
    return {"status": "Rate limiting active"}

@app.post("/api/requests")
@limiter.limit("3/minute")
async def create_client_request(req: UserRequest, user: dict = Depends(get_current_user), request: Request = Request):
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
    if user.get('role') != 'CEO':
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
    
    user_role = user.get('role', 'Client')
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
    user_role = user.get('role', 'Client')

    if user_role == 'CEO':
        docs = db.collection('projects').stream()
    elif user_role == 'Client':
        # Clients see projects they requested
        docs = db.collection('projects').where('clientId', '==', user['uid']).stream()
    else:
        # Team members see assigned projects
        docs = db.collection('projects').where('assignedMembers', 'array-contains', user_email).stream()
    
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.post("/api/projects")
async def create_project_api(project: ProjectSchema, user: dict = Depends(get_current_user)):
    print(f"DEBUG: Project creation attempt by {user.get('email')}")
    if user.get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    project_data = project.dict()
    project_data["topic"] = project.projectTitle # For compatibility
    project_data["createdAt"] = firestore.SERVER_TIMESTAMP
    
    _, proj_ref = db.collection('projects').add(project_data)
    return {"id": proj_ref.id, "status": "success"}

@app.patch("/api/projects/{project_id}")
async def update_project_api(project_id: str, project: dict, user: dict = Depends(get_current_user)):
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user_role = user_doc.to_dict().get('role')
    
    # Check access
    if user_role != 'CEO':
        # Members can only update progress
        if list(project.keys()) != ['progress']:
             raise HTTPException(status_code=403, detail="Only CEO can edit full project details")
        
        # Verify member is assigned to this project
        proj_doc = db.collection('projects').document(project_id).get()
        if not proj_doc.exists:
            raise HTTPException(status_code=404, detail="Project not found")
        if user.get('email') not in proj_doc.to_dict().get('assignedMembers', []):
            raise HTTPException(status_code=403, detail="Member not assigned to this project")

    db.collection('projects').document(project_id).update(project)
    return {"status": "success"}

@app.get("/api/tasks")
async def get_all_tasks(user: dict = Depends(get_current_user)):
    user_email = user.get('email')
    user_role = user.get('role', 'Member')

    if user_role == 'CEO':
        docs = db.collection('tasks').stream()
    else:
        # Founders only see tasks for projects they are assigned to
        # 1. Get projects assigned to this user
        assigned_projects = db.collection('projects').where('assignedMembers', 'array-contains', user_email).stream()
        assigned_project_ids = [doc.id for doc in assigned_projects]
        
        if not assigned_project_ids:
            return []
            
        # 2. Get tasks for those projects
        # Firestore 'in' limit is 10, but we likely have fewer active projects per founder
        # If more, we'd need a different query or client-side filter
        docs = db.collection('tasks').where('projectId', 'in', assigned_project_ids[:10]).stream()
        
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@app.post("/api/tasks")
async def create_task_api(task: TaskSchema, user: dict = Depends(get_current_user)):
    user_doc = db.collection('users').document(user['uid']).get()
    if not user_doc.exists or user_doc.to_dict().get('role') != 'CEO':
        raise HTTPException(status_code=403, detail="CEO access required")
    
    task_data = task.dict()
    task_data["createdAt"] = firestore.SERVER_TIMESTAMP
    task_data["createdBy"] = user.get('email')
    
    _, task_ref = db.collection('tasks').add(task_data)
    return {"id": task_ref.id, "status": "success"}

@app.patch("/api/tasks/{task_id}")
async def update_task_api(task_id: str, task_update: dict, user: dict = Depends(get_current_user)):
    user_email = user.get('email')
    user_role = user.get('role', 'Member')
    
    # 1. Fetch task and check existing project metadata
    task_ref = db.collection('tasks').document(task_id)
    task_doc = task_ref.get()
    
    if not task_doc.exists:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_data = task_doc.to_dict()
    project_id = task_data.get('projectId')
    
    # 2. CEO can update anything
    if user_role == 'CEO':
        task_ref.update(task_update)
        return {"status": "success"}
        
    # 3. Members must be assigned to the project to update task status
    proj_doc = db.collection('projects').document(project_id).get()
    if not proj_doc.exists:
        raise HTTPException(status_code=404, detail="Project linked to task not found")
        
    assigned = proj_doc.to_dict().get('assignedMembers', [])
    if user_email not in assigned:
        raise HTTPException(status_code=403, detail="Access denied: You are not assigned to this project")
        
    # Restrict what members can update (e.g., only status)
    allowed_keys = {'status'}
    if not set(task_update.keys()).issubset(allowed_keys):
        raise HTTPException(status_code=403, detail="Members can only update task status")

    task_ref.update(task_update)
    return {"status": "success"}

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
