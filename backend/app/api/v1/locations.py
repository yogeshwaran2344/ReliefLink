from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import AffectedLocation
from app.schemas.schemas import LocationCreate, LocationResponse
from app.services.priority_engine import calculate_priority_score

router = APIRouter(prefix="/locations", tags=["Affected Locations (Camps)"])

@router.get("", response_model=List[LocationResponse])
def list_locations(db: Session = Depends(get_db)):
    return db.query(AffectedLocation).all()

@router.post("", response_model=LocationResponse)
def create_location(loc_in: LocationCreate, db: Session = Depends(get_db)):
    new_loc = AffectedLocation(
        name=loc_in.name,
        disaster_id=loc_in.disaster_id,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        population=loc_in.population,
        injured_count=loc_in.injured_count,
        severity=loc_in.severity,
        disaster_type=loc_in.disaster_type,
        access_road_condition=loc_in.access_road_condition,
        contact_person=loc_in.contact_person,
        phone=loc_in.phone,
        notes=loc_in.notes,
        demands_food=loc_in.demands_food,
        demands_water=loc_in.demands_water,
        demands_medical=loc_in.demands_medical,
        demands_shelter=loc_in.demands_shelter,
        last_delivery_hours_ago=0
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

@router.get("/{location_id}/priority")
def get_location_priority(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return calculate_priority_score(loc)
