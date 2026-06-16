from fastapi import APIRouter, Depends
from .schemas import LoginRequest, RegisterRequest, TokenResponse, MeResponse
from . import service
from .dependencies import get_current_user

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    return await service.login(body.email, body.password)

@router.post("/register")
async def register(body: RegisterRequest):
    return await service.register(body.name, body.email, body.password, body.role)

@router.get("/me", response_model=MeResponse)
async def me(current_user=Depends(get_current_user)):
    return current_user
