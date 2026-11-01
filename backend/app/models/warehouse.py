import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String(50), primary_key=True, default=lambda: f"wh-{uuid.uuid4().hex[:6]}")
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_kg = Column(Integer, default=15000)
    address = Column(String(500), nullable=True)
    status = Column(String(50), default="Operational")
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_items = relationship("InventoryItem", back_populates="warehouse", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="home_warehouse")
    allocations = relationship("Allocation", back_populates="warehouse")
    deliveries = relationship("Delivery", back_populates="warehouse")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String(50), primary_key=True, default=lambda: f"inv-{uuid.uuid4().hex[:6]}")
    warehouse_id = Column(String(50), ForeignKey("warehouses.id"), nullable=False)

    category = Column(String(50), nullable=False) # food, water, medical, shelter
    item_name = Column(String(255), nullable=False)

    total_qty = Column(Integer, default=0)
    reserved_qty = Column(Integer, default=0)
    dispatched_qty = Column(Integer, default=0)
    available_qty = Column(Integer, default=0)
    min_threshold = Column(Integer, default=100)

    unit = Column(String(50), default="units") # packets, liters, kits
    unit_weight_kg = Column(Float, default=1.0)
    expiry_days = Column(Integer, default=180)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="inventory_items")
