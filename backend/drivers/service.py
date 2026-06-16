from bson import ObjectId
from fastapi import HTTPException
from database import get_db

def _doc_to_response(doc: dict) -> dict:
    coords = doc["location"]["coordinates"]
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "vehicle_type": doc.get("vehicle_type", "BIKE"),
        "is_available": doc.get("is_available", True),
        "lat": coords[1],
        "lng": coords[0],
    }

async def get_all_drivers() -> list:
    db = get_db()
    docs = await db.drivers.find().to_list(length=1000)
    return [_doc_to_response(d) for d in docs]

async def get_available_drivers() -> list:
    db = get_db()
    docs = await db.drivers.find({"is_available": True}).to_list(length=1000)
    return [_doc_to_response(d) for d in docs]

async def update_location(driver_id: str, latitude: float, longitude: float) -> dict:
    db = get_db()
    result = await db.drivers.update_one(
        {"_id": ObjectId(driver_id)},
        {"$set": {"location": {"type": "Point", "coordinates": [longitude, latitude]}}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    doc = await db.drivers.find_one({"_id": ObjectId(driver_id)})
    return _doc_to_response(doc)
