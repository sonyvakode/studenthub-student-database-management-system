from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    name: str
    dob: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None
    enrollment_date: Optional[str] = None

class StudentCreate(StudentBase):
    @field_validator("name")
    def name_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Student full name is required.")
        return v.strip()

    @field_validator("dob")
    def dob_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Date of birth is required.")
        return v.strip()

    @model_validator(mode="after")
    def check_at_least_one_contact(self):
        email_clean = self.email.strip() if self.email else None
        phone_clean = self.phone.strip() if self.phone else None
        if not email_clean and not phone_clean:
            raise ValueError("At least one contact method (email or phone) must be provided.")
        return self

class StudentUpdate(BaseModel):
    name: str
    dob: str
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None
    enrollment_date: Optional[str] = None

    @field_validator("name")
    def name_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Student full name cannot be empty.")
        return v.strip()

    @field_validator("dob")
    def dob_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Date of birth cannot be empty.")
        return v.strip()

    @model_validator(mode="after")
    def check_at_least_one_contact(self):
        email_clean = self.email.strip() if self.email else None
        phone_clean = self.phone.strip() if self.phone else None
        if not email_clean and not phone_clean:
            raise ValueError("At least one contact method (email or phone) must be provided.")
        return self

class StudentPatch(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    address: Optional[str] = None
    enrollment_date: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    student_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class AIAskRequest(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None

class AIAskResponse(BaseModel):
    answer: str
    sources_count: int
    status: str
    context: Optional[dict] = None
