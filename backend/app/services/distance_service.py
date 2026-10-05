import math

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_distance_score(distance_km: float, max_distance_km: float = 5.0) -> float:
    score = 1.0 - (distance_km / max_distance_km)
    return max(0.0, min(1.0, score))
