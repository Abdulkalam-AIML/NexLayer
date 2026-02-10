import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
# On Vercel, we can use an environment variable for the service account JSON
try:
    if not firebase_admin._apps:
        # Check for service account JSON in environment variable
        service_account_info = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
        
        if service_account_info:
            # Parse the JSON string
            cert_dict = json.loads(service_account_info)
            cred = credentials.Certificate(cert_dict)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback for local dev if file exists
            if os.path.exists('backend/serviceAccountKey.json'):
                cred = credentials.Certificate('backend/serviceAccountKey.json')
                firebase_admin.initialize_app(cred)
            else:
                # Default init (GCP/local auth)
                firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")
    db = None

@app.route('/api/requests', methods=['GET'])
def get_requests():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    try:
        docs = db.collection('requests').where('status', '==', 'pending').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).get()
        requests_list = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            if 'timestamp' in data and data['timestamp']:
                data['timestamp'] = data['timestamp'].isoformat()
            requests_list.append(data)
        return jsonify(requests_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/requests', methods=['POST'])
def create_request():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    data = request.json
    try:
        new_request = {
            "name": data.get('name'),
            "email": data.get('email'),
            "phone": data.get('phone'),
            "projectType": data.get('projectType'),
            "message": data.get('message'),
            "status": "pending",
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        ref = db.collection('requests').add(new_request)
        return jsonify({"id": ref[1].id, "status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/assign', methods=['POST'])
def assign_work():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    data = request.json
    request_id = data.get('requestId')
    member_email = data.get('assignedTo')
    if not request_id or not member_email:
        return jsonify({"error": "Missing required fields"}), 400
    try:
        req_ref = db.collection('requests').document(request_id)
        req_doc = req_ref.get()
        if not req_doc.exists:
            return jsonify({"error": "Request not found"}), 404
        req_data = req_doc.to_dict()
        project_data = {
            "projectTitle": req_data.get('projectType'),
            "clientName": req_data.get('name'),
            "clientPhone": req_data.get('phone'),
            "clientEmail": req_data.get('email'),
            "description": req_data.get('message'),
            "assignedMembers": [member_email],
            "status": "Active",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "deadline": "To be set"
        }
        proj_ref = db.collection('projects').add(project_data)
        req_ref.update({
            "status": "assigned",
            "assignedTo": member_email,
            "assignedAt": firestore.SERVER_TIMESTAMP
        })
        return jsonify({"status": "success", "projectId": proj_ref[1].id, "assignedTo": member_email})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    if request.method == 'GET':
        try:
            docs = db.collection('projects').order_by('createdAt', direction=firestore.Query.DESCENDING).get()
            projects_list = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                if 'createdAt' in data and data['createdAt']:
                    data['createdAt'] = data['createdAt'].isoformat()
                projects_list.append(data)
            return jsonify(projects_list)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        data = request.json
        try:
            new_project = {
                "projectTitle": data.get('title'),
                "clientName": data.get('client'),
                "clientPhone": data.get('phone'),
                "clientEmail": data.get('email'),
                "description": data.get('description'),
                "deadline": data.get('deadline'),
                "budget": data.get('budget'),
                "assignedMembers": [data.get('assignedTo')],
                "status": data.get('status', 'Active'),
                "createdAt": firestore.SERVER_TIMESTAMP
            }
            ref = db.collection('projects').add(new_project)
            return jsonify({"id": ref[1].id, "status": "success"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

@app.route('/api/reports', methods=['GET', 'POST'])
def handle_reports():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    if request.method == 'GET':
        user_id = request.args.get('userId')
        role = request.args.get('role')
        try:
            query = db.collection('reports').order_by('timestamp', direction=firestore.Query.DESCENDING)
            if role != 'CEO' and user_id:
                query = query.where('userId', '==', user_id)
            docs = query.get()
            reports_list = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                if 'timestamp' in data and data['timestamp']:
                    data['timestamp'] = data['timestamp'].isoformat()
                reports_list.append(data)
            return jsonify(reports_list)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        data = request.json
        try:
            new_report = {
                "userId": data.get('userId'),
                "userName": data.get('userName'),
                "content": data.get('content'),
                "date": data.get('date'),
                "timestamp": firestore.SERVER_TIMESTAMP
            }
            ref = db.collection('reports').add(new_report)
            return jsonify({"id": ref[1].id, "status": "success"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

# Vercel expects a module-level variable named 'app'
# which we defined at the top
