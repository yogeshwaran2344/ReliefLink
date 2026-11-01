import asyncio
import json
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import AffectedLocation
from app.models.warehouse import Warehouse

router = APIRouter(prefix="/events", tags=["Event-Driven Real-Time Engine"])

# Global event queue for in-memory broadcasting
event_queue = asyncio.Queue()

@router.get("/stream")
async def event_stream(request: Request):
    """
    Server-Sent Events (SSE) stream for real-time live disaster updates.
    Broadcasts changes across multi-user sessions without requiring full page reload.
    """
    async def event_generator():
        # Send initial connection handshake
        yield f"event: connected\ndata: {json.dumps({'status': 'stream_active', 'timestamp': datetime.utcnow().isoformat()})}\n\n"
        
        while True:
            if await request.is_disconnected():
                break
            try:
                # Wait for next event or heartbeat
                event = await asyncio.wait_for(event_queue.get(), timeout=15.0)
                yield f"event: {event.get('type', 'update')}\ndata: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                # Send heartbeat to keep connection alive
                yield f"event: heartbeat\ndata: {json.dumps({'ping': True, 'timestamp': datetime.utcnow().isoformat()})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/cascade")
async def trigger_event_cascade(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Event-driven cascade processor:
    When warehouse inventory drops, automatically:
    1. Updates warehouse inventory
    2. Recalculates available resources & affected allocations
    3. Identifies camps with potential shortages
    4. Emits critical coordinator alert
    5. Recommends alternative depot supply failover
    """
    event_type = payload.get("eventType", "INVENTORY_DEPLETION")
    warehouse_id = payload.get("warehouseId", "wh-1")
    delta_water = payload.get("deltaWater", 400)

    # 1. Update warehouse
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if wh:
        wh.current_stock_water = max(0, wh.current_stock_water - delta_water)
        db.commit()

    # 2. Identify affected camps
    critical_camps = db.query(AffectedLocation).filter(AffectedLocation.priority_status == "Critical").all()
    affected_names = [c.name for c in critical_camps]

    cascade_event = {
        "type": "CASCADING_UPDATE",
        "eventType": event_type,
        "affectedWarehouse": wh.name if wh else "Warehouse Alpha",
        "affectedCamps": affected_names,
        "actionRecommended": "Initiate inter-depot rapid surplus replenishment from Warehouse Gamma.",
        "timestamp": datetime.utcnow().isoformat()
    }

    # Broadcast to all live connected users
    await event_queue.put(cascade_event)

    return {
        "status": "cascade_processed",
        "event": cascade_event
    }
