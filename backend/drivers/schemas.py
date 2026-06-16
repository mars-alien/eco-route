from pydantic import BaseModel

class UpdateLocationRequest(BaseModel):
    latitude: float
    longitude: float

class DriverResponse(BaseModel):
    id: str
    name: str
    email: str
    vehicle_type: str
    is_available: bool
    lat: float
    lng: float
