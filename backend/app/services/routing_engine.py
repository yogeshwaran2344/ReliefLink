from typing import List, Dict, Any
from app.services.allocation_engine import compute_haversine_distance

def optimize_fleet_routes(vehicles: List[Any], allocations: List[Any], warehouses: List[Any], road_blocked: bool = False) -> List[Dict[str, Any]]:
    # Deep copy fleet
    fleet = []
    for v in vehicles:
        fleet.append({
            "id": v.id,
            "reg_number": v.reg_number,
            "name": v.name,
            "type": v.vehicle_type,
            "max_capacity_kg": v.max_capacity_kg,
            "home_warehouse_id": v.home_warehouse_id,
            "current_load_kg": 0,
            "cargo": {"food": 0, "water": 0, "medical": 0},
            "stops": [],
            "estimated_distance_km": 0.0,
            "estimated_minutes": 0,
            "detour_enacted": False
        })

    # Drops with non-zero allocation
    drops = [a for a in allocations if a.get("total_weight_kg", 0) > 0]
    drops.sort(key=lambda x: x.get("priority_score", 0), reverse=True)

    for drop in drops:
        rem_weight = drop["total_weight_kg"]
        rem_food = drop["food_allocated"]
        rem_water = drop["water_allocated"]
        rem_med = drop["medical_allocated"]

        for veh in fleet:
            if rem_weight <= 0:
                break
            available_cap = veh["max_capacity_kg"] - veh["current_load_kg"]
            if available_cap > 20:
                chunk_weight = min(rem_weight, available_cap)
                ratio = chunk_weight / rem_weight if rem_weight > 0 else 0

                c_food = int(round(rem_food * ratio))
                c_water = int(round(rem_water * ratio))
                c_med = int(round(rem_med * ratio))

                veh["current_load_kg"] += int(round(chunk_weight))
                veh["cargo"]["food"] += c_food
                veh["cargo"]["water"] += c_water
                veh["cargo"]["medical"] += c_med

                veh["stops"].append({
                    "location_id": drop["location_id"],
                    "priority_score": drop["priority_score"],
                    "weight_kg": int(round(chunk_weight)),
                    "food": c_food,
                    "water": c_water,
                    "medical": c_med,
                    "sequence": len(veh["stops"]) + 1
                })

                rem_weight -= chunk_weight
                rem_food -= c_food
                rem_water -= c_water
                rem_med -= c_med

    # Calculate distance and apply blockage detours
    for veh in fleet:
        wh = next((w for w in warehouses if w.id == veh["home_warehouse_id"]), warehouses[0] if warehouses else None)
        origin_lat = wh.latitude if wh else 19.0760
        origin_lon = wh.longitude if wh else 72.8777
        total_dist = 0.0

        prev_lat, prev_lon = origin_lat, origin_lon
        for stop in veh["stops"]:
            # mock distance step approx 8-14km
            leg = 11.2
            if road_blocked:
                veh["detour_enacted"] = True
                leg += 7.4 # detour penalty
            total_dist += leg

        # Return to base
        total_dist += 8.5
        veh["estimated_distance_km"] = round(total_dist, 1)

        # Average disaster speed 30km/h
        base_mins = (veh["estimated_distance_km"] / 30.0) * 60.0
        if road_blocked:
            base_mins += 45.0
        veh["estimated_minutes"] = int(round(base_mins))

    return fleet
