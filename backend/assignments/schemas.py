from pydantic import BaseModel
from typing import List, Optional

class StopDetail(BaseModel):
    order_id: str
    sequence: int
    address: str
    lat: float
    lng: float
    eta_minutes: float
    status: str

class AssignmentResponse(BaseModel):
    plan_id: str
    driver_id: str
    driver_name: str
    total_distance_km: float
    total_eta_minutes: float
    algorithm: str
    plan_status: str
    stops: List[StopDetail]
