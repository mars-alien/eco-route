from pydantic import BaseModel, ConfigDict
from typing import Optional

class OrderInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    customer_name: str
    address: str
    lat: float
    lng: float
    status: str
    created_at: str
    updated_at: str
