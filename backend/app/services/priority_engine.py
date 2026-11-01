from datetime import datetime
from typing import Dict, Any, List

def calculate_priority_score(location) -> Dict[str, Any]:
    # Factor 1: Population up to 1000 (30% weight)
    pop_val = location.population if hasattr(location, 'population') else location.get('population', 500)
    pop_factor = min(pop_val / 1000.0, 1.0) * 30.0

    # Factor 2: Injured casualties up to 50 (30% weight)
    injured_val = location.injured_count if hasattr(location, 'injured_count') else location.get('injured_count', 0)
    injured_factor = min(injured_val / 50.0, 1.0) * 30.0

    # Factor 3: Time elapsed since last delivery up to 36 hrs (20% weight)
    hours_val = location.last_delivery_hours_ago if hasattr(location, 'last_delivery_hours_ago') else location.get('last_delivery_hours_ago', 12)
    time_factor = min(hours_val / 36.0, 1.0) * 20.0

    # Factor 4: Disaster severity (15% weight)
    sev_val = location.severity if hasattr(location, 'severity') else location.get('severity', 'High')
    severity_map = {"Critical": 15.0, "High": 10.0, "Medium": 6.0, "Low": 2.0}
    severity_factor = severity_map.get(sev_val, 8.0)

    # Factor 5: Unmet demand ratio (10% weight)
    food_dem = location.demands_food if hasattr(location, 'demands_food') else location.get('demands_food', 0)
    water_dem = location.demands_water if hasattr(location, 'demands_water') else location.get('demands_water', 0)
    med_dem = location.demands_medical if hasattr(location, 'demands_medical') else location.get('demands_medical', 0)
    total_dem = food_dem + water_dem + med_dem

    food_rec = location.received_food if hasattr(location, 'received_food') else location.get('received_food', 0)
    water_rec = location.received_water if hasattr(location, 'received_water') else location.get('received_water', 0)
    med_rec = location.received_medical if hasattr(location, 'received_medical') else location.get('received_medical', 0)
    total_rec = food_rec + water_rec + med_rec

    if total_dem > 0:
        unmet_ratio = max(0.0, 1.0 - (total_rec / (total_dem * 1.5)))
    else:
        unmet_ratio = 0.5
    demand_factor = unmet_ratio * 10.0

    raw_score = int(round(pop_factor + injured_factor + time_factor + severity_factor + demand_factor))
    score = min(max(raw_score, 10), 99)

    if score >= 85:
        status = "Critical"
    elif score >= 70:
        status = "High"
    elif score >= 50:
        status = "Medium"
    else:
        status = "Low"

    name_val = location.name if hasattr(location, 'name') else location.get('name', 'Camp')
    explanation = generate_rationale(name_val, score, status, pop_val, injured_val, hours_val, water_dem)

    return {
        "score": score,
        "status": status,
        "explanation": explanation,
        "breakdown": {
            "population_pts": int(round(pop_factor)),
            "casualty_pts": int(round(injured_factor)),
            "time_latency_pts": int(round(time_factor)),
            "severity_pts": int(round(severity_factor)),
            "demand_pts": int(round(demand_factor))
        }
    }

def generate_rationale(name: str, score: int, status: str, pop: int, injured: int, hours: int, water: int) -> str:
    reasons = []
    if pop >= 900:
        reasons.append(f"large affected population ({pop:,} individuals)")
    if injured >= 30:
        reasons.append(f"high casualty load with {injured} reported injuries")
    if hours >= 24:
        reasons.append(f"critical supply delay of {hours} hours since previous delivery")
    if water >= 500:
        reasons.append(f"severe drinking water deficit ({water}L requested)")

    if not reasons:
        return f"{name} – Categorized as {status} ({score}/100) with stable supply buffer and low immediate casualty risk."
    return f"{name} – Categorized as {status} ({score}/100) because of {', '.join(reasons)}."

def check_duplicate_request(new_req_dict: dict, existing_requests: List[Any]) -> dict:
    new_loc = new_req_dict.get("location_id")
    new_food = new_req_dict.get("food_qty", 0)
    new_water = new_req_dict.get("water_qty", 0)
    new_med = new_req_dict.get("medical_qty", 0)
    new_time = new_req_dict.get("timestamp", datetime.utcnow())

    for req in existing_requests:
        req_loc = req.location_id if hasattr(req, "location_id") else req.get("location_id")
        if req_loc == new_loc:
            req_time = req.timestamp if hasattr(req, "timestamp") else req.get("timestamp", datetime.utcnow())
            if isinstance(req_time, str):
                try:
                    req_time = datetime.fromisoformat(req_time.replace("Z", "+00:00"))
                except:
                    req_time = datetime.utcnow()
            diff_hours = abs((new_time - req_time).total_seconds()) / 3600.0

            if diff_hours <= 6.0:
                f_qty = req.food_qty if hasattr(req, "food_qty") else req.get("food_qty", 0)
                w_qty = req.water_qty if hasattr(req, "water_qty") else req.get("water_qty", 0)
                m_qty = req.medical_qty if hasattr(req, "medical_qty") else req.get("medical_qty", 0)

                diff_total = abs(f_qty - new_food) + abs(w_qty - new_water) + abs(m_qty - new_med)
                base = f_qty + w_qty + m_qty
                if base > 0 and (diff_total / base) < 0.35:
                    req_id = req.id if hasattr(req, "id") else req.get("id")
                    requester = req.requester_name if hasattr(req, "requester_name") else req.get("requester_name", "Volunteer")
                    return {
                        "is_duplicate": True,
                        "duplicate_of_id": req_id,
                        "reason": f"Duplicate detected: matching supply profile submitted {diff_hours:.1f} hrs ago by {requester} ({req_id}). Auto-suppressed to avoid double-allocation."
                    }
    return {"is_duplicate": False, "duplicate_of_id": None, "reason": None}
