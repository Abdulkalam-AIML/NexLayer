# NexLayer Python Backend

This is the Python Flask backend for the NexLayer Dashboard. It handles user requests, project assignments, and daily reports using the Firebase Admin SDK.

## Setup Instructions

1.  **Install Python**: Ensure you have Python 3.8+ installed.
2.  **Navigate to Backend**:
    ```bash
    cd backend
    ```
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Firebase Credentials**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Go to **Project Settings > Service accounts**.
    - Click **Generate new private key**.
    - Rename the downloaded file to `serviceAccountKey.json` and place it inside the `backend/` folder.
    - Update `app.py` line 20 to point to this file if necessary.

5.  **Run the Server**:
    ```bash
    python app.py
    ```

The backend will run on `http://localhost:5000`.

## API Endpoints

- `GET /api/requests`: Fetch pending user requests.
- `POST /api/requests`: Submit a new request from the landing page.
- `POST /api/assign`: Assign a request to a team member.
- `GET /api/projects`: Fetch all projects.
- `GET /api/reports`: Fetch daily reports.
- `POST /api/reports`: Submit a daily report.
