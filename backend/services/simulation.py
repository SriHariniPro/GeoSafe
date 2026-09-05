from typing import Dict, Any
from backend.ml.predict import predict_risk_from_dict
from backend.services.explainability import generate_risk_explanation

def run_what_if_simulation(req_data: Dict[str, Any]) -> Dict[str, Any]:
    # Baseline Scenario Dict
    base_dict = {
        "latitude": req_data.get("latitude", 13.04),
        "longitude": req_data.get("longitude", 80.23),
        "road_name": req_data.get("road_name", "Main Road"),
        "area": req_data.get("area", "Chennai"),
        "time": req_data.get("base_time", "18:30"),
        "day_of_week": req_data.get("day_of_week", "Friday"),
        "weather": req_data.get("base_weather", "Clear"),
        "visibility": req_data.get("base_visibility", 5.0),
        "traffic_level": req_data.get("base_traffic", "High"),
        "road_type": req_data.get("road_type", "Arterial"),
        "speed_limit": req_data.get("base_speed_limit", 60),
        "construction": req_data.get("base_construction", "No"),
        "temperature": 30.0
    }

    # Simulation Scenario Dict
    sim_dict = {
        "latitude": req_data.get("latitude", 13.04),
        "longitude": req_data.get("longitude", 80.23),
        "road_name": req_data.get("road_name", "Main Road"),
        "area": req_data.get("area", "Chennai"),
        "time": req_data.get("sim_time", "18:30"),
        "day_of_week": req_data.get("day_of_week", "Friday"),
        "weather": req_data.get("sim_weather", "Rain"),
        "visibility": req_data.get("sim_visibility", 2.0),
        "traffic_level": req_data.get("sim_traffic", "Heavy"),
        "road_type": req_data.get("road_type", "Arterial"),
        "speed_limit": req_data.get("sim_speed_limit", 60),
        "construction": req_data.get("sim_construction", "Yes"),
        "temperature": 30.0
    }

    base_score, base_label, base_conf, base_contribs = predict_risk_from_dict(base_dict)
    sim_score, sim_label, sim_conf, sim_contribs = predict_risk_from_dict(sim_dict)

    risk_delta = round(sim_score - base_score, 1)

    base_exp = generate_risk_explanation(base_dict, base_score, base_label, base_conf, base_contribs)
    sim_exp = generate_risk_explanation(sim_dict, sim_score, sim_label, sim_conf, sim_contribs)

    # Construct dynamic natural language summary
    changes = []
    if base_dict['traffic_level'] != sim_dict['traffic_level']:
        changes.append(f"traffic changed from {base_dict['traffic_level']} to {sim_dict['traffic_level']}")
    if base_dict['weather'] != sim_dict['weather']:
        changes.append(f"weather changed to {sim_dict['weather']}")
    if base_dict['construction'] != sim_dict['construction']:
        changes.append("construction activity was introduced" if sim_dict['construction'] == 'Yes' else "construction was cleared")
    if base_dict['speed_limit'] != sim_dict['speed_limit']:
        changes.append(f"speed limit changed to {sim_dict['speed_limit']} km/h")
    if base_dict['visibility'] != sim_dict['visibility']:
        changes.append(f"visibility decreased to {sim_dict['visibility']} km")

    changes_str = ", ".join(changes) if changes else "contextual conditions were adjusted"

    if risk_delta > 0:
        summary_reason = f"Risk increased by {abs(risk_delta)} points because {changes_str}."
    elif risk_delta < 0:
        summary_reason = f"Risk decreased by {abs(risk_delta)} points because {changes_str}."
    else:
        summary_reason = "Risk score remained unchanged across the simulated scenario."

    return {
        "base_risk_score": base_score,
        "base_risk_level": base_label,
        "sim_risk_score": sim_score,
        "sim_risk_level": sim_label,
        "risk_delta": risk_delta,
        "summary_reason": summary_reason,
        "base_explanations": base_exp["explanations"],
        "sim_explanations": sim_exp["explanations"]
    }
