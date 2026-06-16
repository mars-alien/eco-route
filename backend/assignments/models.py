from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class AssignmentStop(BaseModel):
    order_id: str
    sequence: int
    address: str
    lat: float
    lng: float
    eta_minutes: float
    status: str

class AssignmentPlan(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    plan_id: str
    driver_id: str
    driver_name: str
    total_distance_km: float
    total_eta_minutes: float
    algorithm: str
    plan_status: str
    stops: List[AssignmentStop]
