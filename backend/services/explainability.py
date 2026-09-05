from typing import Dict, Any, List

FEATURE_HUMAN_NAMES = {
    'latitude': 'Spatial Location / Cluster Density',
    'longitude': 'Geographic Corridor',
    'hour': 'Time of Day',
    'is_weekend': 'Weekend Condition',
    'is_night': 'Night-time Low Visibility',
    'is_peak_hour': 'Peak Traffic Hours',
    'weather_code': 'Adverse Weather',
    'traffic_code': 'Heavy Traffic Volume',
    'road_type_code': 'High-Speed Road Category',
    'speed_limit': 'Speed Limit Threshold',
    'construction_code': 'Active Construction Zone',
    'visibility': 'Reduced Atmospheric Visibility',
    'temperature': 'Ambient Temperature',
    'traffic_severity_index': 'Traffic Speed-Volume Severity',
    'weather_risk_index': 'Weather-Visibility Exposure'
}

REDUCTION_RECOMMENDATIONS = {
    'traffic_code': 'Implement traffic signal optimization or deploy traffic marshals during peak hours.',
    'is_night': 'Upgrade street lighting and install reflective road studs / cat-eyes.',
    'construction_code': 'Deploy high-visibility safety barriers, speed bumps, and illuminated warning signages.',
    'speed_limit': 'Install automated speed enforcement cameras and rumble strips.',
    'weather_code': 'Display dynamic VMS (Variable Message Sign) speed warnings during heavy rain or fog.',
    'road_type_code': 'Redesign intersection geometry and add dedicated turn lanes.',
    'visibility': 'Ensure fog lamps warning indicators and active lane demarcations.'
}

def generate_risk_explanation(
    data: Dict[str, Any], 
    score: float, 
    label: str, 
    confidence: float, 
    contribs: Dict[str, float]
) -> Dict[str, Any]:
    
    # Sort contributions by percentage descending
    sorted_contribs = sorted(contribs.items(), key=lambda x: x[1], reverse=True)

    explanations = []
    top_factors_names = []

    for feat_key, pct in sorted_contribs[:5]:
        human_name = FEATURE_HUMAN_NAMES.get(feat_key, feat_key)
        top_factors_names.append(human_name)
        
        # Impact heuristic
        impact = "increases_risk" if pct > 15.0 else "moderate_factor"
        
        explanations.append({
            "feature": human_name,
            "percentage": pct,
            "impact": impact
        })

    # Generate why_risky natural language bullet points
    why_risky = []
    traffic_lvl = data.get('traffic_level', 'Medium')
    weather = data.get('weather', 'Clear')
    construction = data.get('construction', 'No')
    time_str = data.get('time', '18:00')

    if traffic_lvl in ['High', 'Heavy', 'Congested']:
        why_risky.append(f"Elevated vehicle volume under {traffic_lvl} traffic increases conflict points.")
    if weather in ['Rain', 'Heavy Rain', 'Fog/Mist']:
        why_risky.append(f"Adverse weather conditions ({weather}) reduce pavement traction and driver visibility.")
    if str(construction).lower() in ['yes', '1', 'true']:
        why_risky.append("Active construction activity creates lane narrowings and hazard obstacles.")
    
    try:
        hour = int(time_str.split(':')[0])
        if hour >= 20 or hour <= 5:
            why_risky.append("Night-time hours limit driver reaction time and spatial awareness.")
        elif (8 <= hour <= 10) or (17 <= hour <= 20):
            why_risky.append("Peak rush-hour congestion increases driver stress and sudden braking risks.")
    except Exception:
        pass

    if not why_risky:
        why_risky.append("Historical accident density in this spatial zone elevates baseline exposure.")

    # Generate reduction suggestions
    reduction_suggestions = []
    for feat_key, _ in sorted_contribs[:4]:
        if feat_key in REDUCTION_RECOMMENDATIONS:
            rec = REDUCTION_RECOMMENDATIONS[feat_key]
            if rec not in reduction_suggestions:
                reduction_suggestions.append(rec)

    if not reduction_suggestions:
        reduction_suggestions.append("Conduct a comprehensive road safety audit and enhance warning signages.")

    return {
        "risk_score": score,
        "risk_level": label,
        "confidence": confidence,
        "explanations": explanations,
        "why_risky": why_risky,
        "reduction_suggestions": reduction_suggestions
    }
