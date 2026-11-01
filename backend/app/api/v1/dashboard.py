from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import AffectedLocation
from app.models.request import ReliefRequest
from app.models.warehouse import Warehouse
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery
from app.services.priority_engine import calculate_priority_score

router = APIRouter(prefix="/dashboard", tags=["Command Dashboard Telemetry"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    locations = db.query(AffectedLocation).all()
    requests = db.query(ReliefRequest).all()
    warehouses = db.query(Warehouse).all()
    vehicles = db.query(Vehicle).all()
    deliveries = db.query(Delivery).all()

    # Priorities
    scored_camps = [calculate_priority_score(l) for l in locations]
    critical_count = sum(1 for p in scored_camps if p["status"] == "Critical")

    # Stock
    total_avail_stock = 0
    total_dispatched_stock = 0
    for wh in warehouses:
        for item in wh.inventory_items:
            total_avail_stock += item.available_qty
            total_dispatched_stock += item.dispatched_qty

    # Deliveries
    completed = sum(1 for d in deliveries if d.stage_name == "Completed")
    pending = sum(1 for d in deliveries if d.stage_name != "Completed")

    # Shortages
    tot_dem = sum(l.demands_food + l.demands_water + l.demands_medical for l in locations)
    tot_rec = sum(l.received_food + l.received_water + l.received_medical for l in locations)
    shortage_pct = int(round(((tot_dem - tot_rec) / tot_dem * 100))) if tot_dem > 0 else 0

    return {
        "total_affected_locations": len(locations),
        "total_active_requests": sum(1 for r in requests if not r.is_duplicate and r.status != "Delivered"),
        "critical_locations_count": critical_count,
        "available_warehouse_stock_units": total_avail_stock,
        "available_vehicles_count": sum(1 for v in vehicles if v.status == "Available"),
        "total_vehicles_count": len(vehicles),
        "supplies_dispatched_units": total_dispatched_stock,
        "deliveries_completed": completed,
        "pending_deliveries": pending,
        "overall_shortage_percentage": shortage_pct
    }
