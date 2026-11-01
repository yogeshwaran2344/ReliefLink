from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import AffectedLocation
from app.models.warehouse import Warehouse
from app.models.allocation import Allocation
from app.schemas.schemas import AllocationResponse
from app.services.allocation_engine import run_allocation_optimization

router = APIRouter(prefix="/allocations", tags=["Resource Allocation Engine"])

@router.get("", response_model=List[AllocationResponse])
def list_allocations(db: Session = Depends(get_db)):
    return db.query(Allocation).all()

@router.post("/optimize", response_model=List[AllocationResponse])
def run_optimization(db: Session = Depends(get_db)):
    locations = db.query(AffectedLocation).all()
    warehouses = db.query(Warehouse).all()

    plan_dicts = run_allocation_optimization(locations, warehouses)

    # Clear previous allocations
    db.query(Allocation).delete()

    created = []
    for item in plan_dicts:
        alloc = Allocation(
            location_id=item["location_id"],
            warehouse_id=item["warehouse_id"],
            priority_score=item["priority_score"],
            priority_status=item["priority_status"],
            food_allocated=item["food_allocated"],
            water_allocated=item["water_allocated"],
            medical_allocated=item["medical_allocated"],
            total_weight_kg=item["total_weight_kg"],
            remaining_food_shortage=item["remaining_food_shortage"],
            remaining_water_shortage=item["remaining_water_shortage"],
            remaining_medical_shortage=item["remaining_medical_shortage"],
            explanation=item["explanation"],
            status="Approved"
        )
        db.add(alloc)
        created.append(alloc)

        # Update location allocated counts
        loc = next((l for l in locations if l.id == item["location_id"]), None)
        if loc:
            loc.allocated_food = item["food_allocated"]
            loc.allocated_water = item["water_allocated"]
            loc.allocated_medical = item["medical_allocated"]

    db.commit()
    for a in created:
        db.refresh(a)
    return created
