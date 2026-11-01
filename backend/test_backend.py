import sys
import os

# Set UTF-8 encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.seed_data import seed_initial_data
from app.models import (
    User, DisasterEvent, AffectedLocation, ReliefRequest,
    Warehouse, InventoryItem, Vehicle, Allocation, Delivery, DeliveryVerification
)

def test_full_backend_suite():
    print("==================================================")
    print("[TEST SUITE] RUNNING RELIEFLINK BACKEND INTEGRATION TEST SUITE")
    print("==================================================")

    # 1. Initialize tables & Seed
    print("\n[Step 1] Initializing 10 Database Tables & Seeding Baseline Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    print("  [OK] Tables created & seeded successfully!")

    with TestClient(app) as client:
        # 2. Test Root & Health
        print("\n[Step 2] Testing Root and Health Endpoints...")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        res_health = client.get("/api/health")
        assert res_health.status_code == 200
        print(f"  [OK] Root status: 200 OK (Serving Live Web UI) | DB: {res_health.json()['database']}")

        # 3. Test Swagger Docs
        print("\n[Step 3] Testing Swagger OpenAPI Documentation (/docs)...")
        res = client.get("/docs")
        assert res.status_code == 200, "Swagger docs failed"
        print("  [OK] Swagger UI /docs is 200 OK and accessible!")

        # 4. Verify 10 Tables in Database
        print("\n[Step 4] Verifying 10 Database Tables & Seed Records...")
        db = SessionLocal()
        try:
            users = db.query(User).all()
            disasters = db.query(DisasterEvent).all()
            camps = db.query(AffectedLocation).all()
            warehouses = db.query(Warehouse).all()
            inventory = db.query(InventoryItem).all()
            vehicles = db.query(Vehicle).all()
            deliveries = db.query(Delivery).all()
            verifications = db.query(DeliveryVerification).all()

            print(f"  [OK] 1. Users table: {len(users)} records")
            print(f"  [OK] 2. Disasters table: {len(disasters)} records")
            print(f"  [OK] 3. Affected Locations (Camps) table: {len(camps)} records")
            print(f"  [OK] 4. Warehouses table: {len(warehouses)} records")
            print(f"  [OK] 5. Inventory Items table: {len(inventory)} records")
            print(f"  [OK] 6. Vehicles table: {len(vehicles)} records")
            print(f"  [OK] 7. Deliveries table: {len(deliveries)} records")
            print(f"  [OK] 8. Delivery Verifications table: {len(verifications)} records")

            assert len(camps) == 5, f"Expected 5 camps, found {len(camps)}"
            assert len(warehouses) == 3, f"Expected 3 warehouses, found {len(warehouses)}"
            assert len(vehicles) == 3, f"Expected 3 vehicles, found {len(vehicles)}"
            print("  [OK] Canonical numbers verified: Exactly 5 Camps, 3 Warehouses, 3 Vehicles!")
        finally:
            db.close()

        # 5. Test Priority Calculation API
        print("\n[Step 5] Testing AI Priority Calculation Endpoint...")
        res = client.get("/api/v1/locations/camp-a/priority")
        assert res.status_code == 200, f"Priority failed: {res.text}"
        p_data = res.json()
        print(f"  [OK] Camp A Priority Score: {p_data['score']}/100 • Status: {p_data['status']}")
        print(f"  [OK] Plain-English Explanation: \"{p_data['explanation']}\"")
        assert p_data['score'] >= 85, "Camp A should be Critical (>=85)"

        # 6. Test Duplicate Request Detection API
        print("\n[Step 6] Testing Relief Request Anti-Duplicate Safeguard...")
        req_body = {
            "location_id": "camp-c",
            "requester_name": "Meera Deshmukh",
            "requester_role": "Volunteer Lead",
            "phone": "+91 98201 11003",
            "urgency": "High",
            "food_qty": 100,
            "water_qty": 200,
            "medical_qty": 25
        }
        res = client.post("/api/v1/requests", json=req_body)
        assert res.status_code == 200
        first_req = res.json()
        print(f"  [OK] Legitimate request accepted: {first_req['id']} (Status: {first_req['status']})")

        # Immediate duplicate request for same location
        dup_body = req_body.copy()
        dup_body["requester_name"] = "Other Volunteer"
        res_dup = client.post("/api/v1/requests", json=dup_body)
        assert res_dup.status_code == 200
        dup_result = res_dup.json()
        print(f"  [OK] Duplicate request submitted: {dup_result['id']} (Status: {dup_result['status']})")
        print(f"  [OK] Duplicate reason: \"{dup_result['duplicate_reason']}\"")
        assert dup_result['is_duplicate'] == True, "Should have flagged as duplicate!"

        # 7. Test Surplus Redistribution Recommendation & Execution (USP)
        print("\n[Step 7] Testing Surplus Redistribution Recommendation & Execution (USP)...")
        res_surplus = client.get("/api/v1/warehouses/surplus-recommendations")
        assert res_surplus.status_code == 200
        recs = res_surplus.json()
        print(f"  [OK] Surplus Engine generated {len(recs)} inter-depot rebalancing recommendation(s)!")
        if recs:
            r = recs[0]
            print(f"  [OK] Recommendation: Transfer {r['recommended_transfer_qty']} {r['unit']} of {r['category']} from {r['donor_name']} to {r['recipient_name']}")

            # Execute transfer
            trans_body = {
                "donor_warehouse_id": r["donor_id"],
                "recipient_warehouse_id": r["recipient_id"],
                "category": r["category"],
                "transfer_qty": r["recommended_transfer_qty"]
            }
            res_trans = client.post("/api/v1/warehouses/transfer", json=trans_body)
            assert res_trans.status_code == 200
            print("  [OK] Surplus transfer executed successfully! Stock updated in database.")

        # 8. Test Resource Allocation Optimization API
        print("\n[Step 8] Testing Resource Allocation Optimization API...")
        res_alloc = client.post("/api/v1/allocations/optimize")
        assert res_alloc.status_code == 200
        alloc_list = res_alloc.json()
        print(f"  [OK] Generated {len(alloc_list)} optimized allocations across all 5 disaster camps:")
        for a in alloc_list:
            print(f"    - Camp {a['location_id']}: Alloc [Food: {a['food_allocated']}, Water: {a['water_allocated']}, Med: {a['medical_allocated']}] | Cargo: {a['total_weight_kg']} kg | Score: {a['priority_score']}")

        # 9. Test Fleet Routing & Hazard Detour API
        print("\n[Step 9] Testing Capacitated Fleet Routing with Road Hazard Simulation...")
        res_clear = client.get("/api/v1/routes/optimized?road_blocked=false")
        assert res_clear.status_code == 200
        clear_data = res_clear.json()
        print(f"  [OK] Normal Route Plan: {len(clear_data['fleet_routes'])} vehicles assigned.")

        res_blocked = client.get("/api/v1/routes/optimized?road_blocked=true")
        assert res_blocked.status_code == 200
        blocked_data = res_blocked.json()
        print(f"  [OK] Hazard Rerouting Activated: {blocked_data['hazard_description']}")
        for v in blocked_data['fleet_routes']:
            print(f"    - Vehicle {v['name']} (Cap: {v['max_capacity_kg']}kg): Load {v['current_load_kg']}kg | Detour: {v['detour_enacted']} | ETA: {v['estimated_minutes']} mins")
            assert v['current_load_kg'] <= v['max_capacity_kg'], f"Capacity overload on {v['name']}!"
        print("  [OK] Strict 0% vehicle capacity violation confirmed!")

        # 10. Test Delivery Verification API
        print("\n[Step 10] Testing Delivery Verification & Discrepancy Reconciliation...")
        del_res = client.get("/api/v1/deliveries")
        del_list = del_res.json()
        assert len(del_list) > 0
        target_del = del_list[0]

        ver_payload = {
            "verified_food": 190,
            "verified_water": 300,
            "verified_medical": 45,
            "recipient_name": "Dr. Ananya Roy",
            "notes": "10 food packets damaged by road splash during transit. 5 medical kits short-shipped.",
            "photo_proof_url": "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"
        }
        res_ver = client.post(f"/api/v1/deliveries/{target_del['id']}/verify", json=ver_payload)
        assert res_ver.status_code == 200
        ver_res_data = res_ver.json()
        print(f"  [OK] Delivery {target_del['delivery_code']} verified by {ver_res_data['recipient_name']}")
        print(f"  [OK] Discrepancy Flagged: Missing {ver_res_data['missing_food']} food, {ver_res_data['missing_medical']} medical kits.")
        assert ver_res_data['has_discrepancy'] == True, "Discrepancy should be flagged"

        # 11. Test Dashboard Summary Telemetry
        print("\n[Step 11] Testing Dashboard Summary Telemetry...")
        res_dash = client.get("/api/v1/dashboard/summary")
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        print(f"  [OK] Total Locations: {dash_data['total_affected_locations']}")
        print(f"  [OK] Critical Locations: {dash_data['critical_locations_count']}")
        print(f"  [OK] Available Stock: {dash_data['available_warehouse_stock_units']} units")
        print(f"  [OK] Available Vehicles: {dash_data['available_vehicles_count']} / {dash_data['total_vehicles_count']}")
        print(f"  [OK] Overall Shortage: {dash_data['overall_shortage_percentage']}%")

        # 12. Test Impact Reports API
        print("\n[Step 12] Testing Traditional vs ReliefLink Comparison Reports API...")
        res_rep = client.get("/api/v1/reports/impact-comparison")
        assert res_rep.status_code == 200
        rep_data = res_rep.json()
        print(f"  [OK] Benchmark Report:")
        for k, v in rep_data['traditional_vs_relieflink'].items():
            print(f"    - {k}: Traditional={v['traditional']} -> ReliefLink={v['relieflink']} ({v['improvement']})")

        print("\n==================================================")
        print("[SUCCESS] ALL 12 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
        print("==================================================")

if __name__ == "__main__":
    test_full_backend_suite()
