from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException
from database import get_db

VALID_TRANSITIONS = {
    "PENDING": ["ASSIGNED"],
    "ASSIGNED": ["IN_TRANSIT"],
    "IN_TRANSIT": ["DELIVERED"],
    "DELIVERED": [],
}

def _doc_to_response(doc: dict) -> dict:
    coords = doc["location"]["coordinates"]
    return {
        "id": str(doc["_id"]),
        "customer_name": doc["customer_name"],
        "address": doc["address"],
        "lat": coords[1],
        "lng": coords[0],
        "status": doc["status"],
        "created_at": doc["created_at"].isoformat() if hasattr(doc["created_at"], "isoformat") else str(doc["created_at"]),
    }

async def get_all_orders() -> list:
    db = get_db()
    docs = await db.orders.find().sort("created_at", -1).to_list(length=1000)
    return [_doc_to_response(d) for d in docs]

async def get_driver_orders(driver_id: str) -> list:
    db = get_db()
    plans = await db.route_plans.find({"driver_id": driver_id, "status": "ACTIVE"}).to_list(length=10)
    order_ids = []
    for plan in plans:
        for stop in plan.get("stops", []):
            order_ids.append(stop["order_id"])
    if not order_ids:
        return []
    docs = await db.orders.find({"_id": {"$in": [ObjectId(oid) for oid in order_ids]}}).to_list(length=1000)
    return [_doc_to_response(d) for d in docs]

async def get_order(order_id: str) -> dict:
    db = get_db()
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return _doc_to_response(doc)

async def create_order(customer_name: str, address: str, latitude: float, longitude: float) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "customer_name": customer_name,
        "address": address,
        "location": {"type": "Point", "coordinates": [longitude, latitude]},
        "status": "PENDING",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.orders.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_response(doc)

async def update_order_status(order_id: str, new_status: str, role: str) -> dict:
    db = get_db()
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    current = doc["status"]
    allowed = VALID_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {current} to {new_status}")
    if role == "driver" and new_status not in ("IN_TRANSIT", "DELIVERED"):
        raise HTTPException(status_code=403, detail="Drivers can only set IN_TRANSIT or DELIVERED")
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}},
    )
    doc["status"] = new_status
    return _doc_to_response(doc)

async def delete_order(order_id: str) -> dict:
    db = get_db()
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    if doc["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Only PENDING orders can be deleted")
    await db.orders.delete_one({"_id": ObjectId(order_id)})
    return {"success": True, "message": "Order deleted"}
