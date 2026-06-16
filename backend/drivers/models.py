from pydantic import BaseModel, ConfigDict
from typing import Optional

class DriverInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    name: str
    email: str
    vehicle_type: str
    is_available: bool
    lat: float
    lng: float
