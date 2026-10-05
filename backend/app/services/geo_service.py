import math

def calculate_bucket_bounds(center_lat: float, center_lng: float, size_km: float = 5.0):
    lat_degree_km = 111.32
    lng_degree_km = 40075.0 * math.cos(math.radians(center_lat)) / 360.0
    half_size = size_km / 2.0
    sw_lat = center_lat - (half_size / lat_degree_km)
    ne_lat = center_lat + (half_size / lat_degree_km)
    sw_lng = center_lng - (half_size / lng_degree_km)
    ne_lng = center_lng + (half_size / lng_degree_km)
    return sw_lat, sw_lng, ne_lat, ne_lng
