from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User

def seed_initial_data(db: Session):
    """
    Initializes standard authorized coordinator account if none exists.
    All disaster operational records (camps, warehouses, vehicles, requests)
    start completely empty (Clean Slate) ready for real GPS coordinates.
    """
    if not db.query(User).first():
        admin_user = User(
            email="coordinator@relieflink.org",
            hashed_password="pbkdf2:sha256:dummyhash",
            full_name="Lead Disaster Coordinator",
            role="Admin"
        )
        db.add(admin_user)
        db.commit()
