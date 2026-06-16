from fastapi import APIRouter, Depends
from .schemas import UpdateLocationRequest, DriverResponse
from . import service
from auth.dependencies import require_admin, require_driver
from typing import List

router = APIRouter()

@router.get("", response_model=List[DriverResponse])
async def list_drivers(_=Depends(require_admin)):
    return await service.get_all_drivers()

@router.get("/available", response_model=List[DriverResponse])
async def available_drivers(_=Depends(require_admin)):
    return await service.get_available_drivers()

@router.patch("/{driver_id}/location", response_model=DriverResponse)
async def update_location(driver_id: str, body: UpdateLocationRequest, _=Depends(require_driver)):
    return await service.update_location(driver_id, body.latitude, body.longitude)
