import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class DisasterEvent(Base):
    __tablename__ = "disasters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    disaster_type = Column(String(100), default="Flood") # Flood, Earthquake, Cyclone, Landslide, Tidal Surge
    severity_level = Column(String(50), default="High") # Critical, High, Medium, Low
    epicenter_lat = Column(Float, nullable=True)
    epicenter_lng = Column(Float, nullable=True)
    status = Column(String(50), default="Active") # Active, Contained, Resolved
    started_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    locations = relationship("AffectedLocation", back_populates="disaster")
