from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False, index=True)
    dob = Column(String(32), nullable=False)  # ISO Date YYYY-MM-DD
    email = Column(String(128), nullable=True, index=True)
    phone = Column(String(64), nullable=True)
    course = Column(String(128), nullable=True, index=True)
    address = Column(Text, nullable=True)
    enrollment_date = Column(String(32), nullable=True)  # ISO Date YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
