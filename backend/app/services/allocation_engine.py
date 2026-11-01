import math
from typing import List, Dict, Any
from app.services.priority_engine import calculate_priority_score

def compute_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def run_allocation_optimization(locations: List[Any], warehouses: List[Any]) -> List[Dict[str, Any]]:
    # Deep copy stock representation
    wh_stock = {}
    for wh in warehouses:
        wh_stock[wh.id] = {
            "warehouse": wh,
            "items": {}
        }
        for item in wh.inventory_items:
            wh_stock[wh.id]["items"][item.category] = {
                "available": item.available_qty,
                "unit_weight": item.unit_weight_kg
            }

    # Score camps and sort by Priority Score descending (Highest Urgency First)
    scored = []
    for loc in locations:
        p = calculate_priority_score(loc)
        scored.append({"loc": loc, "priority": p})
    scored.sort(key=lambda x: x["priority"]["score"], reverse=True)

    allocations = []

    for entry in scored:
        loc = entry["loc"]
        p = entry["priority"]

        food_needed = max(0, loc.demands_food - loc.received_food)
        water_needed = max(0, loc.demands_water - loc.received_water)
        med_needed = max(0, loc.demands_medical - loc.received_medical)

        # Fulfill factor based on priority tier
        factor = 1.0 if p["score"] >= 85 else 0.85 if p["score"] >= 70 else 0.65
        target_food = int(round(food_needed * factor))
        target_water = int(round(water_needed * factor))
        target_med = int(round(med_needed * factor))

        # Sort warehouses by distance to camp
        wh_dists = []
        for wh in warehouses:
            dist = compute_haversine_distance(loc.latitude, loc.longitude, wh.latitude, wh.longitude)
            wh_dists.append({"wh_id": wh.id, "dist": dist, "wh": wh})
        wh_dists.sort(key=lambda x: x["dist"])

        alloc_food = 0
        alloc_water = 0
        alloc_med = 0
        primary_wh_id = wh_dists[0]["wh_id"] if wh_dists else None

        for item in wh_dists:
            wid = item["wh_id"]
            stock_dict = wh_stock[wid]["items"]

            # Food
            rem_f = target_food - alloc_food
            avail_f = stock_dict.get("food", {}).get("available", 0)
            if rem_f > 0 and avail_f > 0:
                take_f = min(rem_f, avail_f)
                alloc_food += take_f
                stock_dict["food"]["available"] -= take_f

            # Water
            rem_w = target_water - alloc_water
            avail_w = stock_dict.get("water", {}).get("available", 0)
            if rem_w > 0 and avail_w > 0:
                take_w = min(rem_w, avail_w)
                alloc_water += take_w
                stock_dict["water"]["available"] -= take_w

            # Medical
            rem_m = target_med - alloc_med
            avail_m = stock_dict.get("medical", {}).get("available", 0)
            if rem_m > 0 and avail_m > 0:
                take_m = min(rem_m, avail_m)
                alloc_med += take_m
                stock_dict["medical"]["available"] -= take_m

        total_weight = (alloc_food * 0.8) + (alloc_water * 1.0) + (alloc_med * 1.5)
        rem_short_f = max(0, food_needed - alloc_food)
        rem_short_w = max(0, water_needed - alloc_water)
        rem_short_m = max(0, med_needed - alloc_med)

        wh_name = next((w.name for w in warehouses if w.id == primary_wh_id), "Regional Depot")
        if p["score"] >= 85:
            explanation = f"{loc.name} prioritized for emergency dispatch (Score {p['score']}/100) from {wh_name} to address critical medical/water deficits."
        elif p["score"] >= 70:
            explanation = f"{loc.name} received high allocation balancing casualty load with remaining regional depot buffers."
        else:
            explanation = f"{loc.name} provided fair-share buffer allocation. Secondary drops scheduled to maintain critical reserve stock."

        allocations.append({
            "location_id": loc.id,
            "warehouse_id": primary_wh_id,
            "priority_score": p["score"],
            "priority_status": p["status"],
            "food_allocated": alloc_food,
            "water_allocated": alloc_water,
            "medical_allocated": alloc_med,
            "total_weight_kg": round(total_weight, 1),
            "remaining_food_shortage": rem_short_f,
            "remaining_water_shortage": rem_short_w,
            "remaining_medical_shortage": rem_short_m,
            "explanation": explanation
        })

    return allocations
