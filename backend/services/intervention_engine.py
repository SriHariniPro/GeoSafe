from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Hotspot, Intervention, SystemLog

def generate_authority_interventions(db: Session) -> List[Dict[str, Any]]:
    hotspots = db.query(Hotspot).order_by(Hotspot.hotspot_score.desc()).all()
    if not hotspots:
        return []

    # Clear previous interventions
    db.query(Intervention).delete()
    interventions_to_insert = []

    for hs in hotspots:
        loc = f"{hs.road_name or 'Corridor'} ({hs.area_name or 'Chennai'})"
        score = hs.hotspot_score
        dominant_time = hs.dominant_time or "18:00"
        dominant_weather = hs.dominant_weather or "Clear"

        actions = []
        
        # Rule 1: High score + Critical Risk
        if score >= 80:
            actions.append({
                "priority": "CRITICAL",
                "recommended_action": "Conduct Comprehensive Highway Safety Audit & Install Automated Speed Enforcement Cameras",
                "reason": f"Hotspot score is {score}/100 with {hs.accident_count} recorded accidents and severe casualty metrics.",
                "expected_impact": "Estimated 35-45% reduction in high-speed impact collisions."
            })
        
        # Rule 2: Night-time dominant accidents
        try:
            hour = int(dominant_time.split(':')[0]) if isinstance(dominant_time, str) and ':' in dominant_time else 18
            if hour >= 20 or hour <= 5:
                actions.append({
                    "priority": "HIGH",
                    "recommended_action": "Upgrade LED Street Lighting & Install Solar Cat-Eyes Road Studs",
                    "reason": f"Peak accident concentration occurs during night hours ({dominant_time}) under low ambient lighting.",
                    "expected_impact": "Estimated 25-30% reduction in night-time lane-departure accidents."
                })
        except Exception:
            pass

        # Rule 3: Heavy traffic / Congested junction
        actions.append({
            "priority": "HIGH" if score >= 60 else "MEDIUM",
            "recommended_action": "Optimize Signal Timings & Construct Dedicated Right-Turn Bays",
            "reason": f"Arterial junction congestion creates high vehicle conflict density.",
            "expected_impact": "Estimated 20-25% reduction in rear-end and sideswipe collisions."
        })

        # Rule 4: Weather / Rain hazard
        if dominant_weather in ['Rain', 'Heavy Rain', 'Fog/Mist']:
            actions.append({
                "priority": "MEDIUM",
                "recommended_action": "Improve Surface Drainage & Apply High-Friction Anti-Skid Surface Overlay",
                "reason": f"Dominant weather pattern ({dominant_weather}) causes hydroplaning and reduced braking friction.",
                "expected_impact": "Estimated 30% reduction in wet-weather skidding accidents."
            })

        # Select top action for each hotspot
        best_action = actions[0]

        itv = Intervention(
            hotspot_id=hs.id,
            location_name=loc,
            priority=best_action["priority"],
            recommended_action=best_action["recommended_action"],
            reason=best_action["reason"],
            expected_impact=best_action["expected_impact"],
            status="Pending"
        )
        interventions_to_insert.append(itv)

    db.bulk_save_objects(interventions_to_insert)
    db.commit()

    log = SystemLog(
        event=f"Intervention Engine generated {len(interventions_to_insert)} safety recommendations for authorities.",
        user="Authority Engine"
    )
    db.add(log)
    db.commit()

    return [{
        "id": i.id,
        "hotspot_id": i.hotspot_id,
        "location_name": i.location_name,
        "priority": i.priority,
        "recommended_action": i.recommended_action,
        "reason": i.reason,
        "expected_impact": i.expected_impact,
        "status": i.status
    } for i in interventions_to_insert]
