import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True, default=lambda: f"veh-{uuid.uuid4().hex[:6]}")
    reg_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    vehicle_type = Column(String(100), default="Truck") # Heavy Truck, 4x4 Off-Road, Transit Van
    max_capacity_kg = Column(Integer, default=1000)
    current_load_kg = Column(Integer, default=0)

    status = Column(String(50), default="Available") # Available, Dispatched, In Transit, Maintenance
    home_warehouse_id = Column(String(50), ForeignKey("warehouses.id"), nullable=True)

    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(50), nullable=True)
    fuel_percent = Column(Integer, default=100)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    home_warehouse = relationship("Warehouse", back_populates="vehicles")
    deliveries = relationship("Delivery", back_populates="vehicle")
