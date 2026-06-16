from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = None
    name: str
    email: str
    hashed_password: str
    role: str
