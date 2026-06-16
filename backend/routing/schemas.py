from pydantic import BaseModel
from typing import List

class StopResponse(BaseModel):
    order_id: str
    sequence: int
    address: str
    lat: float
    lng: float
    eta_minutes: float

class RoutePlanResponse(BaseModel):
    plan_id: str
    driver_id: str
    driver_name: str
    total_distance_km: float
    total_eta_minutes: float
    algorithm: str
    stops: List[StopResponse]

class RouteOptimizationResponse(BaseModel):
    success: bool
    total_orders_assigned: int
    clusters_generated: int
    algorithm: str
    route_plans: List[RoutePlanResponse]
