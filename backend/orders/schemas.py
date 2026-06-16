from pydantic import BaseModel, field_validator
from typing import Optional

class CreateOrderRequest(BaseModel):
    customer_name: str
    address: str
    latitude: float
    longitude: float

    @field_validator("latitude")
    def validate_lat(cls, v):
        if not -90 <= v <= 90:
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    def validate_lng(cls, v):
        if not -180 <= v <= 180:
            raise ValueError("longitude must be between -180 and 180")
        return v

class UpdateStatusRequest(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: str
    customer_name: str
    address: str
    lat: float
    lng: float
    status: str
    created_at: str
