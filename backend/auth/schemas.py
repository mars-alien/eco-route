from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "driver"

class TokenResponse(BaseModel):
    token: str
    role: str
    user_id: str
    name: str

class MeResponse(BaseModel):
    user_id: str
    role: str
    name: Optional[str] = None
