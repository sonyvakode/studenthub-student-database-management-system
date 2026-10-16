
import sys
import os

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, Base, engine
from backend.models import Student

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("🚀 Running StudentHub FastAPI Backend Tests")
    print("=" * 60)

    # 1. Health Check
    print("\n[1] Testing GET /health...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    health = resp.json()
    assert health["status"] == "healthy"
    print(f"    ✅ Health Check Passed: {health}")

    # 2. Create Student (POST /students)
    print("\n[2] Testing POST /students (Create)...")
    payload = {
        "name": "Arjun Singhania",
        "dob": "2004-06-18",
        "email": "arjun.singhania@ewbedutech.edu",
        "phone": "+91 98765 11223",
        "course": "Computer Science & Engineering",
        "address": "100 MG Road, Bengaluru",
        "enrollment_date": "2024-08-01",
    }
    resp = client.post("/students", json=payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    created = resp.json()
    student_id = created["student_id"]
    db_id = created["id"]
    assert created["name"] == payload["name"]
    assert created["student_id"].startswith("STU-")
    print(f"    ✅ Student Created: ID={student_id} (Database ID={db_id})")

    # Verify directly in SQLite
    db = SessionLocal()
    try:
        sql_student = db.query(Student).filter(Student.student_id == student_id).first()
        assert sql_student is not None, "Record was not persisted in SQLite!"
        print(f"    ✅ SQLite Persistence Verified: Found in students.db")
    finally:
        db.close()

    # 3. Retrieve Student by ID (GET /students/{id})
    print(f"\n[3] Testing GET /students/{student_id} (Retrieve)...")
    resp = client.get(f"/students/{student_id}")
    assert resp.status_code == 200
    retrieved = resp.json()
    assert retrieved["name"] == payload["name"]
    print(f"    ✅ Retrieved: {retrieved['name']} ({retrieved['student_id']})")

    # 4. Update Student (PUT /students/{id})
    print(f"\n[4] Testing PUT /students/{student_id} (Update)...")
    updated_payload = {
        "name": "Arjun Singhania",
        "dob": "2004-06-18",
        "email": "arjun.singhania@ewbedutech.edu",
        "phone": "+91 99999 88888",
        "course": "Data Science & AI",
        "address": "200 Residency Road, Bengaluru",
        "enrollment_date": "2024-08-01",
    }
    resp = client.put(f"/students/{student_id}", json=updated_payload)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["course"] == "Data Science & AI"
    assert updated["phone"] == "+91 99999 88888"
    print(f"    ✅ Updated Course: {updated['course']}, Phone: {updated['phone']}")

    # 5. Patch Student (PATCH /students/{id})
    print(f"\n[5] Testing PATCH /students/{student_id} (Partial Update)...")
    patch_payload = {"address": "Penthouse 4B, Indiranagar, Bengaluru"}
    resp = client.patch(f"/students/{student_id}", json=patch_payload)
    assert resp.status_code == 200
    patched = resp.json()
    assert patched["address"] == "Penthouse 4B, Indiranagar, Bengaluru"
    assert patched["course"] == "Data Science & AI"  # Unchanged field preserved
    print(f"    ✅ Patched Address: {patched['address']}")

    # 6. List and Search (GET /students)
    print("\n[6] Testing GET /students (List & Filter)...")
    resp = client.get("/students", params={"search": "Arjun", "page": 1, "limit": 10})
    assert resp.status_code == 200
    list_res = resp.json()
    assert list_res["total"] >= 1
    assert any(s["student_id"] == student_id for s in list_res["items"])
    print(f"    ✅ Search Found {list_res['total']} student(s) matching 'Arjun'")

    # 7. Delete Student (DELETE /students/{id})
    print(f"\n[7] Testing DELETE /students/{student_id} (Delete)...")
    resp = client.delete(f"/students/{student_id}")
    assert resp.status_code == 200
    print(f"    ✅ Deleted: {resp.json()['message']}")

    # Verify 404 after delete
    resp = client.get(f"/students/{student_id}")
    assert resp.status_code == 404
    print("    ✅ Verified 404: Record is permanently removed.")

    # Verify removal in SQLite
    db = SessionLocal()
    try:
        deleted_record = db.query(Student).filter(Student.student_id == student_id).first()
        assert deleted_record is None, "Record still exists in SQLite after delete!"
        print("    ✅ SQLite Deletion Verified: Record absent from database.")
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("🎉 ALL CRUD TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
