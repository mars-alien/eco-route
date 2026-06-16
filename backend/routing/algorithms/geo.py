import math

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Haversine formula. Computes great-circle distance between two WGS84 coordinates.
    Returns kilometers.
    Why Haversine not Euclidean: 1 degree of longitude covers ~111km at the equator
    but less near poles. Euclidean distance on raw lat/lng is geometrically wrong
    for geographic clustering.
    """
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(d_lng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
