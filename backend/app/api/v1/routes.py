from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.warehouse import Warehouse
from app.models.location import AffectedLocation
from app.services.allocation_engine import run_allocation_optimization
from app.services.routing_engine import optimize_fleet_routes

router = APIRouter(prefix="/routes", tags=["Fleet Route Optimization"])

@router.get("/optimized")
def get_optimized_routes(
    road_blocked: bool = Query(False, description="Simulate flooded blockage on Highway 4"),
    db: Session = Depends(get_db)
):
    vehicles = db.query(Vehicle).all()
    warehouses = db.query(Warehouse).all()
    locations = db.query(AffectedLocation).all()

    allocations = run_allocation_optimization(locations, warehouses)
    optimized_fleet = optimize_fleet_routes(vehicles, allocations, warehouses, road_blocked=road_blocked)

    return {
        "hazard_active": road_blocked,
        "hazard_description": "Highway 4 Submerged Near Mile 14 (+7.4 km detour)" if road_blocked else "Corridors Clear",
        "fleet_routes": optimized_fleet
    }
