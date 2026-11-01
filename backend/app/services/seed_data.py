from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    User, DisasterEvent, AffectedLocation, Warehouse, InventoryItem,
    Vehicle, ReliefRequest, Delivery, DeliveryVerification
)

def seed_initial_data(db: Session):
    # Check if data already exists
    if db.query(AffectedLocation).first():
        return

    # 1. Seed Demo Coordinator User
    demo_user = User(
        email="coordinator@relieflink.org",
        hashed_password="pbkdf2:sha256:dummyhash", # or bcrypt hash
        full_name="Col. R. Sen (Disaster Logistics Director)",
        role="Admin"
    )
    db.add(demo_user)

    # 2. Seed Disaster Event
    disaster = DisasterEvent(
        id="disaster-2026-monsoon",
        name="Operation Jal-Raksha (Monsoon Surge & Flooding)",
        disaster_type="Flood",
        severity_level="Critical",
        epicenter_lat=19.1100,
        epicenter_lng=72.8900,
        status="Active"
    )
    db.add(disaster)
    db.flush()

    # 3. Seed 5 Canonical Affected Locations
    camps = [
        AffectedLocation(
            id="camp-a",
            name="Camp A (Riverbank High School)",
            disaster_id=disaster.id,
            latitude=19.1200,
            longitude=72.8500,
            population=1200,
            injured_count=65,
            severity="High",
            disaster_type="Flood",
            last_delivery_hours_ago=38,
            demands_food=450,
            demands_water=700,
            demands_medical=140,
            demands_shelter=80,
            received_food=200,
            received_water=250,
            received_medical=40,
            access_road_condition="Partially Submerged",
            contact_person="Dr. Ananya Roy (Camp Lead)",
            phone="+91 98201 11001",
            notes="Urgent medical aid needed for waterborne infections."
        ),
        AffectedLocation(
            id="camp-b",
            name="Camp B (Northern Ridge Shelter)",
            disaster_id=disaster.id,
            latitude=19.2180,
            longitude=72.9500,
            population=850,
            injured_count=32,
            severity="High",
            disaster_type="Landslide",
            last_delivery_hours_ago=24,
            demands_food=320,
            demands_water=480,
            demands_medical=80,
            demands_shelter=60,
            received_food=120,
            received_water=200,
            received_medical=30,
            access_road_condition="Debris Clearance Active",
            contact_person="Suresh Patil (Coordinator)",
            phone="+91 98201 11002",
            notes="Access road cleared for light vehicles only."
        ),
        AffectedLocation(
            id="camp-c",
            name="Camp C (East Valley Community Center)",
            disaster_id=disaster.id,
            latitude=19.0150,
            longitude=72.9100,
            population=520,
            injured_count=12,
            severity="Medium",
            disaster_type="Cyclone",
            last_delivery_hours_ago=16,
            demands_food=190,
            demands_water=310,
            demands_medical=45,
            demands_shelter=40,
            received_food=90,
            received_water=180,
            received_medical=20,
            access_road_condition="Operational",
            contact_person="Meera Deshmukh (Volunteer Lead)",
            phone="+91 98201 11003",
            notes="Temporary power restored. Water supply low."
        ),
        AffectedLocation(
            id="camp-d",
            name="Camp D (St. Jude Parish Hall)",
            disaster_id=disaster.id,
            latitude=19.0550,
            longitude=72.8350,
            population=340,
            injured_count=5,
            severity="Low",
            disaster_type="Urban Inundation",
            last_delivery_hours_ago=10,
            demands_food=120,
            demands_water=200,
            demands_medical=25,
            demands_shelter=20,
            received_food=80,
            received_water=120,
            received_medical=15,
            access_road_condition="Fully Accessible",
            contact_person="Father Thomas (Camp Coordinator)",
            phone="+91 98201 11004",
            notes="Adequate dry rations for next 18 hrs."
        ),
        AffectedLocation(
            id="camp-e",
            name="Camp E (Delta Island Coastal Primary School)",
            disaster_id=disaster.id,
            latitude=19.2450,
            longitude=72.8650,
            population=980,
            injured_count=48,
            severity="Critical",
            disaster_type="Tidal Surge / Flood",
            last_delivery_hours_ago=42,
            demands_food=410,
            demands_water=620,
            demands_medical=110,
            demands_shelter=70,
            received_food=150,
            received_water=190,
            received_medical=30,
            access_road_condition="Causeway Waterlogged",
            contact_person="Capt. R. Kulkarni (Disaster Warden)",
            phone="+91 98201 11005",
            notes="Extreme drinking water shortage."
        )
    ]
    db.add_all(camps)
    db.flush()

    # 4. Seed 3 Strategic Warehouses & Stock
    wh_alpha = Warehouse(
        id="wh-alpha",
        name="Warehouse A (Central Regional Depot)",
        code="W-ALPHA",
        latitude=19.0760,
        longitude=72.8777,
        capacity_kg=20000,
        address="BKC Logistics Hub, Zone 1",
        status="Operational"
    )
    wh_beta = Warehouse(
        id="wh-beta",
        name="Warehouse B (Northern Relief Base)",
        code="W-BETA",
        latitude=19.2200,
        longitude=72.9800,
        capacity_kg=12000,
        address="Ghodbunder Foothills Depot, Zone 2",
        status="Operational (Low Food Alert)"
    )
    wh_gamma = Warehouse(
        id="wh-gamma",
        name="Warehouse C (Coastal Logistics Station)",
        code="W-GAMMA",
        latitude=19.9600,
        longitude=72.8250,
        capacity_kg=10000,
        address="South Port Container Freight Station, Zone 3",
        status="Operational"
    )
    db.add_all([wh_alpha, wh_beta, wh_gamma])
    db.flush()

    # Stock items (Warehouse A has surplus food, Warehouse B has shortage for USP)
    items = [
        # Alpha
        InventoryItem(warehouse_id=wh_alpha.id, category="food", item_name="RTE Meal Packets", total_qty=1100, reserved_qty=200, dispatched_qty=150, available_qty=750, min_threshold=300, unit="packets", unit_weight_kg=0.8, expiry_days=14),
        InventoryItem(warehouse_id=wh_alpha.id, category="water", item_name="Bottled Spring Water", total_qty=1600, reserved_qty=350, dispatched_qty=200, available_qty=1050, min_threshold=500, unit="liters", unit_weight_kg=1.0, expiry_days=180),
        InventoryItem(warehouse_id=wh_alpha.id, category="medical", item_name="Trauma Emergency Kits", total_qty=280, reserved_qty=60, dispatched_qty=40, available_qty=180, min_threshold=75, unit="kits", unit_weight_kg=1.5, expiry_days=90),

        # Beta (Intentionally deficit in food)
        InventoryItem(warehouse_id=wh_beta.id, category="food", item_name="RTE Meal Packets", total_qty=220, reserved_qty=80, dispatched_qty=60, available_qty=80, min_threshold=350, unit="packets", unit_weight_kg=0.8, expiry_days=20),
        InventoryItem(warehouse_id=wh_beta.id, category="water", item_name="Bottled Spring Water", total_qty=850, reserved_qty=200, dispatched_qty=150, available_qty=500, min_threshold=400, unit="liters", unit_weight_kg=1.0, expiry_days=180),
        InventoryItem(warehouse_id=wh_beta.id, category="medical", item_name="Trauma Emergency Kits", total_qty=140, reserved_qty=30, dispatched_qty=20, available_qty=90, min_threshold=60, unit="kits", unit_weight_kg=1.5, expiry_days=60),

        # Gamma
        InventoryItem(warehouse_id=wh_gamma.id, category="food", item_name="RTE Meal Packets", total_qty=650, reserved_qty=150, dispatched_qty=100, available_qty=400, min_threshold=200, unit="packets", unit_weight_kg=0.8, expiry_days=30),
        InventoryItem(warehouse_id=wh_gamma.id, category="water", item_name="Bottled Spring Water", total_qty=950, reserved_qty=200, dispatched_qty=180, available_qty=570, min_threshold=300, unit="liters", unit_weight_kg=1.0, expiry_days=180),
        InventoryItem(warehouse_id=wh_gamma.id, category="medical", item_name="Trauma Emergency Kits", total_qty=110, reserved_qty=25, dispatched_qty=20, available_qty=65, min_threshold=40, unit="kits", unit_weight_kg=1.5, expiry_days=45),
    ]
    db.add_all(items)

    # 5. Seed 3 Fleet Vehicles
    vehicles = [
        Vehicle(
            id="veh-1",
            reg_number="MH-04-RL-8821",
            name="Heavy Truck RL-01",
            vehicle_type="Heavy 6-Wheel Truck",
            max_capacity_kg=1500,
            home_warehouse_id=wh_alpha.id,
            driver_name="Rajendra Singh",
            driver_phone="+91 97000 44101",
            status="Available",
            current_load_kg=0,
            fuel_percent=92
        ),
        Vehicle(
            id="veh-2",
            reg_number="MH-04-RL-4412",
            name="All-Terrain 4x4 RL-02",
            vehicle_type="Off-Road Cargo Truck",
            max_capacity_kg=800,
            home_warehouse_id=wh_beta.id,
            driver_name="Vikram Joshi",
            driver_phone="+91 97000 44102",
            status="Available",
            current_load_kg=0,
            fuel_percent=85
        ),
        Vehicle(
            id="veh-3",
            reg_number="MH-04-RL-1090",
            name="Rapid Transit Van RL-03",
            vehicle_type="Urban Transit Van",
            max_capacity_kg=500,
            home_warehouse_id=wh_gamma.id,
            driver_name="Faisal Khan",
            driver_phone="+91 97000 44103",
            status="Available",
            current_load_kg=0,
            fuel_percent=78
        )
    ]
    db.add_all(vehicles)
    db.flush()

    # 6. Seed Sample Delivery & Verification
    del1 = Delivery(
        id="del-901",
        delivery_code="DEL-2026-001",
        vehicle_id="veh-1",
        warehouse_id=wh_alpha.id,
        target_location_id="camp-a",
        stage_index=4,
        stage_name="Arrived",
        dispatched_food=200,
        dispatched_water=300,
        dispatched_medical=50,
        created_timestamp=datetime.utcnow() - timedelta(hours=3),
        dispatched_timestamp=datetime.utcnow() - timedelta(hours=2),
        arrived_timestamp=datetime.utcnow() - timedelta(minutes=40)
    )
    db.add(del1)

    ver1 = DeliveryVerification(
        delivery_id="del-901",
        verified_food=190,
        verified_water=300,
        verified_medical=45,
        missing_food=10,
        missing_water=0,
        missing_medical=5,
        recipient_name="Dr. Ananya Roy",
        acknowledgment_code="ACK-SIGNED-AR-1044",
        notes="10 food packets damaged due to water splash. 5 med kits short-shipped.",
        has_discrepancy=True
    )
    db.add(ver1)

    db.commit()
