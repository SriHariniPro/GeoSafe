import os
import json
import math
import urllib.request
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models import Accident, Hotspot, ConstructionSite

GRAPH_FILE_PATH = "data/chennai_road_network/chennai_road_graph.json"
CACHE_FILE_PATH = "data/chennai_road_network/routes_cache.json"

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def load_routes_cache() -> Dict[str, Any]:
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_routes_cache(cache: Dict[str, Any]):
    os.makedirs(os.path.dirname(CACHE_FILE_PATH), exist_ok=True)
    try:
        with open(CACHE_FILE_PATH, "w") as f:
            json.dump(cache, f)
    except Exception:
        pass

def fetch_osrm_street_route(coordinates: List[Tuple[float, float]]) -> Tuple[List[List[float]], float, float]:
    """Fetch high-precision street geometry from OSRM router with local disk caching."""
    cache_key = "_".join([f"{lat:.4f},{lon:.4f}" for lat, lon in coordinates])
    cache = load_routes_cache()
    if cache_key in cache:
        cached = cache[cache_key]
        return cached["waypoints"], cached["distance_km"], cached["duration_min"]

    coord_str = ";".join([f"{lon:.5f},{lat:.5f}" for lat, lon in coordinates])
    url = f"https://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GeoSafe/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if "routes" in data and len(data["routes"]) > 0:
            rt = data["routes"][0]
            # Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
            waypoints = [[round(c[1], 6), round(c[0], 6)] for c in rt["geometry"]["coordinates"]]
            dist_km = round(rt["distance"] / 1000.0, 2)
            dur_min = round(rt["duration"] / 60.0, 2)
            # Cache on disk
            cache[cache_key] = {"waypoints": waypoints, "distance_km": dist_km, "duration_min": dur_min}
            save_routes_cache(cache)
            return waypoints, dist_km, dur_min
    except Exception:
        pass

    # Fallback straight interpolation between coordinates
    fallback_pts = []
    for i in range(len(coordinates) - 1):
        p1, p2 = coordinates[i], coordinates[i+1]
        for step in range(15):
            t = step / 15.0
            fallback_pts.append([round(p1[0] + (p2[0]-p1[0])*t, 6), round(p1[1] + (p2[1]-p1[1])*t, 6)])
    fallback_pts.append([coordinates[-1][0], coordinates[-1][1]])
    d = round(haversine_distance(coordinates[0][0], coordinates[0][1], coordinates[-1][0], coordinates[-1][1]), 2)
    return fallback_pts, d, round((d / 40.0) * 60.0, 2)

def resolve_location_coords(db: Session, location_str: str) -> Tuple[str, float, float]:
    clean_str = location_str.strip()
    if not clean_str:
        return "Central Railway Station", 13.0827, 80.2757

    # Location lookup dictionary of major Chennai junctions
    KNOWN_LOCATIONS = {
        "central": ("Central Railway Station", 13.0827, 80.2757),
        "park town": ("Park Town Junction", 13.0780, 80.2730),
        "broadway": ("Broadway Bus Stand", 13.0890, 80.2840),
        "marina": ("Marina Beach", 13.0680, 80.2825),
        "santhome": ("Santhome High Road", 13.0335, 80.2780),
        "mrc nagar": ("MRC Nagar", 13.0180, 80.2750),
        "besant nagar": ("Besant Nagar", 13.0000, 80.2670),
        "adyar": ("Adyar Signal", 13.0012, 80.2565),
        "thiruvanmiyur": ("Thiruvanmiyur Signal", 12.9830, 80.2590),
        "kottivakkam": ("Kottivakkam ECR", 12.9680, 80.2575),
        "palavakkam": ("Palavakkam ECR", 12.9560, 80.2550),
        "neelankarai": ("Neelankarai ECR", 12.9480, 80.2530),
        "injambakkam": ("Injambakkam ECR", 12.9150, 80.2490),
        "royapettah": ("Royapettah Clock Tower", 13.0530, 80.2620),
        "mylapore": ("Mylapore Luz Corner", 13.0330, 80.2690),
        "madhya kailash": ("Madhya Kailash Junction", 13.0080, 80.2450),
        "tidel park": ("Tidel Park OMR", 12.9890, 80.2480),
        "perungudi": ("Perungudi Toll OMR", 12.9650, 80.2410),
        "thoraipakkam": ("Thoraipakkam 200ft Junc", 12.9380, 80.2350),
        "sholinganallur": ("Sholinganallur Junction", 12.9010, 80.2279),
        "thousand lights": ("Anna Salai (Thousand Lights)", 13.0610, 80.2490),
        "gemini": ("Gemini Flyover", 13.0515, 80.2500),
        "teynampet": ("Anna Salai (Teynampet)", 13.0405, 80.2468),
        "nandanam": ("Nandanam Signal", 13.0290, 80.2400),
        "saidapet": ("Saidapet Bridge", 13.0210, 80.2240),
        "guindy": ("Kathipara Junction", 13.0067, 80.2020),
        "kathipara": ("Kathipara Junction", 13.0067, 80.2020),
        "velachery": ("Velachery Check Post", 12.9880, 80.2190),
        "medavakkam": ("Medavakkam Junction", 12.9170, 80.1920),
        "airport": ("Chennai International Airport", 12.9815, 80.1636),
        "meenambakkam": ("Meenambakkam", 12.9815, 80.1636),
        "pallavaram": ("Pallavaram Signal", 12.9670, 80.1480),
        "chromepet": ("Chromepet Flyover", 12.9510, 80.1410),
        "tambaram": ("Tambaram West Bus Stand", 12.9249, 80.1000),
        "nungambakkam": ("Nungambakkam High Road", 13.0610, 80.2380),
        "t nagar": ("Panagal Park", 13.0418, 80.2341),
        "kodambakkam": ("Kodambakkam Bridge", 13.0510, 80.2260),
        "vadapalani": ("Vadapalani Signal", 13.0500, 80.2121),
        "ashok nagar": ("Ashok Pillar", 13.0360, 80.2120),
        "koyambedu": ("Koyambedu CMBT", 13.0694, 80.1948),
        "porur": ("Porur Junction", 13.0330, 80.1580),
        "maduravoyal": ("Maduravoyal Flyover", 13.0660, 80.1600),
        "poonamallee": ("Poonamallee Bypass", 13.0490, 80.0930),
        "ambattur": ("Ambattur OT", 13.1143, 80.1548),
        "avadi": ("Avadi Bus Depot", 13.1170, 80.1010),
        "anna nagar": ("Anna Nagar Roundtana", 13.0850, 80.2150)
    }

    for k, v in KNOWN_LOCATIONS.items():
        if k in clean_str.lower():
            return v[0], v[1], v[2]

    # Search Accident database records
    match = db.query(
        Accident.road_name,
        Accident.area,
        func.avg(Accident.latitude),
        func.avg(Accident.longitude)
    ).filter(
        (Accident.road_name.ilike(f"%{clean_str}%")) | (Accident.area.ilike(f"%{clean_str}%"))
    ).group_by(Accident.road_name).first()

    if match and match[1] and match[2]:
        name = f"{match[0]} ({match[1]})"
        lat = round(float(match[2]), 6)
        lon = round(float(match[3]), 6)
        return name, lat, lon

    return clean_str, 13.0405, 80.2356

def evaluate_candidate_path(
    waypoints: List[List[float]],
    dist_km: float,
    dur_min: float,
    strategy_name: str,
    hotspots: List[Hotspot],
    accidents: List[Accident],
    construction_sites: List[ConstructionSite]
) -> Dict[str, Any]:
    if not waypoints:
        return None

    sampled = waypoints[::max(1, len(waypoints) // 50)]
    min_lat = min(p[0] for p in waypoints) - 0.005
    max_lat = max(p[0] for p in waypoints) + 0.005
    min_lon = min(p[1] for p in waypoints) - 0.005
    max_lon = max(p[1] for p in waypoints) + 0.005

    # Filter accidents within bounding box for fast unique counting
    cand_acc = [a for a in accidents if min_lat <= a.latitude <= max_lat and min_lon <= a.longitude <= max_lon]
    unique_acc = set()
    for a in cand_acc:
        for p in sampled:
            if haversine_distance(p[0], p[1], a.latitude, a.longitude) <= 0.20:
                unique_acc.add(a.accident_id)
                break

    # Transited hotspots (excluding origin & dest endpoints)
    orig_pt = waypoints[0]
    dest_pt = waypoints[-1]
    unique_hs = set()
    for h in hotspots:
        if haversine_distance(orig_pt[0], orig_pt[1], h.latitude, h.longitude) <= 1.0 or haversine_distance(dest_pt[0], dest_pt[1], h.latitude, h.longitude) <= 1.0:
            continue
        for p in sampled:
            if haversine_distance(p[0], p[1], h.latitude, h.longitude) <= 0.6:
                unique_hs.add(h.id)
                break

    unique_const = set()
    for c in construction_sites:
        for p in sampled:
            if haversine_distance(p[0], p[1], c.latitude, c.longitude) <= 0.4:
                unique_const.add(c.id)
                break

    hs_cnt = len(unique_hs)
    acc_cnt = len(unique_acc)
    cs_cnt = len(unique_const)

    acc_density = acc_cnt / max(dist_km, 1.0)
    acc_factor = min(100.0, (acc_density / 35.0) * 100.0)
    hs_factor = min(100.0, hs_cnt * 40.0)
    const_factor = min(100.0, cs_cnt * 25.0)
    speed_factor = min(100.0, (dur_min / max(dist_km, 1.0)) * 25.0)

    route_risk = (0.40 * hs_factor) + (0.35 * acc_factor) + (0.15 * const_factor) + (0.10 * speed_factor)
    safety_score = round(max(10.0, min(98.0, 100.0 - route_risk)), 1)

    if safety_score >= 80:
        level = "VERY SAFE"
    elif safety_score >= 60:
        level = "SAFE"
    elif safety_score >= 40:
        level = "MODERATE"
    elif safety_score >= 20:
        level = "HIGH RISK"
    else:
        level = "CRITICAL"

    breakdown = {
        "hotspot_exposure": round(hs_factor, 1),
        "accident_density_factor": round(acc_factor, 1),
        "construction_risk_factor": round(const_factor, 1),
        "speed_risk_factor": round(speed_factor, 1)
    }

    return {
        "strategy": strategy_name,
        "distance_km": round(dist_km, 1),
        "duration_min": round(dur_min, 1),
        "safety_score": safety_score,
        "risk_level": level,
        "hotspots_crossed": hs_cnt,
        "accidents_near": acc_cnt,
        "acc_density": round(acc_density, 1),
        "construction_near": cs_cnt,
        "risk_exposure_breakdown": breakdown,
        "waypoints": waypoints
    }

def analyze_safety_routes(db: Session, origin: str, destination: str) -> Dict[str, Any]:
    orig_label, orig_lat, orig_lon = resolve_location_coords(db, origin)
    dest_label, dest_lat, dest_lon = resolve_location_coords(db, destination)

    hotspots = db.query(Hotspot).all()
    accidents = db.query(Accident).all()
    construction_sites = db.query(ConstructionSite).all()

    # 1. Primary Direct Route (FASTEST candidate)
    p1, d1, t1 = fetch_osrm_street_route([(orig_lat, orig_lon), (dest_lat, dest_lon)])
    fast_eval = evaluate_candidate_path(p1, d1, t1, "FASTEST", hotspots, accidents, construction_sites)

    # 2. Generate Lateral / Bypass Candidates for SAFEST and BALANCED
    mid_lat = (orig_lat + dest_lat) / 2.0
    mid_lon = (orig_lon + dest_lon) / 2.0
    dlat = dest_lat - orig_lat
    dlon = dest_lon - orig_lon

    vias = [
        (mid_lat - dlon * 0.4, mid_lon + dlat * 0.4),
        (mid_lat + dlon * 0.4, mid_lon - dlat * 0.4),
        (mid_lat - dlon * 0.7, mid_lon + dlat * 0.7),
        (mid_lat + dlon * 0.7, mid_lon - dlat * 0.7),
        (13.0000, 80.2670),  # Besant Nagar Coastal
        (12.9830, 80.2590),  # Thiruvanmiyur ECR
        (12.9380, 80.2350),  # 200ft Radial Rd
        (13.0660, 80.1600),  # Maduravoyal Bypass
        (13.0067, 80.2020),  # Kathipara Junction
    ]

    candidates = [fast_eval]
    for v in vias:
        pts, d, t = fetch_osrm_street_route([(orig_lat, orig_lon), v, (dest_lat, dest_lon)])
        if pts and len(pts) > 20 and abs(d - d1) > 0.4 and d < d1 * 2.2:
            ev = evaluate_candidate_path(pts, d, t, "CAND", hotspots, accidents, construction_sites)
            if ev and not any(abs(c["distance_km"] - ev["distance_km"]) < 0.2 for c in candidates):
                candidates.append(ev)

    # 3. Strategy Selection
    # FASTEST: Minimum duration route
    best_fast = dict(min(candidates, key=lambda x: x["duration_min"]))
    best_fast["strategy"] = "FASTEST"

    # SAFEST: Maximum safety score (tie-break with lower accident density)
    best_safe = dict(max(candidates, key=lambda x: (x["safety_score"], -x["acc_density"])))
    best_safe["strategy"] = "SAFEST"

    # BALANCED: Best Pareto trade-off between time and safety
    bal_pool = [c for c in candidates if c["distance_km"] != best_fast["distance_km"] and c["distance_km"] != best_safe["distance_km"]]
    if not bal_pool:
        bal_pool = candidates

    best_bal = dict(max(bal_pool, key=lambda x: x["safety_score"] - 0.3 * (x["duration_min"] - best_fast["duration_min"])))
    best_bal["strategy"] = "BALANCED"

    # Ensure all 3 have distinct objects and valid strategy badges
    return {
        "origin": orig_label,
        "destination": dest_label,
        "origin_coords": [orig_lat, orig_lon],
        "destination_coords": [dest_lat, dest_lon],
        "routes": [best_fast, best_bal, best_safe]
    }
