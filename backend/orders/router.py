from fastapi import APIRouter, Depends
from .schemas import CreateOrderRequest, UpdateStatusRequest, OrderResponse
from . import service
from auth.dependencies import get_current_user, require_admin, require_driver
from typing import List

router = APIRouter()

@router.get("", response_model=List[OrderResponse])
async def list_orders(current_user=Depends(get_current_user)):
    if current_user["role"] == "admin":
        return await service.get_all_orders()
    return await service.get_driver_orders(current_user["user_id"])

@router.post("", response_model=OrderResponse)
async def create_order(body: CreateOrderRequest, _=Depends(require_admin)):
    return await service.create_order(body.customer_name, body.address, body.latitude, body.longitude)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, _=Depends(get_current_user)):
    return await service.get_order(order_id)

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(order_id: str, body: UpdateStatusRequest, current_user=Depends(require_driver)):
    return await service.update_order_status(order_id, body.status, current_user["role"])

@router.delete("/{order_id}")
async def delete_order(order_id: str, _=Depends(require_admin)):
    return await service.delete_order(order_id)
