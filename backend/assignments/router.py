from fastapi import APIRouter, Depends
from .schemas import AssignmentResponse
from . import service
from auth.dependencies import require_admin, require_driver, get_current_user
from typing import List

router = APIRouter()

@router.get("/driver/{driver_id}", response_model=AssignmentResponse)
async def get_driver_plan(driver_id: str, _=Depends(get_current_user)):
    return await service.get_driver_plan(driver_id)

@router.patch("/{plan_id}/stops/{stop_index}/complete", response_model=AssignmentResponse)
async def complete_stop(plan_id: str, stop_index: int, _=Depends(require_driver)):
    return await service.complete_stop(plan_id, stop_index)

@router.get("/all", response_model=List[AssignmentResponse])
async def all_active_plans(_=Depends(require_admin)):
    return await service.get_all_active_plans()
