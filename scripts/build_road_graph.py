import os
import json
import math

def haversine_dist(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def compute_geom_distance(geom):
    total = 0.0
    for i in range(len(geom) - 1):
        total += haversine_dist(geom[i][0], geom[i][1], geom[i+1][0], geom[i+1][1])
    return round(max(total, 0.4), 2)

def build_chennai_road_graph():
    os.makedirs("data/chennai_road_network", exist_ok=True)

    # 54 Precise Nodes across Chennai
    nodes = {
        "N_CENTRAL": {"name": "Central Railway Station", "area": "Park Town", "lat": 13.0827, "lon": 80.2757},
        "N_PARK": {"name": "Park Town Junction", "area": "Park Town", "lat": 13.0780, "lon": 80.2730},
        "N_BROADWAY": {"name": "Broadway Bus Stand", "area": "Parrys", "lat": 13.0890, "lon": 80.2840},
        "N_BEACH_MARINA": {"name": "Marina Beach (Napier Bridge)", "area": "Marina", "lat": 13.0680, "lon": 80.2825},
        "N_SANTHOME": {"name": "Santhome High Road", "area": "Santhome", "lat": 13.0335, "lon": 80.2780},
        "N_MRC_NAGAR": {"name": "MRC Nagar", "area": "Raja Annamalaipuram", "lat": 13.0180, "lon": 80.2750},
        "N_BESANT_NAGAR": {"name": "Besant Nagar Beach", "area": "Besant Nagar", "lat": 13.0000, "lon": 80.2670},
        "N_ADYAR_LB": {"name": "Adyar LB Road Signal", "area": "Adyar", "lat": 13.0012, "lon": 80.2565},
        "N_THIRUVANMIYUR": {"name": "Thiruvanmiyur Signal", "area": "Thiruvanmiyur", "lat": 12.9830, "lon": 80.2590},
        "N_KOTTIVAKKAM": {"name": "Kottivakkam ECR", "area": "Kottivakkam", "lat": 12.9680, "lon": 80.2575},
        "N_ECR_PALAVAKKAM": {"name": "Palavakkam ECR", "area": "Palavakkam", "lat": 12.9560, "lon": 80.2550},
        "N_ECR_NEELANKARAI": {"name": "Neelankarai ECR", "area": "Neelankarai", "lat": 12.9480, "lon": 80.2530},
        "N_ECR_INJAMBAKKAM": {"name": "Injambakkam ECR", "area": "Injambakkam", "lat": 12.9150, "lon": 80.2490},
        "N_ROYAPETTAH": {"name": "Royapettah Clock Tower", "area": "Royapettah", "lat": 13.0530, "lon": 80.2620},
        "N_MYLAPORE": {"name": "Mylapore Luz Corner", "area": "Mylapore", "lat": 13.0330, "lon": 80.2690},
        "N_MADHYA_KAILASH": {"name": "Madhya Kailash Junction", "area": "Adyar", "lat": 13.0080, "lon": 80.2450},
        "N_OMR_TIDEL": {"name": "Tidel Park OMR", "area": "Taramani", "lat": 12.9890, "lon": 80.2480},
        "N_OMR_PERUNGUDI": {"name": "Perungudi Toll OMR", "area": "Perungudi", "lat": 12.9650, "lon": 80.2410},
        "N_OMR_THORAIPAKKAM": {"name": "Thoraipakkam 200ft Junc", "area": "Thoraipakkam", "lat": 12.9380, "lon": 80.2350},
        "N_OMR_SHOLINGANALLUR": {"name": "Sholinganallur Junction", "area": "Sholinganallur", "lat": 12.9010, "lon": 80.2279},
        "N_ANNA_TL": {"name": "Anna Salai (Thousand Lights)", "area": "Thousand Lights", "lat": 13.0610, "lon": 80.2490},
        "N_GEMINI": {"name": "Gemini Flyover", "area": "Nungambakkam", "lat": 13.0515, "lon": 80.2500},
        "N_ANNA_TEYNAMPET": {"name": "Anna Salai (Teynampet DMS)", "area": "Teynampet", "lat": 13.0405, "lon": 80.2468},
        "N_NANDANAM": {"name": "Nandanam Signal", "area": "Nandanam", "lat": 13.0290, "lon": 80.2400},
        "N_SAIDAPET": {"name": "Saidapet Bridge", "area": "Saidapet", "lat": 13.0210, "lon": 80.2240},
        "N_GUINDY_KATHIPARA": {"name": "Kathipara Junction", "area": "Guindy", "lat": 13.0067, "lon": 80.2020},
        "N_GUINDY_RACECOURSE": {"name": "Guindy Race Course", "area": "Guindy", "lat": 13.0010, "lon": 80.2150},
        "N_VELACHERY_CHECKPOST": {"name": "Velachery Check Post", "area": "Velachery", "lat": 12.9880, "lon": 80.2190},
        "N_VELACHERY_BYPASS": {"name": "Velachery 100ft Bypass", "area": "Velachery", "lat": 12.9770, "lon": 80.2220},
        "N_VELACHERY_VIJAYNAGAR": {"name": "Vijay Nagar Bus Stand", "area": "Velachery", "lat": 12.9720, "lon": 80.2180},
        "N_MEDAVAKKAM": {"name": "Medavakkam Junction", "area": "Medavakkam", "lat": 12.9170, "lon": 80.1920},
        "N_AIRPORT": {"name": "Chennai International Airport", "area": "Meenambakkam", "lat": 12.9815, "lon": 80.1636},
        "N_PALLAVARAM": {"name": "Pallavaram Signal", "area": "Pallavaram", "lat": 12.9670, "lon": 80.1480},
        "N_CHROMEPET": {"name": "Chromepet Flyover", "area": "Chromepet", "lat": 12.9510, "lon": 80.1410},
        "N_TAMBARAM_WEST": {"name": "Tambaram West Bus Stand", "area": "Tambaram", "lat": 12.9249, "lon": 80.1000},
        "N_TAMBARAM_EAST": {"name": "Tambaram East Signal", "area": "Tambaram", "lat": 12.9220, "lon": 80.1200},
        "N_NUNGAMBAKKAM": {"name": "Nungambakkam High Road", "area": "Nungambakkam", "lat": 13.0610, "lon": 80.2380},
        "N_TNAGAR_PANAGAL": {"name": "Panagal Park", "area": "T. Nagar", "lat": 13.0418, "lon": 80.2341},
        "N_KODAMBAKKAM": {"name": "Kodambakkam Bridge", "area": "Kodambakkam", "lat": 13.0510, "lon": 80.2260},
        "N_VADAPALANI": {"name": "Vadapalani Signal", "area": "Vadapalani", "lat": 13.0500, "lon": 80.2121},
        "N_ASHOK_NAGAR": {"name": "Ashok Pillar", "area": "Ashok Nagar", "lat": 13.0360, "lon": 80.2120},
        "N_EKKATTUTHANGAL": {"name": "Ekkattuthangal Metro", "area": "Ekkattuthangal", "lat": 13.0180, "lon": 80.2070},
        "N_KOYAMBEDU_CMBT": {"name": "Koyambedu CMBT", "area": "Koyambedu", "lat": 13.0694, "lon": 80.1948},
        "N_ARUMBAKKAM": {"name": "Arumbakkam Metro", "area": "Arumbakkam", "lat": 13.0720, "lon": 80.2100},
        "N_AMINJIKARAI": {"name": "Aminjikarai PH Road", "area": "Aminjikarai", "lat": 13.0750, "lon": 80.2250},
        "N_CHETPET": {"name": "Chetpet Signal", "area": "Chetpet", "lat": 13.0730, "lon": 80.2420},
        "N_EGMORE": {"name": "Egmore Railway Station", "area": "Egmore", "lat": 13.0780, "lon": 80.2600},
        "N_PORUR": {"name": "Porur Junction", "area": "Porur", "lat": 13.0330, "lon": 80.1580},
        "N_MADURAVOYAL": {"name": "Maduravoyal Flyover", "area": "Maduravoyal", "lat": 13.0660, "lon": 80.1600},
        "N_POONAMALLEE": {"name": "Poonamallee Bypass", "area": "Poonamallee", "lat": 13.0490, "lon": 80.0930},
        "N_AMBATTUR": {"name": "Ambattur OT", "area": "Ambattur", "lat": 13.1143, "lon": 80.1548},
        "N_AVADI": {"name": "Avadi Bus Depot", "area": "Avadi", "lat": 13.1170, "lon": 80.1010},
        "N_ANNA_NAGAR_ROUNDTANA": {"name": "Anna Nagar Roundtana", "area": "Anna Nagar", "lat": 13.0850, "lon": 80.2150},
        "N_THIRUMANGALAM": {"name": "Thirumangalam Metro", "area": "Anna Nagar West", "lat": 13.0850, "lon": 80.1950}
    }

    # Dense realistic edge geometries following real Chennai road curves
    raw_edges = [
        # --- Corridor 1: Marina Beach & East Coast Road (Safest Coastal Route) ---
        {
            "u": "N_CENTRAL", "v": "N_BEACH_MARINA", "road_name": "EVR Periyar Salai & Rajaji Salai", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0827, 80.2757], [13.0850, 80.2800], [13.0870, 80.2840],
                [13.0810, 80.2855], [13.0750, 80.2845], [13.0680, 80.2825]
            ]
        },
        {
            "u": "N_PARK", "v": "N_BEACH_MARINA", "road_name": "Wallajah Road to Marina Beach", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0780, 80.2730], [13.0730, 80.2780], [13.0680, 80.2825]
            ]
        },
        {
            "u": "N_BEACH_MARINA", "v": "N_SANTHOME", "road_name": "Kamarajar Salai (Marina Promenade)", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0680, 80.2825], [13.0600, 80.2820], [13.0500, 80.2810],
                [13.0420, 80.2800], [13.0335, 80.2780]
            ]
        },
        {
            "u": "N_SANTHOME", "v": "N_MRC_NAGAR", "road_name": "Santhome High Road", "road_type": "Collector", "speed_limit": 45,
            "geometry": [
                [13.0335, 80.2780], [13.0280, 80.2770], [13.0230, 80.2760], [13.0180, 80.2750]
            ]
        },
        {
            "u": "N_MRC_NAGAR", "v": "N_BESANT_NAGAR", "road_name": "Durgabai Deshmukh Rd & Besant Ave", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0180, 80.2750], [13.0130, 80.2720], [13.0070, 80.2700], [13.0000, 80.2670]
            ]
        },
        {
            "u": "N_BESANT_NAGAR", "v": "N_ADYAR_LB", "road_name": "Besant Avenue Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0000, 80.2670], [13.0005, 80.2620], [13.0012, 80.2565]
            ]
        },
        {
            "u": "N_BESANT_NAGAR", "v": "N_THIRUVANMIYUR", "road_name": "Valmiki Nagar Beach Road", "road_type": "Collector", "speed_limit": 45,
            "geometry": [
                [13.0000, 80.2670], [12.9920, 80.2640], [12.9830, 80.2590]
            ]
        },
        {
            "u": "N_ADYAR_LB", "v": "N_THIRUVANMIYUR", "road_name": "Lattice Bridge (LB) Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0012, 80.2565], [12.9960, 80.2575], [12.9900, 80.2582], [12.9830, 80.2590]
            ]
        },
        {
            "u": "N_THIRUVANMIYUR", "v": "N_KOTTIVAKKAM", "road_name": "East Coast Road (ECR)", "road_type": "Expressway/Highway", "speed_limit": 60,
            "geometry": [
                [12.9830, 80.2590], [12.9770, 80.2585], [12.9720, 80.2580], [12.9680, 80.2575]
            ]
        },
        {
            "u": "N_KOTTIVAKKAM", "v": "N_ECR_PALAVAKKAM", "road_name": "East Coast Road (ECR)", "road_type": "Expressway/Highway", "speed_limit": 60,
            "geometry": [
                [12.9680, 80.2575], [12.9630, 80.2565], [12.9560, 80.2550]
            ]
        },
        {
            "u": "N_ECR_PALAVAKKAM", "v": "N_ECR_NEELANKARAI", "road_name": "East Coast Road (ECR)", "road_type": "Expressway/Highway", "speed_limit": 70,
            "geometry": [
                [12.9560, 80.2550], [12.9520, 80.2540], [12.9480, 80.2530]
            ]
        },
        {
            "u": "N_ECR_NEELANKARAI", "v": "N_ECR_INJAMBAKKAM", "road_name": "East Coast Road (ECR)", "road_type": "Expressway/Highway", "speed_limit": 70,
            "geometry": [
                [12.9480, 80.2530], [12.9350, 80.2515], [12.9250, 80.2505], [12.9150, 80.2490]
            ]
        },

        # --- Corridor 2: Anna Salai / Mount Road to Kathipara ---
        {
            "u": "N_CENTRAL", "v": "N_PARK", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0827, 80.2757], [13.0805, 80.2745], [13.0780, 80.2730]
            ]
        },
        {
            "u": "N_PARK", "v": "N_ANNA_TL", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0780, 80.2730], [13.0730, 80.2660], [13.0680, 80.2580], [13.0640, 80.2530], [13.0610, 80.2490]
            ]
        },
        {
            "u": "N_ANNA_TL", "v": "N_GEMINI", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0610, 80.2490], [13.0560, 80.2495], [13.0515, 80.2500]
            ]
        },
        {
            "u": "N_GEMINI", "v": "N_ANNA_TEYNAMPET", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0515, 80.2500], [13.0460, 80.2485], [13.0405, 80.2468]
            ]
        },
        {
            "u": "N_ANNA_TEYNAMPET", "v": "N_NANDANAM", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0405, 80.2468], [13.0350, 80.2435], [13.0290, 80.2400]
            ]
        },
        {
            "u": "N_NANDANAM", "v": "N_SAIDAPET", "road_name": "Anna Salai (Mount Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0290, 80.2400], [13.0250, 80.2320], [13.0210, 80.2240]
            ]
        },
        {
            "u": "N_SAIDAPET", "v": "N_GUINDY_KATHIPARA", "road_name": "Anna Salai (GST Approach)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0210, 80.2240], [13.0160, 80.2150], [13.0100, 80.2080], [13.0067, 80.2020]
            ]
        },

        # --- Corridor 3: GST Road South (Kathipara -> Tambaram) ---
        {
            "u": "N_GUINDY_KATHIPARA", "v": "N_AIRPORT", "road_name": "GST Road (Grand Southern Trunk)", "road_type": "Expressway/Highway", "speed_limit": 80,
            "geometry": [
                [13.0067, 80.2020], [12.9980, 80.1910], [12.9900, 80.1780], [12.9815, 80.1636]
            ]
        },
        {
            "u": "N_AIRPORT", "v": "N_PALLAVARAM", "road_name": "GST Road (Grand Southern Trunk)", "road_type": "Expressway/Highway", "speed_limit": 80,
            "geometry": [
                [12.9815, 80.1636], [12.9750, 80.1560], [12.9670, 80.1480]
            ]
        },
        {
            "u": "N_PALLAVARAM", "v": "N_CHROMEPET", "road_name": "GST Road (Grand Southern Trunk)", "road_type": "Expressway/Highway", "speed_limit": 80,
            "geometry": [
                [12.9670, 80.1480], [12.9590, 80.1440], [12.9510, 80.1410]
            ]
        },
        {
            "u": "N_CHROMEPET", "v": "N_TAMBARAM_WEST", "road_name": "GST Road (Grand Southern Trunk)", "road_type": "Expressway/Highway", "speed_limit": 80,
            "geometry": [
                [12.9510, 80.1410], [12.9410, 80.1300], [12.9320, 80.1150], [12.9249, 80.1000]
            ]
        },
        {
            "u": "N_TAMBARAM_WEST", "v": "N_TAMBARAM_EAST", "road_name": "Tambaram Overbridge & GST Link", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [12.9249, 80.1000], [12.9235, 80.1100], [12.9220, 80.1200]
            ]
        },

        # --- Corridor 4: Rajiv Gandhi Salai (OMR IT Corridor) ---
        {
            "u": "N_SAIDAPET", "v": "N_MADHYA_KAILASH", "road_name": "Sardar Patel Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0210, 80.2240], [13.0150, 80.2310], [13.0110, 80.2380], [13.0080, 80.2450]
            ]
        },
        {
            "u": "N_MADHYA_KAILASH", "v": "N_ADYAR_LB", "road_name": "Sardar Patel Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0080, 80.2450], [13.0040, 80.2510], [13.0012, 80.2565]
            ]
        },
        {
            "u": "N_MADHYA_KAILASH", "v": "N_OMR_TIDEL", "road_name": "Old Mahabalipuram Road (OMR)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0080, 80.2450], [13.0000, 80.2465], [12.9890, 80.2480]
            ]
        },
        {
            "u": "N_OMR_TIDEL", "v": "N_OMR_PERUNGUDI", "road_name": "Old Mahabalipuram Road (OMR)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [12.9890, 80.2480], [12.9780, 80.2445], [12.9650, 80.2410]
            ]
        },
        {
            "u": "N_OMR_PERUNGUDI", "v": "N_OMR_THORAIPAKKAM", "road_name": "Old Mahabalipuram Road (OMR)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [12.9650, 80.2410], [12.9520, 80.2380], [12.9380, 80.2350]
            ]
        },
        {
            "u": "N_OMR_THORAIPAKKAM", "v": "N_OMR_SHOLINGANALLUR", "road_name": "Old Mahabalipuram Road (OMR)", "road_type": "Expressway/Highway", "speed_limit": 70,
            "geometry": [
                [12.9380, 80.2350], [12.9200, 80.2310], [12.9010, 80.2279]
            ]
        },
        {
            "u": "N_OMR_THORAIPAKKAM", "v": "N_ECR_PALAVAKKAM", "road_name": "Thoraipakkam-Palavakkam 200ft Link", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [12.9380, 80.2350], [12.9450, 80.2420], [12.9500, 80.2490], [12.9560, 80.2550]
            ]
        },
        {
            "u": "N_OMR_SHOLINGANALLUR", "v": "N_ECR_INJAMBAKKAM", "road_name": "Kalaignar Karunanidhi Salai", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [12.9010, 80.2279], [12.9060, 80.2380], [12.9150, 80.2490]
            ]
        },

        # --- Corridor 5: Guindy to Velachery Bypass (Precise alignment avoiding lake) ---
        {
            "u": "N_GUINDY_KATHIPARA", "v": "N_GUINDY_RACECOURSE", "road_name": "Five Furlong Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0067, 80.2020], [13.0035, 80.2090], [13.0010, 80.2150]
            ]
        },
        {
            "u": "N_GUINDY_RACECOURSE", "v": "N_VELACHERY_CHECKPOST", "road_name": "Guindy-Velachery Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0010, 80.2150], [12.9940, 80.2170], [12.9880, 80.2190]
            ]
        },
        {
            "u": "N_VELACHERY_CHECKPOST", "v": "N_VELACHERY_BYPASS", "road_name": "Velachery 100 Feet Bypass Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [12.9880, 80.2190], [12.9830, 80.2205], [12.9770, 80.2220]
            ]
        },
        {
            "u": "N_VELACHERY_BYPASS", "v": "N_OMR_TIDEL", "road_name": "Taramani 100ft Link Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [12.9770, 80.2220], [12.9810, 80.2310], [12.9850, 80.2400], [12.9890, 80.2480]
            ]
        },
        {
            "u": "N_VELACHERY_CHECKPOST", "v": "N_VELACHERY_VIJAYNAGAR", "road_name": "Velachery Main Road (Congested Hotspot Corridor)", "road_type": "Arterial", "speed_limit": 40,
            "geometry": [
                [12.9880, 80.2190], [12.9835, 80.2185], [12.9780, 80.2180], [12.9720, 80.2180]
            ]
        },
        {
            "u": "N_VELACHERY_VIJAYNAGAR", "v": "N_MEDAVAKKAM", "road_name": "Velachery-Tambaram Main Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [12.9720, 80.2180], [12.9600, 80.2100], [12.9450, 80.2010], [12.9300, 80.1960], [12.9170, 80.1920]
            ]
        },
        {
            "u": "N_MEDAVAKKAM", "v": "N_TAMBARAM_EAST", "road_name": "Medavakkam-Tambaram Main Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [12.9170, 80.1920], [12.9180, 80.1700], [12.9200, 80.1450], [12.9220, 80.1200]
            ]
        },
        {
            "u": "N_PALLAVARAM", "v": "N_OMR_THORAIPAKKAM", "road_name": "Pallavaram-Thoraipakkam 200ft Radial Road", "road_type": "Expressway/Highway", "speed_limit": 70,
            "geometry": [
                [12.9670, 80.1480], [12.9600, 80.1720], [12.9520, 80.1980], [12.9450, 80.2180], [12.9380, 80.2350]
            ]
        },

        # --- Corridor 6: Inner Ring Road (100 Feet Road: Koyambedu -> Kathipara) ---
        {
            "u": "N_KOYAMBEDU_CMBT", "v": "N_VADAPALANI", "road_name": "Jawaharlal Nehru Road (100 Feet Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0694, 80.1948], [13.0620, 80.2010], [13.0550, 80.2070], [13.0500, 80.2121]
            ]
        },
        {
            "u": "N_VADAPALANI", "v": "N_ASHOK_NAGAR", "road_name": "Jawaharlal Nehru Road (100 Feet Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0500, 80.2121], [13.0430, 80.2120], [13.0360, 80.2120]
            ]
        },
        {
            "u": "N_ASHOK_NAGAR", "v": "N_EKKATTUTHANGAL", "road_name": "Jawaharlal Nehru Road (100 Feet Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0360, 80.2120], [13.0270, 80.2100], [13.0180, 80.2070]
            ]
        },
        {
            "u": "N_EKKATTUTHANGAL", "v": "N_GUINDY_KATHIPARA", "road_name": "Jawaharlal Nehru Road (100 Feet Road)", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0180, 80.2070], [13.0120, 80.2045], [13.0067, 80.2020]
            ]
        },

        # --- Corridor 7: Poonamallee High Road (Central -> Poonamallee) ---
        {
            "u": "N_CENTRAL", "v": "N_EGMORE", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0827, 80.2757], [13.0805, 80.2680], [13.0780, 80.2600]
            ]
        },
        {
            "u": "N_EGMORE", "v": "N_CHETPET", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0780, 80.2600], [13.0755, 80.2510], [13.0730, 80.2420]
            ]
        },
        {
            "u": "N_CHETPET", "v": "N_AMINJIKARAI", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0730, 80.2420], [13.0740, 80.2330], [13.0750, 80.2250]
            ]
        },
        {
            "u": "N_AMINJIKARAI", "v": "N_ARUMBAKKAM", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0750, 80.2250], [13.0735, 80.2170], [13.0720, 80.2100]
            ]
        },
        {
            "u": "N_ARUMBAKKAM", "v": "N_KOYAMBEDU_CMBT", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0720, 80.2100], [13.0705, 80.2020], [13.0694, 80.1948]
            ]
        },
        {
            "u": "N_KOYAMBEDU_CMBT", "v": "N_MADURAVOYAL", "road_name": "Poonamallee High Road", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0694, 80.1948], [13.0675, 80.1770], [13.0660, 80.1600]
            ]
        },
        {
            "u": "N_MADURAVOYAL", "v": "N_POONAMALLEE", "road_name": "Poonamallee High Road (NH 48)", "road_type": "Expressway/Highway", "speed_limit": 70,
            "geometry": [
                [13.0660, 80.1600], [13.0580, 80.1300], [13.0530, 80.1100], [13.0490, 80.0930]
            ]
        },
        {
            "u": "N_MADURAVOYAL", "v": "N_PORUR", "road_name": "Chennai Bypass Expressway", "road_type": "Expressway/Highway", "speed_limit": 80,
            "geometry": [
                [13.0660, 80.1600], [13.0500, 80.1590], [13.0330, 80.1580]
            ]
        },
        {
            "u": "N_PORUR", "v": "N_GUINDY_KATHIPARA", "road_name": "Mount-Poonamallee Road", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0330, 80.1580], [13.0250, 80.1750], [13.0150, 80.1900], [13.0067, 80.2020]
            ]
        },
        {
            "u": "N_PORUR", "v": "N_POONAMALLEE", "road_name": "Mount-Poonamallee Road", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0330, 80.1580], [13.0410, 80.1250], [13.0490, 80.0930]
            ]
        },

        # --- Corridor 8: Anna Nagar, Ambattur & Avadi ---
        {
            "u": "N_KOYAMBEDU_CMBT", "v": "N_THIRUMANGALAM", "road_name": "Jawaharlal Nehru Salai", "road_type": "Arterial", "speed_limit": 60,
            "geometry": [
                [13.0694, 80.1948], [13.0780, 80.1950], [13.0850, 80.1950]
            ]
        },
        {
            "u": "N_THIRUMANGALAM", "v": "N_ANNA_NAGAR_ROUNDTANA", "road_name": "2nd Avenue Anna Nagar", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0850, 80.1950], [13.0850, 80.2050], [13.0850, 80.2150]
            ]
        },
        {
            "u": "N_THIRUMANGALAM", "v": "N_AMBATTUR", "road_name": "Maduravoyal-Ambattur Bypass", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0850, 80.1950], [13.0980, 80.1750], [13.1143, 80.1548]
            ]
        },
        {
            "u": "N_AMBATTUR", "v": "N_AVADI", "road_name": "CTH Road (Madras-Tiruvallur High Rd)", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.1143, 80.1548], [13.1160, 80.1270], [13.1170, 80.1010]
            ]
        },

        # --- Corridor 9: Central Connectors (T Nagar, Nungambakkam, Mylapore, Royapettah) ---
        {
            "u": "N_GEMINI", "v": "N_NUNGAMBAKKAM", "road_name": "Nungambakkam High Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0515, 80.2500], [13.0560, 80.2440], [13.0610, 80.2380]
            ]
        },
        {
            "u": "N_NUNGAMBAKKAM", "v": "N_TNAGAR_PANAGAL", "road_name": "GN Chetty Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0610, 80.2380], [13.0510, 80.2360], [13.0418, 80.2341]
            ]
        },
        {
            "u": "N_TNAGAR_PANAGAL", "v": "N_ANNA_TEYNAMPET", "road_name": "Venkatnarayana Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0418, 80.2341], [13.0410, 80.2410], [13.0405, 80.2468]
            ]
        },
        {
            "u": "N_TNAGAR_PANAGAL", "v": "N_KODAMBAKKAM", "road_name": "Usman Road Flyover", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0418, 80.2341], [13.0460, 80.2300], [13.0510, 80.2260]
            ]
        },
        {
            "u": "N_KODAMBAKKAM", "v": "N_VADAPALANI", "road_name": "Arcot Road", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0510, 80.2260], [13.0505, 80.2190], [13.0500, 80.2121]
            ]
        },
        {
            "u": "N_GEMINI", "v": "N_ROYAPETTAH", "road_name": "Cathedral Road & RK Salai", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0515, 80.2500], [13.0520, 80.2560], [13.0530, 80.2620]
            ]
        },
        {
            "u": "N_ROYAPETTAH", "v": "N_MYLAPORE", "road_name": "Royapettah High Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0530, 80.2620], [13.0430, 80.2650], [13.0330, 80.2690]
            ]
        },
        {
            "u": "N_MYLAPORE", "v": "N_SANTHOME", "road_name": "Kutchery Road", "road_type": "Collector", "speed_limit": 40,
            "geometry": [
                [13.0330, 80.2690], [13.0332, 80.2735], [13.0335, 80.2780]
            ]
        },
        {
            "u": "N_MYLAPORE", "v": "N_ADYAR_LB", "road_name": "Dr Muthulakshmi Salai (Adyar Bridge)", "road_type": "Arterial", "speed_limit": 50,
            "geometry": [
                [13.0330, 80.2690], [13.0230, 80.2650], [13.0120, 80.2600], [13.0012, 80.2565]
            ]
        }
    ]

    edges = []
    for e in raw_edges:
        geom = e["geometry"]
        dist = compute_geom_distance(geom)
        edges.append({
            "u": e["u"],
            "v": e["v"],
            "road_name": e["road_name"],
            "road_type": e["road_type"],
            "speed_limit": e["speed_limit"],
            "distance_km": dist,
            "geometry": geom
        })

    dataset = {
        "nodes": nodes,
        "edges": edges
    }

    file_path = "data/chennai_road_network/chennai_road_graph.json"
    with open(file_path, "w") as f:
        json.dump(dataset, f, indent=2)

    print(f"[OK] High-Precision Chennai Road Graph generated at {file_path} ({len(nodes)} nodes, {len(edges)} edges)")
    return file_path

if __name__ == "__main__":
    build_chennai_road_graph()
