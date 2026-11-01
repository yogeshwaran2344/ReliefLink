from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.delivery import Delivery, DeliveryVerification
from app.models.location import AffectedLocation
from app.schemas.schemas import DeliveryResponse, DeliveryCreate, DeliveryVerificationCreate, DeliveryVerificationResponse

router = APIRouter(prefix="/deliveries", tags=["Delivery Tracking & Verification"])

@router.get("", response_model=List[DeliveryResponse])
def list_deliveries(db: Session = Depends(get_db)):
    return db.query(Delivery).order_by(Delivery.created_timestamp.desc()).all()

@router.put("/{delivery_id}/stage", response_model=DeliveryResponse)
def update_stage(delivery_id: str, stage_index: int, db: Session = Depends(get_db)):
    deliv = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Delivery not found")

    stage_names = {
        1: "Delivery Created",
        2: "Dispatched",
        3: "In Transit",
        4: "Arrived",
        5: "Receipt Verification",
        6: "Completed"
    }

    deliv.stage_index = stage_index
    deliv.stage_name = stage_names.get(stage_index, "In Transit")

    if stage_index == 2:
        deliv.dispatched_timestamp = datetime.utcnow()
    elif stage_index == 4:
        deliv.arrived_timestamp = datetime.utcnow()
    elif stage_index == 6:
        deliv.completed_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(deliv)
    return deliv

@router.post("/{delivery_id}/verify", response_model=DeliveryVerificationResponse)
def verify_receipt(delivery_id: str, ver_in: DeliveryVerificationCreate, db: Session = Depends(get_db)):
    deliv = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Delivery not found")

    f_missing = max(0, deliv.dispatched_food - ver_in.verified_food)
    w_missing = max(0, deliv.dispatched_water - ver_in.verified_water)
    m_missing = max(0, deliv.dispatched_medical - ver_in.verified_medical)
    has_disc = (f_missing > 0 or w_missing > 0 or m_missing > 0)

    # Check if verification already exists
    ver = db.query(DeliveryVerification).filter(DeliveryVerification.delivery_id == delivery_id).first()
    if not ver:
        ver = DeliveryVerification(
            delivery_id=delivery_id,
            verified_food=ver_in.verified_food,
            verified_water=ver_in.verified_water,
            verified_medical=ver_in.verified_medical,
            missing_food=f_missing,
            missing_water=w_missing,
            missing_medical=m_missing,
            recipient_name=ver_in.recipient_name,
            acknowledgment_code=f"ACK-SIG-{datetime.utcnow().strftime('%H%M%S')}",
            notes=ver_in.notes,
            photo_proof_url=ver_in.photo_proof_url,
            has_discrepancy=has_disc
        )
        db.add(ver)
    else:
        ver.verified_food = ver_in.verified_food
        ver.verified_water = ver_in.verified_water
        ver.verified_medical = ver_in.verified_medical
        ver.missing_food = f_missing
        ver.missing_water = w_missing
        ver.missing_medical = m_missing
        ver.recipient_name = ver_in.recipient_name
        ver.notes = ver_in.notes
        ver.has_discrepancy = has_disc

    # Advance stage to 6 (Completed)
    deliv.stage_index = 6
    deliv.stage_name = "Completed"
    deliv.completed_timestamp = datetime.utcnow()

    # Update destination camp received totals
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == deliv.target_location_id).first()
    if loc:
        loc.received_food += ver_in.verified_food
        loc.received_water += ver_in.verified_water
        loc.received_medical += ver_in.verified_medical

    db.commit()
    db.refresh(ver)
    return ver
