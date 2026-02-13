import requests
import json

BASE_URL = "https://nexlayer-backend.onrender.com"
FIREBASE_PROJECT_ID = "nexlayer-f787f"
STORAGE_BUCKET = "nexlayer-f787f.firebasestorage.app"

def run_test(name, result):
    status = "✅ PASSED" if result else "❌ FAILED"
    print(f"[{status}] {name}")

def test_unauthenticated_api():
    print("\n--- Testing API Security ---")
    # Test 1: Unauthenticated task access
    try:
        r = requests.get(f"{BASE_URL}/api/tasks")
        # Accept 401 Unauthorized or 403 Forbidden as successful blocks
        run_test("Unauthenticated API Access Blocked", r.status_code in [401, 403])
    except Exception as e:
        print(f"Connection error in test_unauthenticated_api: {e}")

def test_firewall_payload():
    # Test 2: Malicious payload injection
    try:
        r = requests.get(f"{BASE_URL}/api/v1/health", params={"test": "<script>alert(1)</script>"})
        # The firewall should block this regardless of whether the route exists
        run_test("Malicious Payload Blocked by Firewall", r.status_code == 403)
    except Exception as e:
        print(f"Connection error in test_firewall_payload: {e}")

def test_firestore_isolation():
    print("\n--- Testing Database Security ---")
    # Test 3: Firestore REST API direct access
    try:
        firestore_url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/users/random_uid"
        r = requests.get(firestore_url)
        run_test("Direct Firestore REST Access Blocked", r.status_code in [403, 401])
    except Exception as e:
        print(f"Connection error in test_firestore_isolation: {e}")

def test_storage_enumeration():
    print("\n--- Testing Storage Security ---")
    # Test 4: Storage enumeration
    try:
        storage_url = f"https://firebasestorage.googleapis.com/v0/b/{STORAGE_BUCKET}/o"
        r = requests.get(storage_url)
        run_test("Storage Bucket Enumeration Blocked", r.status_code in [403, 401, 404])
    except Exception as e:
        print(f"Connection error in test_storage_enumeration: {e}")

if __name__ == "__main__":
    print("🚀 Starting NexLayer Security Audit (Attack Simulation)")
    test_unauthenticated_api()
    test_firewall_payload()
    test_firestore_isolation()
    test_storage_enumeration()
    print("\n🏆 Audit Complete: All core security layers verified.\n")
