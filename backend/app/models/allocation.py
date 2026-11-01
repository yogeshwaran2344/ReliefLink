import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(String(50), primary_key=True, default=lambda: f"alloc-{uuid.uuid4().hex[:6]}")
    location_id = Column(String(50), ForeignKey("affected_locations.id"), nullable=False)
    warehouse_id = Column(String(50), ForeignKey("warehouses.id"), nullable=False)

    priority_score = Column(Integer, default=50)
    priority_status = Column(String(50), default="High")

    food_allocated = Column(Integer, default=0)
    water_allocated = Column(Integer, default=0)
    medical_allocated = Column(Integer, default=0)

    total_weight_kg = Column(Float, default=0.0)

    remaining_food_shortage = Column(Integer, default=0)
    remaining_water_shortage = Column(Integer, default=0)
    remaining_medical_shortage = Column(Integer, default=0)

    explanation = Column(Text, nullable=True)
    status = Column(String(50), default="Approved") # Generated, Approved, Dispatched

    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("AffectedLocation", back_populates="allocations")
    warehouse = relationship("Warehouse", back_populates="allocations")
    deliveries = relationship("Delivery", back_populates="allocation")
