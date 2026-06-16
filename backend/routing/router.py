from fastapi import APIRouter, Depends
from .schemas import RouteOptimizationResponse, RoutePlanResponse
from . import service
from auth.dependencies import require_admin, get_current_user
from typing import List

router = APIRouter()

@router.post("/optimize", response_model=RouteOptimizationResponse)
async def optimize(_=Depends(require_admin)):
    return await service.optimize()

@router.get("/plans", response_model=List[RoutePlanResponse])
async def list_plans(_=Depends(require_admin)):
    return await service.get_all_plans()

@router.get("/plans/{plan_id}", response_model=RoutePlanResponse)
async def get_plan(plan_id: str, _=Depends(get_current_user)):
    return await service.get_plan(plan_id)
