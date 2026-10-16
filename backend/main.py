from fastapi import APIRouter, FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import os

if __package__:
    from .database import engine, Base, get_db
    from .models import Student
    from .schemas import (
        StudentCreate,
        StudentUpdate,
        StudentPatch,
        StudentResponse,
        StudentListResponse,
        AIAskRequest,
        AIAskResponse,
    )
    from .crud import (
        get_student,
        get_students,
        create_student,
        update_student,
        patch_student,
        delete_student,
        get_dashboard_metrics,
        process_ai_query,
        replace_students,
        check_ollama_status,
    )
else:
    from database import engine, Base, get_db
    from models import Student
    from schemas import (
        StudentCreate,
        StudentUpdate,
        StudentPatch,
        StudentResponse,
        StudentListResponse,
        AIAskRequest,
        AIAskResponse,
    )
    from crud import (
        get_student,
        get_students,
        create_student,
        update_student,
        patch_student,
        delete_student,
        get_dashboard_metrics,
        process_ai_query,
        replace_students,
        check_ollama_status,
    )

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudentHub API",
    description="Backend CRUD API for StudentHub",
    version="1.0.0",
)
api_router = APIRouter()

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # Allow all for flexible development testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_router.get("/health", tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend connectivity, database availability, and Ollama status."""
    try:
        count = db.query(Student).count()
        is_ollama_up = await check_ollama_status()
        return {
            "status": "healthy",
            "database": "sqlite",
            "total_students": count,
            "ai_service": "ollama",
            "ollama_available": is_ollama_up,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check failed: {str(e)}")

@api_router.get("/students", response_model=StudentListResponse, tags=["Students"])
def read_students(
    search: Optional[str] = Query(None, description="Search term for name, ID, or email"),
    course: Optional[str] = Query(None, description="Filter by course name"),
    dob_from: Optional[str] = Query(None, description="Filter DOB from YYYY-MM-DD"),
    dob_to: Optional[str] = Query(None, description="Filter DOB to YYYY-MM-DD"),
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Retrieve students with optional search, course filtering, DOB filters, and pagination."""
    skip = (page - 1) * limit
    items, total = get_students(
        db,
        search=search,
        course=course,
        dob_from=dob_from,
        dob_to=dob_to,
        skip=skip,
        limit=limit,
    )
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }

@api_router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_new_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student with auto-generated student ID and validation."""
    try:
        new_student = create_student(db, student_in)
        return new_student
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create student: {str(e)}")

@api_router.get("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def read_student(student_id: str, db: Session = Depends(get_db)):
    """Retrieve a single student record by numeric ID or student_id string (e.g., STU-1001)."""
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with identifier '{student_id}' was not found.",
        )
    return student

@api_router.patch("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def modify_student(student_id: str, partial_in: StudentPatch, db: Session = Depends(get_db)):
    """Partially update specific fields of an existing student record."""
    updated = patch_student(db, student_id, partial_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with identifier '{student_id}' was not found.",
        )
    return updated

@api_router.delete("/students/{student_id}", status_code=status.HTTP_200_OK, tags=["Students"])
def remove_student(student_id: str, db: Session = Depends(get_db)):
    """Permanently delete a student record by ID."""
    success = delete_student(db, student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with identifier '{student_id}' was not found.",
        )
    return {"message": f"Student '{student_id}' was successfully deleted.", "deleted": True}

@api_router.put("/students/import", response_model=List[StudentResponse], tags=["Students"])
def import_students(students: List[StudentCreate], db: Session = Depends(get_db)):
    """Replace all records with a validated JSON backup."""
    return replace_students(db, students)

@api_router.put("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def replace_student(student_id: str, student_in: StudentUpdate, db: Session = Depends(get_db)):
    """Replace an existing student record completely."""
    updated = update_student(db, student_id, student_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with identifier '{student_id}' was not found.",
        )
    return updated

@api_router.get("/dashboard-metrics", tags=["Analytics"])
def read_dashboard_metrics(db: Session = Depends(get_db)):
    """Calculate and return real-time metrics and course distributions."""
    return get_dashboard_metrics(db)

@api_router.post("/ai/ask", response_model=AIAskResponse, tags=["AI Assistant"])
async def ask_ai_assistant(payload: AIAskRequest, db: Session = Depends(get_db)):
    """Ask questions about the student database with natural language queries."""
    query_text = payload.query or payload.question
    if not query_text or not query_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A query or question string is required.",
        )
    result = await process_ai_query(db, query_text)
    return result

# Keep the original local API paths while exposing the Vercel /api prefix.
app.include_router(api_router)
app.include_router(api_router, prefix="/api", include_in_schema=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
