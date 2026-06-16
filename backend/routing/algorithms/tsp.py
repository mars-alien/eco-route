from typing import List, Tuple
from .geo import haversine_km


class Stop:
    def __init__(self, order_id: str, lat: float, lng: float, address: str):
        self.order_id = order_id
        self.lat = lat
        self.lng = lng
        self.address = address


class NearestNeighborTSP:
    """
    Nearest Neighbor heuristic for the Travelling Salesman Problem.
    Start at depot (driver current location). Greedily visit nearest
    unvisited stop. O(n^2) per cluster. Produces routes ~20% above
    optimal on random instances.
    Production improvement: Google OR-Tools CVRPTW with time windows
    and vehicle capacity constraints.
    """

    def solve(
        self,
        depot_lat: float,
        depot_lng: float,
        stops: List[Stop]
    ) -> Tuple[List[Stop], float]:
        if not stops:
            return [], 0.0

        unvisited = stops.copy()
        route = []
        total_distance = 0.0
        current_lat, current_lng = depot_lat, depot_lng

        while unvisited:
            nearest = min(
                unvisited,
                key=lambda s: haversine_km(current_lat, current_lng, s.lat, s.lng)
            )
            total_distance += haversine_km(current_lat, current_lng, nearest.lat, nearest.lng)
            route.append(nearest)
            unvisited.remove(nearest)
            current_lat, current_lng = nearest.lat, nearest.lng

        return route, total_distance
