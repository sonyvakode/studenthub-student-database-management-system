from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
if __package__:
    from .models import Student
    from .schemas import StudentCreate, StudentUpdate, StudentPatch
else:
    from models import Student
    from schemas import StudentCreate, StudentUpdate, StudentPatch
import re
import os
import httpx

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def generate_student_id(db: Session) -> str:
    last_student = db.query(Student).order_by(Student.id.desc()).first()
    if not last_student:
        return "STU-1001"
    
    match = re.search(r"\d+", last_student.student_id or "")
    if match:
        next_num = int(match.group()) + 1
        return f"STU-{next_num:04d}"
    return f"STU-{1000 + last_student.id + 1}"

def get_student(db: Session, identifier: str):
    if identifier.isdigit():
        student = db.query(Student).filter(Student.id == int(identifier)).first()
        if student:
            return student
    return db.query(Student).filter(Student.student_id == identifier).first()

def get_students(
    db: Session,
    search: str = None,
    course: str = None,
    dob_from: str = None,
    dob_to: str = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(Student)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_term),
                Student.student_id.ilike(search_term),
                Student.email.ilike(search_term),
                Student.phone.ilike(search_term),
                Student.course.ilike(search_term),
            )
        )

    if course and course.strip() and course != "All Courses":
        query = query.filter(Student.course == course.strip())

    if dob_from:
        query = query.filter(Student.dob >= dob_from)

    if dob_to:
        query = query.filter(Student.dob <= dob_to)

    total = query.count()
    items = query.order_by(Student.id.desc()).offset(skip).limit(limit).all()

    return items, total

def create_student(db: Session, student_in: StudentCreate) -> Student:
    new_student_id = generate_student_id(db)
    db_student = Student(
        student_id=new_student_id,
        name=student_in.name.strip(),
        dob=student_in.dob.strip(),
        email=student_in.email.strip() if student_in.email else None,
        phone=student_in.phone.strip() if student_in.phone else None,
        course=student_in.course.strip() if student_in.course else None,
        address=student_in.address.strip() if student_in.address else None,
        enrollment_date=student_in.enrollment_date.strip() if student_in.enrollment_date else None,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, identifier: str, student_in: StudentUpdate):
    db_student = get_student(db, identifier)
    if not db_student:
        return None

    db_student.name = student_in.name.strip()
    db_student.dob = student_in.dob.strip()
    db_student.email = student_in.email.strip() if student_in.email else None
    db_student.phone = student_in.phone.strip() if student_in.phone else None
    db_student.course = student_in.course.strip() if student_in.course else None
    db_student.address = student_in.address.strip() if student_in.address else None
    db_student.enrollment_date = student_in.enrollment_date.strip() if student_in.enrollment_date else None

    db.commit()
    db.refresh(db_student)
    return db_student

def patch_student(db: Session, identifier: str, partial_in: StudentPatch):
    db_student = get_student(db, identifier)
    if not db_student:
        return None

    update_data = partial_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            if isinstance(val, str):
                setattr(db_student, field, val.strip())
            else:
                setattr(db_student, field, val)

    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, identifier: str) -> bool:
    db_student = get_student(db, identifier)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True

def replace_students(db: Session, students: list[StudentCreate]) -> list[Student]:
    db.query(Student).delete()
    replacement_records = [
        Student(
            student_id=f"STU-{1001 + index:04d}",
            name=student.name.strip(),
            dob=student.dob.strip(),
            email=student.email.strip() if student.email else None,
            phone=student.phone.strip() if student.phone else None,
            course=student.course.strip() if student.course else None,
            address=student.address.strip() if student.address else None,
            enrollment_date=student.enrollment_date.strip() if student.enrollment_date else None,
        )
        for index, student in enumerate(students)
    ]
    db.add_all(replacement_records)
    db.commit()
    for student in replacement_records:
        db.refresh(student)
    return replacement_records

def get_dashboard_metrics(db: Session):
    total_students = db.query(Student).count()
    courses = db.query(Student.course, func.count(Student.id)).filter(Student.course != None).group_by(Student.course).all()
    courses_represented = len(courses)
    
    contact_count = db.query(Student).filter(
        or_(Student.email != None, Student.phone != None)
    ).count()

    course_distribution = [
        {"name": c[0] or "Unassigned", "count": c[1]}
        for c in courses
    ]

    return {
        "total_students": total_students,
        "courses_represented": courses_represented,
        "contact_count": contact_count,
        "course_distribution": course_distribution,
    }

async def check_ollama_status() -> bool:
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return res.status_code == 200
    except Exception:
        return False

async def process_ai_query(db: Session, prompt: str) -> dict:
    total_count = db.query(Student).count()
    
    # Check if Ollama is accessible
    is_ollama_online = await check_ollama_status()
    if not is_ollama_online:
        return {
            "answer": (
                "The Ollama AI Assistant is currently disabled or unavailable on the backend host.\n\n"
                "To enable local LLM queries for StudentHub:\n"
                "1. Download and install Ollama from https://ollama.ai\n"
                "2. Start Ollama and run a model: `ollama run llama3`\n"
                "3. Ensure the service is listening on http://127.0.0.1:11434"
            ),
            "sources_count": 0,
            "status": "disabled",
            "context": {"ollama_available": False}
        }

    # Query Ollama with SQLite context
    students = db.query(Student).limit(50).all()
    context_lines = [
        f"ID: {s.student_id}, Name: {s.name}, DOB: {s.dob}, Course: {s.course or 'N/A'}, Contact: {s.email or s.phone or 'N/A'}"
        for s in students
    ]
    context_text = "\n".join(context_lines)

    system_prompt = (
        f"You are the StudentHub assistant for EWB Edu Tech Pvt. Ltd. "
        f"Answer the user's question accurately using ONLY this real student database records:\n"
        f"Total Registered Students: {total_count}\n"
        f"{context_text}\n"
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": f"{system_prompt}\nUser Question: {prompt}\nAnswer:",
                    "stream": False,
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "answer": data.get("response", "No response generated by model."),
                    "sources_count": min(total_count, 50),
                    "status": "success",
                    "context": {"model": OLLAMA_MODEL}
                }
    except Exception as e:
        return {
            "answer": f"Error communicating with local Ollama service: {str(e)}",
            "sources_count": 0,
            "status": "error"
        }

    return {
        "answer": "Ollama service did not return a valid completion.",
        "sources_count": 0,
        "status": "error"
    }
