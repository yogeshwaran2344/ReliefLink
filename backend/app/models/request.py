import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class ReliefRequest(Base):
    __tablename__ = "relief_requests"

    id = Column(String(50), primary_key=True, default=lambda: f"req-{uuid.uuid4().hex[:6]}")
    location_id = Column(String(50), ForeignKey("affected_locations.id"), nullable=False)

    requester_name = Column(String(255), nullable=False)
    requester_role = Column(String(100), default="Camp Coordinator")
    phone = Column(String(50), nullable=True)
    urgency = Column(String(50), default="High") # Critical, High, Medium, Low

    food_qty = Column(Integer, default=0)
    water_qty = Column(Integer, default=0)
    medical_qty = Column(Integer, default=0)

    evidence_photo_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="Triage Approved") # Pending, Triage Approved, Flagged Duplicate, Allocated, Delivered

    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(String(50), nullable=True)
    duplicate_reason = Column(Text, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("AffectedLocation", back_populates="requests")
