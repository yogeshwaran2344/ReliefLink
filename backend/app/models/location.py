import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AffectedLocation(Base):
    __tablename__ = "affected_locations"

    id = Column(String(50), primary_key=True, default=lambda: f"camp-{uuid.uuid4().hex[:8]}")
    name = Column(String(255), nullable=False)
    disaster_id = Column(String(36), ForeignKey("disasters.id"), nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    population = Column(Integer, default=500)
    injured_count = Column(Integer, default=0)
    severity = Column(String(50), default="High")
    disaster_type = Column(String(100), default="Flood")
    last_delivery_hours_ago = Column(Integer, default=12)

    demands_food = Column(Integer, default=0)
    demands_water = Column(Integer, default=0)
    demands_medical = Column(Integer, default=0)
    demands_shelter = Column(Integer, default=0)

    received_food = Column(Integer, default=0)
    received_water = Column(Integer, default=0)
    received_medical = Column(Integer, default=0)

    allocated_food = Column(Integer, default=0)
    allocated_water = Column(Integer, default=0)
    allocated_medical = Column(Integer, default=0)

    access_road_condition = Column(String(255), default="Operational")
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("DisasterEvent", back_populates="locations")
    requests = relationship("ReliefRequest", back_populates="location")
    allocations = relationship("Allocation", back_populates="location")
    deliveries = relationship("Delivery", back_populates="location")
