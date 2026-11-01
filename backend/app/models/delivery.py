import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String(50), primary_key=True, default=lambda: f"del-{uuid.uuid4().hex[:6]}")
    delivery_code = Column(String(50), unique=True, nullable=False)

    vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=False)
    warehouse_id = Column(String(50), ForeignKey("warehouses.id"), nullable=False)
    target_location_id = Column(String(50), ForeignKey("affected_locations.id"), nullable=False)
    allocation_id = Column(String(50), ForeignKey("allocations.id"), nullable=True)

    stage_index = Column(Integer, default=1) # 1: Created, 2: Dispatched, 3: In Transit, 4: Arrived, 5: Receipt Verification, 6: Completed
    stage_name = Column(String(50), default="Delivery Created")

    dispatched_food = Column(Integer, default=0)
    dispatched_water = Column(Integer, default=0)
    dispatched_medical = Column(Integer, default=0)

    created_timestamp = Column(DateTime, default=datetime.utcnow)
    dispatched_timestamp = Column(DateTime, nullable=True)
    arrived_timestamp = Column(DateTime, nullable=True)
    completed_timestamp = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="deliveries")
    warehouse = relationship("Warehouse", back_populates="deliveries")
    location = relationship("AffectedLocation", back_populates="deliveries")
    allocation = relationship("Allocation", back_populates="deliveries")
    verification = relationship("DeliveryVerification", back_populates="delivery", uselist=False, cascade="all, delete-orphan")

class DeliveryVerification(Base):
    __tablename__ = "delivery_verifications"

    id = Column(String(50), primary_key=True, default=lambda: f"ver-{uuid.uuid4().hex[:6]}")
    delivery_id = Column(String(50), ForeignKey("deliveries.id"), unique=True, nullable=False)

    verified_food = Column(Integer, default=0)
    verified_water = Column(Integer, default=0)
    verified_medical = Column(Integer, default=0)

    missing_food = Column(Integer, default=0)
    missing_water = Column(Integer, default=0)
    missing_medical = Column(Integer, default=0)

    recipient_name = Column(String(255), nullable=False)
    acknowledgment_code = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    photo_proof_url = Column(String(1000), nullable=True)
    has_discrepancy = Column(Boolean, default=False)

    verified_at = Column(DateTime, default=datetime.utcnow)

    delivery = relationship("Delivery", back_populates="verification")
