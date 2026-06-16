from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException
from database import get_db

def _plan_to_response(doc: dict) -> dict:
    return {
        "plan_id": str(doc["_id"]),
        "driver_id": doc["driver_id"],
        "driver_name": doc["driver_name"],
        "total_distance_km": doc["total_distance_km"],
        "total_eta_minutes": doc["total_eta_minutes"],
        "algorithm": doc["algorithm"],
        "plan_status": doc["status"],
        "stops": [
            {
                "order_id": s["order_id"],
                "sequence": s["sequence"],
                "address": s["address"],
                "lat": s["lat"],
                "lng": s["lng"],
                "eta_minutes": s["eta_minutes"],
                "status": s.get("status", "PENDING"),
            }
            for s in doc.get("stops", [])
        ],
    }

async def get_driver_plan(driver_id: str) -> dict:
    db = get_db()
    doc = await db.route_plans.find_one({"driver_id": driver_id, "status": "ACTIVE"})
    if not doc:
        raise HTTPException(status_code=404, detail="No active route plan found")
    return _plan_to_response(doc)

async def complete_stop(plan_id: str, stop_index: int) -> dict:
    db = get_db()
    doc = await db.route_plans.find_one({"_id": ObjectId(plan_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Route plan not found")

    stops = doc.get("stops", [])
    if stop_index < 0 or stop_index >= len(stops):
        raise HTTPException(status_code=400, detail="Invalid stop index")

    order_id = stops[stop_index]["order_id"]

    await db.route_plans.update_one(
        {"_id": ObjectId(plan_id)},
        {"$set": {f"stops.{stop_index}.status": "COMPLETED"}},
    )

    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "DELIVERED", "updated_at": datetime.now(timezone.utc)}},
    )

    all_stops_done = all(
        (s.get("status") == "COMPLETED") if i != stop_index else True
        for i, s in enumerate(stops)
    )
    if all_stops_done:
        await db.route_plans.update_one(
            {"_id": ObjectId(plan_id)},
            {"$set": {"status": "COMPLETED"}},
        )

    updated = await db.route_plans.find_one({"_id": ObjectId(plan_id)})
    return _plan_to_response(updated)

async def get_all_active_plans() -> list:
    db = get_db()
    docs = await db.route_plans.find({"status": "ACTIVE"}).to_list(length=1000)
    return [_plan_to_response(d) for d in docs]
