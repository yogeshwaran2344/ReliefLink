from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.warehouse import Warehouse, InventoryItem
from app.schemas.schemas import WarehouseResponse, SurplusTransferRequest

router = APIRouter(prefix="/warehouses", tags=["Warehouses & Inventory"])

@router.get("", response_model=List[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@router.get("/surplus-recommendations")
def get_surplus_recommendations(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    recommendations = []

    categories = ["food", "water", "medical"]
    for cat in categories:
        profiles = []
        for wh in warehouses:
            inv = next((i for i in wh.inventory_items if i.category == cat), None)
            if inv:
                net = inv.available_qty - inv.min_threshold
                profiles.append({
                    "wh_id": wh.id,
                    "wh_name": wh.name,
                    "available": inv.available_qty,
                    "threshold": inv.min_threshold,
                    "net": net,
                    "unit": inv.unit,
                    "weight_kg": inv.unit_weight_kg
                })

        surplus = sorted([p for p in profiles if p["net"] > 0], key=lambda x: x["net"], reverse=True)
        deficits = sorted([p for p in profiles if p["net"] < 0], key=lambda x: x["net"])

        for don in surplus:
            for rec in deficits:
                if don["net"] > 0 and rec["net"] < 0:
                    transferable = min(don["net"], abs(rec["net"]))
                    if transferable >= 20:
                        weight = int(round(transferable * don["weight_kg"]))
                        recommendations.append({
                            "category": cat,
                            "donor_id": don["wh_id"],
                            "donor_name": don["wh_name"],
                            "recipient_id": rec["wh_id"],
                            "recipient_name": rec["wh_name"],
                            "recommended_transfer_qty": transferable,
                            "unit": don["unit"],
                            "transfer_weight_kg": weight,
                            "impact_summary": f"Relieves critical stock deficit at {rec['wh_name']} by dispatching {transferable} {don['unit']} from surplus at {don['wh_name']}."
                        })
                        don["net"] -= transferable
                        rec["net"] += transferable

    return recommendations

@router.post("/transfer")
def execute_surplus_transfer(transfer: SurplusTransferRequest, db: Session = Depends(get_db)):
    donor_item = db.query(InventoryItem).filter(
        InventoryItem.warehouse_id == transfer.donor_warehouse_id,
        InventoryItem.category == transfer.category
    ).first()

    rec_item = db.query(InventoryItem).filter(
        InventoryItem.warehouse_id == transfer.recipient_warehouse_id,
        InventoryItem.category == transfer.category
    ).first()

    if not donor_item or not rec_item:
        raise HTTPException(status_code=404, detail="Matching inventory categories not found")

    if donor_item.available_qty < transfer.transfer_qty:
        raise HTTPException(status_code=400, detail="Insufficient donor stock")

    donor_item.available_qty -= transfer.transfer_qty
    donor_item.dispatched_qty += transfer.transfer_qty

    rec_item.total_qty += transfer.transfer_qty
    rec_item.available_qty += transfer.transfer_qty

    db.commit()
    return {
        "status": "success",
        "transferred": transfer.transfer_qty,
        "category": transfer.category,
        "donor_id": transfer.donor_warehouse_id,
        "recipient_id": transfer.recipient_warehouse_id
    }
