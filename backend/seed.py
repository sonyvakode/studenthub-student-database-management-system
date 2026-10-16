"""
Database Seeder Script for StudentHub EWB Edu Tech Internship Project
Run this script to populate initial sample students into the SQLite database.
Can be executed as:
  python -m backend.seed
  OR
  python backend/seed.py
"""
import sys
import os

# Ensure backend folder and project root are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

INITIAL_STUDENTS = [
    {
        "student_id": "STU-1001",
        "name": "Aarav Sharma",
        "dob": "2004-05-14",
        "email": "aarav.sharma@ewbedutech.edu",
        "phone": "+91 98765 43210",
        "course": "Computer Science & Engineering",
        "address": "42 Tech Park Road, Whitefield, Bengaluru",
        "enrollment_date": "2024-08-01",
    },
    {
        "student_id": "STU-1002",
        "name": "Priya Nair",
        "dob": "2005-02-22",
        "email": "priya.nair@ewbedutech.edu",
        "phone": "+91 98123 45678",
        "course": "Data Science & AI",
        "address": "15 Marine Drive, Kochi",
        "enrollment_date": "2024-08-05",
    },
    {
        "student_id": "STU-1003",
        "name": "Rohan Deshmukh",
        "dob": "2003-11-09",
        "email": "rohan.d@ewbedutech.edu",
        "phone": "+91 97654 32109",
        "course": "Information Technology",
        "address": "88 Shivaji Nagar, Pune",
        "enrollment_date": "2023-08-12",
    },
    {
        "student_id": "STU-1004",
        "name": "Ananya Mukherjee",
        "dob": "2006-01-30",
        "email": "ananya.m@ewbedutech.edu",
        "phone": "+91 99012 34567",
        "course": "Electronics & Communication",
        "address": "12 Salt Lake Sector V, Kolkata",
        "enrollment_date": "2025-01-10",
    },
    {
        "student_id": "STU-1005",
        "name": "Vikramaditya Verma",
        "dob": "2004-09-18",
        "email": "vikram.verma@ewbedutech.edu",
        "phone": "+91 91234 56789",
        "course": "Computer Science & Engineering",
        "address": "55 Gomti Nagar, Lucknow",
        "enrollment_date": "2024-08-01",
    },
    {
        "student_id": "STU-1006",
        "name": "Meera Patel",
        "dob": "2005-07-04",
        "email": "meera.patel@ewbedutech.edu",
        "phone": "+91 98450 12345",
        "course": "Business Analytics",
        "address": "24 Ashram Road, Ahmedabad",
        "enrollment_date": "2024-08-15",
    },
    {
        "student_id": "STU-1007",
        "name": "Kabir Sen",
        "dob": "2003-04-12",
        "email": "kabir.sen@ewbedutech.edu",
        "phone": "+91 98301 23456",
        "course": "Mechanical Engineering",
        "address": "77 Park Circus, Kolkata",
        "enrollment_date": "2023-08-10",
    },
    {
        "student_id": "STU-1008",
        "name": "Sneha Kulkarni",
        "dob": "2006-03-15",
        "email": "sneha.k@ewbedutech.edu",
        "phone": "+91 97600 11223",
        "course": "Data Science & AI",
        "address": "10 Kothrud, Pune",
        "enrollment_date": "2025-01-15",
    },
]

def seed_database():
    try:
        from backend.database import SessionLocal, Base, engine
        from backend.models import Student

        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            count = db.query(Student).count()
            if count == 0:
                for s in INITIAL_STUDENTS:
                    db_student = Student(**s)
                    db.add(db_student)
                db.commit()
                print(f"[SQLAlchemy] Successfully seeded {len(INITIAL_STUDENTS)} students into SQLite database.")
            else:
                print(f"[SQLAlchemy] Database already contains {count} students. Skipping seed.")
        finally:
            db.close()
    except Exception as exc:
        # Fallback to direct sqlite3 seeder
        import sqlite3
        from datetime import datetime
        db_file = os.path.join(BASE_DIR, "students.db")
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                dob TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                course TEXT,
                address TEXT,
                enrollment_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        c.execute("SELECT COUNT(*) FROM students")
        count = c.fetchone()[0]
        if count == 0:
            now = datetime.utcnow().isoformat()
            for s in INITIAL_STUDENTS:
                c.execute("""
                    INSERT INTO students (student_id, name, dob, email, phone, course, address, enrollment_date, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s["student_id"],
                    s["name"],
                    s["dob"],
                    s["email"],
                    s["phone"],
                    s["course"],
                    s["address"],
                    s["enrollment_date"],
                    now,
                    now,
                ))
            conn.commit()
            print(f"[SQLite3 Direct] Seeded {len(INITIAL_STUDENTS)} students into {db_file}.")
        else:
            print(f"[SQLite3 Direct] Database already contains {count} students. Skipping seed.")
        conn.close()

if __name__ == "__main__":
    seed_database()
