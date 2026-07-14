import math
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException
from database import get_db
from .algorithms.kmeans import KMeansClusterer, Point
from .algorithms.tsp import NearestNeighborTSP, Stop
from .algorithms.eta import EtaPredictor
from .algorithms.geo import haversine_km

MAX_STOPS_PER_DRIVER = 8
ALGORITHM_LABEL = "KMEANS_PP_NN_HEURISTIC"

async def optimize() -> dict:
    db = get_db()

    pending_orders = await db.orders.find({"status": "PENDING"}).to_list(length=10000)
    available_drivers = await db.drivers.find({"is_available": True}).to_list(length=1000)

    if not pending_orders:
        return {
            "success": False,
            "total_orders_assigned": 0,
            "clusters_generated": 0,
            "algorithm": ALGORITHM_LABEL,
            "route_plans": [],
        }
    if not available_drivers:
        return {
            "success": False,
            "total_orders_assigned": 0,
            "clusters_generated": 0,
            "algorithm": ALGORITHM_LABEL,
            "route_plans": [],
        }

    k = min(len(available_drivers), math.ceil(len(pending_orders) / MAX_STOPS_PER_DRIVER))
    k = max(k, 1)

    points = []
    for o in pending_orders:
        coords = o["location"]["coordinates"]
        points.append(Point(order_id=str(o["_id"]), lat=coords[1], lng=coords[0]))

    clusters = KMeansClusterer(k=k).fit(points)

    drivers_pool = list(available_drivers)
    tsp_solver = NearestNeighborTSP()
    eta_predictor = EtaPredictor()

    route_plans = []
    assigned_order_ids = []

    for cluster in clusters:
        if not drivers_pool:
            break

        centroid_lat = cluster.centroid_lat
        centroid_lng = cluster.centroid_lng

        drivers_pool.sort(
            key=lambda d: haversine_km(
                centroid_lat, centroid_lng,
                d["location"]["coordinates"][1],
                d["location"]["coordinates"][0],
            )
        )
        driver = drivers_pool.pop(0)
        driver_lat = driver["location"]["coordinates"][1]
        driver_lng = driver["location"]["coordinates"][0]

        order_docs = {str(o["_id"]): o for o in pending_orders}
        stops_input = []
        for p in cluster.points:
            o = order_docs[p.order_id]
            stops_input.append(Stop(
                order_id=p.order_id,
                lat=p.lat,
                lng=p.lng,
                address=o["address"],
            ))

        ordered_stops, total_distance = tsp_solver.solve(driver_lat, driver_lng, stops_input)

        cumulative_distance = 0.0
        current_lat, current_lng = driver_lat, driver_lng
        stop_docs = []
        for seq, stop in enumerate(ordered_stops, start=1):
            cumulative_distance += haversine_km(current_lat, current_lng, stop.lat, stop.lng)
            current_lat, current_lng = stop.lat, stop.lng
            eta = eta_predictor.predict_cumulative(cumulative_distance, seq)
            stop_docs.append({
                "order_id": stop.order_id,
                "sequence": seq,
                "address": stop.address,
                "lat": stop.lat,
                "lng": stop.lng,
                "eta_minutes": eta,
                "status": "PENDING",
            })

        total_eta = eta_predictor.predict(total_distance, len(ordered_stops))

        plan_doc = {
            "driver_id": str(driver["_id"]),
            "driver_name": driver["name"],
            "created_at": datetime.now(timezone.utc),
            "status": "ACTIVE",
            "total_distance_km": round(total_distance, 2),
            "total_eta_minutes": total_eta,
            "algorithm": ALGORITHM_LABEL,
            "stops": stop_docs,
        }
        route_plans.append(plan_doc)
        assigned_order_ids.extend([s["order_id"] for s in stop_docs])

    if route_plans:
        result = await db.route_plans.insert_many(route_plans)
        for i, plan in enumerate(route_plans):
            plan["_id"] = result.inserted_ids[i]

        await db.orders.update_many(
            {"_id": {"$in": [ObjectId(oid) for oid in assigned_order_ids]}},
            {"$set": {"status": "ASSIGNED", "updated_at": datetime.now(timezone.utc)}},
        )

    response_plans = []
    for plan in route_plans:
        response_plans.append({
            "plan_id": str(plan["_id"]),
            "driver_id": plan["driver_id"],
            "driver_name": plan["driver_name"],
            "total_distance_km": plan["total_distance_km"],
            "total_eta_minutes": plan["total_eta_minutes"],
            "algorithm": plan["algorithm"],
            "stops": [
                {
                    "order_id": s["order_id"],
                    "sequence": s["sequence"],
                    "address": s["address"],
                    "lat": s["lat"],
                    "lng": s["lng"],
                    "eta_minutes": s["eta_minutes"],
                }
                for s in plan["stops"]
            ],
        })

    return {
        "success": True,
        "total_orders_assigned": len(assigned_order_ids),
        "clusters_generated": len(route_plans),
        "algorithm": ALGORITHM_LABEL,
        "route_plans": response_plans,
    }

async def get_all_plans() -> list:
    db = get_db()
    docs = await db.route_plans.find().sort("created_at", -1).to_list(length=1000)
    return [_plan_to_response(d) for d in docs]

async def get_plan(plan_id: str) -> dict:
    db = get_db()
    doc = await db.route_plans.find_one({"_id": ObjectId(plan_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Route plan not found")
    return _plan_to_response(doc)

def _plan_to_response(doc: dict) -> dict:
    return {
        "plan_id": str(doc["_id"]),
        "driver_id": doc["driver_id"],
        "driver_name": doc["driver_name"],
        "total_distance_km": doc["total_distance_km"],
        "total_eta_minutes": doc["total_eta_minutes"],
        "algorithm": doc["algorithm"],
        "stops": [
            {
                "order_id": s["order_id"],
                "sequence": s["sequence"],
                "address": s["address"],
                "lat": s["lat"],
                "lng": s["lng"],
                "eta_minutes": s["eta_minutes"],
            }
            for s in doc.get("stops", [])
        ],
    }
