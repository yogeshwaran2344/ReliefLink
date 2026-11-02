from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- User Schemas ---
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str
    role: Optional[str] = "Coordinator"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Disaster Schemas ---
class DisasterBase(BaseModel):
    name: str
    disaster_type: str = "Flood"
    severity_level: str = "High"
    epicenter_lat: Optional[float] = None
    epicenter_lng: Optional[float] = None
    status: str = "Active"

class DisasterCreate(DisasterBase):
    pass

class DisasterResponse(DisasterBase):
    id: str
    started_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# --- Location / Camp Schemas ---
class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    population: int = 500
    injured_count: int = 0
    severity: str = "High"
    disaster_type: str = "Flood"
    access_road_condition: Optional[str] = "Operational"
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    demands_food: int = 0
    demands_water: int = 0
    demands_medical: int = 0
    demands_shelter: int = 0

class LocationCreate(LocationBase):
    disaster_id: Optional[str] = None

class LocationResponse(LocationBase):
    id: str
    last_delivery_hours_ago: int
    received_food: int
    received_water: int
    received_medical: int
    allocated_food: int
    allocated_water: int
    allocated_medical: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Relief Request Schemas ---
class RequestCreate(BaseModel):
    location_id: str
    requester_name: str
    requester_role: Optional[str] = "Volunteer"
    phone: Optional[str] = None
    urgency: str = "High"
    food_qty: int = 0
    water_qty: int = 0
    medical_qty: int = 0
    evidence_photo_url: Optional[str] = None

class RequestResponse(BaseModel):
    id: str
    location_id: str
    requester_name: str
    requester_role: str
    phone: Optional[str]
    urgency: str
    food_qty: int
    water_qty: int
    medical_qty: int
    evidence_photo_url: Optional[str]
    status: str
    is_duplicate: bool
    duplicate_of_id: Optional[str]
    duplicate_reason: Optional[str]
    timestamp: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# --- Inventory & Warehouse Schemas ---
class InventoryItemBase(BaseModel):
    category: str
    item_name: str
    total_qty: int = 0
    reserved_qty: int = 0
    dispatched_qty: int = 0
    available_qty: int = 0
    min_threshold: int = 100
    unit: str = "packets"
    unit_weight_kg: float = 1.0
    expiry_days: int = 180

class InventoryItemResponse(InventoryItemBase):
    id: str
    warehouse_id: str
    updated_at: datetime
    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    code: str
    latitude: float
    longitude: float
    capacity_kg: int = 15000
    address: Optional[str] = None
    status: str = "Operational"

class WarehouseResponse(WarehouseBase):
    id: str
    created_at: datetime
    inventory_items: List[InventoryItemResponse] = []
    class Config:
        from_attributes = True

class SurplusTransferRequest(BaseModel):
    donor_warehouse_id: str
    recipient_warehouse_id: str
    category: str # food, water, medical
    transfer_qty: int

# --- Vehicle Schemas ---
class VehicleBase(BaseModel):
    reg_number: str
    name: str
    vehicle_type: str = "Truck"
    max_capacity_kg: int = 1000
    home_warehouse_id: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: str
    current_load_kg: int
    status: str
    current_lat: Optional[float]
    current_lng: Optional[float]
    fuel_percent: int
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Allocation Schemas ---
class AllocationResponse(BaseModel):
    id: str
    location_id: str
    warehouse_id: str
    priority_score: int
    priority_status: str
    food_allocated: int
    water_allocated: int
    medical_allocated: int
    total_weight_kg: float
    remaining_food_shortage: int
    remaining_water_shortage: int
    remaining_medical_shortage: int
    explanation: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Delivery & Verification Schemas ---
class DeliveryCreate(BaseModel):
    vehicle_id: str
    warehouse_id: str
    target_location_id: str
    dispatched_food: int
    dispatched_water: int
    dispatched_medical: int
    dispatched_shelter: int = 0

class DeliveryVerificationCreate(BaseModel):
    verified_food: int
    verified_water: int
    verified_medical: int
    verified_shelter: int = 0
    recipient_name: str
    notes: Optional[str] = None
    photo_proof_url: Optional[str] = None

class DeliveryVerificationResponse(BaseModel):
    id: str
    delivery_id: str
    verified_food: int
    verified_water: int
    verified_medical: int
    verified_shelter: int = 0
    missing_food: int
    missing_water: int
    missing_medical: int
    missing_shelter: int = 0
    recipient_name: str
    acknowledgment_code: Optional[str]
    notes: Optional[str]
    photo_proof_url: Optional[str]
    has_discrepancy: bool
    verified_at: datetime
    class Config:
        from_attributes = True

class DeliveryResponse(BaseModel):
    id: str
    delivery_code: str
    vehicle_id: str
    warehouse_id: str
    target_location_id: str
    stage_index: int
    stage_name: str
    dispatched_food: int
    dispatched_water: int
    dispatched_medical: int
    dispatched_shelter: int = 0
    created_timestamp: datetime
    dispatched_timestamp: Optional[datetime]
    arrived_timestamp: Optional[datetime]
    completed_timestamp: Optional[datetime]
    verification: Optional[DeliveryVerificationResponse] = None
    class Config:
        from_attributes = True
