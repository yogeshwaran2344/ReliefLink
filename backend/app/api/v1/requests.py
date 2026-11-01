from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.request import ReliefRequest
from app.models.location import AffectedLocation
from app.schemas.schemas import RequestCreate, RequestResponse
from app.services.priority_engine import check_duplicate_request

router = APIRouter(prefix="/requests", tags=["Relief Requests"])

@router.get("", response_model=List[RequestResponse])
def list_requests(db: Session = Depends(get_db)):
    return db.query(ReliefRequest).order_by(ReliefRequest.created_at.desc()).all()

@router.post("", response_model=RequestResponse)
def create_request(req_in: RequestCreate, db: Session = Depends(get_db)):
    loc = db.query(AffectedLocation).filter(AffectedLocation.id == req_in.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Target location not found")

    existing_requests = db.query(ReliefRequest).all()
    dup_check = check_duplicate_request(req_in.dict(), existing_requests)

    is_dup = dup_check["is_duplicate"]
    dup_of = dup_check["duplicate_of_id"]
    dup_reason = dup_check["reason"]
    req_status = "Flagged Duplicate" if is_dup else "Triage Approved"

    new_req = ReliefRequest(
        location_id=req_in.location_id,
        requester_name=req_in.requester_name,
        requester_role=req_in.requester_role or "Volunteer",
        phone=req_in.phone,
        urgency=req_in.urgency,
        food_qty=req_in.food_qty,
        water_qty=req_in.water_qty,
        medical_qty=req_in.medical_qty,
        evidence_photo_url=req_in.evidence_photo_url,
        status=req_status,
        is_duplicate=is_dup,
        duplicate_of_id=dup_of,
        duplicate_reason=dup_reason
    )
    db.add(new_req)

    # If legitimate request, update location demands
    if not is_dup:
        loc.demands_food += req_in.food_qty
        loc.demands_water += req_in.water_qty
        loc.demands_medical += req_in.medical_qty

    db.commit()
    db.refresh(new_req)
    return new_req
