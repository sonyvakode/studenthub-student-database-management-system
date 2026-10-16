

import sys
import os
import json
import sqlite3
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "students.db")
PORT = int(os.environ.get("PYTHON_PORT", "8001"))
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

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

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
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
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_students_student_id ON students(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_students_name ON students(name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_students_course ON students(course)")
    conn.commit()

    # Seed if table is empty
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    if count == 0:
        now = datetime.utcnow().isoformat()
        for s in INITIAL_STUDENTS:
            cursor.execute("""
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
        print(f"[Python SQLite] Seeded {len(INITIAL_STUDENTS)} initial student records into {DB_PATH}")
    conn.close()

def generate_next_student_id(cursor):
    cursor.execute("SELECT student_id FROM students ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if not row or not row["student_id"]:
        return "STU-1001"
    match = re.search(r"\d+", row["student_id"])
    if match:
        next_num = int(match.group()) + 1
        return f"STU-{next_num:04d}"
    cursor.execute("SELECT id FROM students ORDER BY id DESC LIMIT 1")
    last_id = cursor.fetchone()[0]
    return f"STU-{1000 + last_id + 1:04d}"

def row_to_dict(row):
    if not row:
        return None
    d = dict(row)
    # Ensure types match frontend interface
    return {
        "id": d["id"],
        "student_id": d["student_id"],
        "name": d["name"],
        "dob": d["dob"],
        "email": d["email"],
        "phone": d["phone"],
        "course": d["course"],
        "address": d["address"],
        "enrollment_date": d["enrollment_date"],
        "created_at": d.get("created_at"),
        "updated_at": d.get("updated_at"),
    }

class RequestHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        self.send_header("Content-Type", "application/json")

    def do_OPTIONS(self):
        self._set_cors_headers(204)
        self.end_headers()

    def _send_json(self, data, status=200):
        self._set_cors_headers(status)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _send_error(self, message, status=400):
        self._set_cors_headers(status)
        self.end_headers()
        self.wfile.write(json.dumps({"detail": message}).encode("utf-8"))

    def _read_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            return {}
        body = self.rfile.read(content_length)
        try:
            return json.loads(body.decode("utf-8"))
        except Exception:
            return {}

    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[Python API] {self.command} {self.path} - {args[1]}\n")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        query = parse_qs(parsed.query)

        # 1. Health check
        if path == "" or path == "/health":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM students")
            count = cursor.fetchone()[0]
            conn.close()

            # Check Ollama
            ollama_up = False
            try:
                req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags")
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    ollama_up = resp.status == 200
            except Exception:
                ollama_up = False

            return self._send_json({
                "status": "healthy",
                "database": "sqlite",
                "total_students": count,
                "ai_service": "ollama",
                "ollama_available": ollama_up,
            })

        # 2. Dashboard metrics
        if path == "/dashboard-metrics":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM students")
            total = cursor.fetchone()[0]

            cursor.execute("""
                SELECT course, COUNT(*) as count 
                FROM students 
                WHERE course IS NOT NULL AND TRIM(course) != ''
                GROUP BY course
            """)
            courses = cursor.fetchall()
            courses_represented = len(courses)

            cursor.execute("""
                SELECT COUNT(*) FROM students 
                WHERE (email IS NOT NULL AND TRIM(email) != '') 
                   OR (phone IS NOT NULL AND TRIM(phone) != '')
            """)
            contact_count = cursor.fetchone()[0]

            course_distribution = [
                {"name": c["course"], "count": c["count"]}
                for c in courses
            ]
            conn.close()

            return self._send_json({
                "total_students": total,
                "courses_represented": courses_represented,
                "contact_count": contact_count,
                "course_distribution": course_distribution,
            })

        # 3. Read students list
        if path == "/students":
            search = query.get("search", [None])[0]
            course = query.get("course", [None])[0]
            dob_from = query.get("dob_from", [None])[0]
            dob_to = query.get("dob_to", [None])[0]
            try:
                page = max(1, int(query.get("page", [1])[0]))
            except ValueError:
                page = 1
            try:
                limit = max(1, min(100, int(query.get("limit", [10])[0])))
            except ValueError:
                limit = 10

            conn = get_db()
            cursor = conn.cursor()

            conditions = []
            params = []

            if search and search.strip():
                st = f"%{search.strip()}%"
                conditions.append("(name LIKE ? OR student_id LIKE ? OR email LIKE ? OR phone LIKE ? OR course LIKE ?)")
                params.extend([st, st, st, st, st])

            if course and course.strip() and course.strip() != "All Courses":
                conditions.append("course = ?")
                params.append(course.strip())

            if dob_from and dob_from.strip():
                conditions.append("dob >= ?")
                params.append(dob_from.strip())

            if dob_to and dob_to.strip():
                conditions.append("dob <= ?")
                params.append(dob_to.strip())

            where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

            # Count total
            cursor.execute(f"SELECT COUNT(*) FROM students{where_clause}", params)
            total = cursor.fetchone()[0]

            # Fetch page items
            skip = (page - 1) * limit
            cursor.execute(
                f"SELECT * FROM students{where_clause} ORDER BY id DESC LIMIT ? OFFSET ?",
                params + [limit, skip],
            )
            rows = cursor.fetchall()
            items = [row_to_dict(r) for r in rows]
            conn.close()

            total_pages = (total + limit - 1) // limit if total > 0 else 1

            return self._send_json({
                "items": items,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
            })

        # 4. Read single student by ID or student_id: /students/{id}
        if path.startswith("/students/"):
            student_id = path[len("/students/"):]
            conn = get_db()
            cursor = conn.cursor()
            if student_id.isdigit():
                cursor.execute("SELECT * FROM students WHERE id = ? OR student_id = ?", (int(student_id), student_id))
            else:
                cursor.execute("SELECT * FROM students WHERE student_id = ?", (student_id,))
            row = cursor.fetchone()
            conn.close()

            if not row:
                return self._send_error(f"Student with identifier '{student_id}' was not found.", 404)
            return self._send_json(row_to_dict(row))

        return self._send_error("Endpoint not found", 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body()

        # 1. Create student
        if path == "/students":
            name = (body.get("name") or "").strip()
            dob = (body.get("dob") or "").strip()
            email = (body.get("email") or "").strip() or None
            phone = (body.get("phone") or "").strip() or None
            course = (body.get("course") or "").strip() or None
            address = (body.get("address") or "").strip() or None
            enrollment_date = (body.get("enrollment_date") or "").strip() or None

            if not name:
                return self._send_error("Full name is required.", 400)
            if not dob:
                return self._send_error("Date of birth is required.", 400)
            if not email and not phone:
                return self._send_error("At least one contact method (email or phone) is required.", 400)

            conn = get_db()
            cursor = conn.cursor()
            new_student_id = generate_next_student_id(cursor)
            now = datetime.utcnow().isoformat()

            cursor.execute("""
                INSERT INTO students (student_id, name, dob, email, phone, course, address, enrollment_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (new_student_id, name, dob, email, phone, course, address, enrollment_date, now, now))
            new_id = cursor.lastrowid
            conn.commit()

            cursor.execute("SELECT * FROM students WHERE id = ?", (new_id,))
            created_row = cursor.fetchone()
            conn.close()

            return self._send_json(row_to_dict(created_row), 201)

        # 2. AI Assistant query
        if path == "/ai/ask":
            query_text = (body.get("query") or body.get("question") or "").strip()
            if not query_text:
                return self._send_error("Query or question text is required.", 400)

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM students")
            total = cursor.fetchone()[0]

            # Check Ollama
            ollama_up = False
            try:
                req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags")
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    ollama_up = resp.status == 200
            except Exception:
                ollama_up = False

            if not ollama_up:
                conn.close()
                return self._send_json({
                    "answer": (
                        "The Ollama AI Assistant is currently disabled or unavailable on the backend host.\n\n"
                        "To enable local LLM queries for StudentHub:\n"
                        "1. Download and install Ollama from https://ollama.ai\n"
                        "2. Start Ollama and run: ollama run llama3\n"
                        "3. Ensure the service is listening on http://127.0.0.1:11434"
                    ),
                    "sources_count": 0,
                    "status": "disabled",
                })

            # If Ollama is running, query with context
            cursor.execute("SELECT student_id, name, dob, course, email, phone FROM students LIMIT 50")
            sample_rows = cursor.fetchall()
            conn.close()

            context_lines = [
                f"ID: {r['student_id']}, Name: {r['name']}, DOB: {r['dob']}, Course: {r['course'] or 'N/A'}, Contact: {r['email'] or r['phone'] or 'N/A'}"
                for r in sample_rows
            ]
            context_str = "\n".join(context_lines)

            system_prompt = (
                f"You are the StudentHub assistant for EWB Edu Tech Pvt. Ltd. "
                f"Answer accurately using ONLY this real student database records:\n"
                f"Total Registered Students: {total}\n"
                f"{context_str}\n"
            )

            try:
                ollama_payload = json.dumps({
                    "model": os.environ.get("OLLAMA_MODEL", "llama3"),
                    "prompt": f"{system_prompt}\nUser Question: {query_text}\nAnswer:",
                    "stream": False,
                }).encode("utf-8")
                req = urllib.request.Request(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    data=ollama_payload,
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=30.0) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    return self._send_json({
                        "answer": data.get("response", "No response generated by model."),
                        "sources_count": min(total, 50),
                        "status": "success",
                    })
            except Exception as e:
                return self._send_json({
                    "answer": f"Error communicating with local Ollama service: {str(e)}",
                    "sources_count": 0,
                    "status": "error",
                })

        return self._send_error("Endpoint not found", 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body()

        if path.startswith("/students/"):
            student_id = path[len("/students/"):]
            conn = get_db()
            cursor = conn.cursor()

            if student_id.isdigit():
                cursor.execute("SELECT id FROM students WHERE id = ? OR student_id = ?", (int(student_id), student_id))
            else:
                cursor.execute("SELECT id FROM students WHERE student_id = ?", (student_id,))
            target = cursor.fetchone()
            if not target:
                conn.close()
                return self._send_error(f"Student with identifier '{student_id}' was not found.", 404)

            name = (body.get("name") or "").strip()
            dob = (body.get("dob") or "").strip()
            email = (body.get("email") or "").strip() or None
            phone = (body.get("phone") or "").strip() or None
            course = (body.get("course") or "").strip() or None
            address = (body.get("address") or "").strip() or None
            enrollment_date = (body.get("enrollment_date") or "").strip() or None
            now = datetime.utcnow().isoformat()

            cursor.execute("""
                UPDATE students
                SET name = ?, dob = ?, email = ?, phone = ?, course = ?, address = ?, enrollment_date = ?, updated_at = ?
                WHERE id = ?
            """, (name, dob, email, phone, course, address, enrollment_date, now, target["id"]))
            conn.commit()

            cursor.execute("SELECT * FROM students WHERE id = ?", (target["id"],))
            updated_row = cursor.fetchone()
            conn.close()
            return self._send_json(row_to_dict(updated_row))

        return self._send_error("Endpoint not found", 404)

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body()

        if path.startswith("/students/"):
            student_id = path[len("/students/"):]
            conn = get_db()
            cursor = conn.cursor()

            if student_id.isdigit():
                cursor.execute("SELECT id FROM students WHERE id = ? OR student_id = ?", (int(student_id), student_id))
            else:
                cursor.execute("SELECT id FROM students WHERE student_id = ?", (student_id,))
            target = cursor.fetchone()
            if not target:
                conn.close()
                return self._send_error(f"Student with identifier '{student_id}' was not found.", 404)

            fields = []
            params = []
            allowed = ["name", "dob", "email", "phone", "course", "address", "enrollment_date"]
            for f in allowed:
                if f in body:
                    val = body[f]
                    if isinstance(val, str):
                        val = val.strip() or None
                    fields.append(f"{f} = ?")
                    params.append(val)

            if fields:
                fields.append("updated_at = ?")
                params.append(datetime.utcnow().isoformat())
                params.append(target["id"])
                cursor.execute(f"UPDATE students SET {', '.join(fields)} WHERE id = ?", params)
                conn.commit()

            cursor.execute("SELECT * FROM students WHERE id = ?", (target["id"],))
            updated_row = cursor.fetchone()
            conn.close()
            return self._send_json(row_to_dict(updated_row))

        return self._send_error("Endpoint not found", 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path.startswith("/students/"):
            student_id = path[len("/students/"):]
            conn = get_db()
            cursor = conn.cursor()

            if student_id.isdigit():
                cursor.execute("SELECT id, student_id FROM students WHERE id = ? OR student_id = ?", (int(student_id), student_id))
            else:
                cursor.execute("SELECT id, student_id FROM students WHERE student_id = ?", (student_id,))
            target = cursor.fetchone()
            if not target:
                conn.close()
                return self._send_error(f"Student with identifier '{student_id}' was not found.", 404)

            cursor.execute("DELETE FROM students WHERE id = ?", (target["id"],))
            conn.commit()
            conn.close()

            return self._send_json({
                "message": f"Student '{student_id}' was successfully deleted.",
                "deleted": True,
            })

        return self._send_error("Endpoint not found", 404)

def run():
    init_db()
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"[Python SQLite Server] Running at http://127.0.0.1:{PORT}")
    print(f"[Python SQLite Server] Persistent database: {DB_PATH}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
