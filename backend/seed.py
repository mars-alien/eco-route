"""
Run: cd backend && python seed.py
Creates: 1 admin, 3 drivers, 15 Bengaluru orders.
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "ecoroute"

def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

SEED_ORDERS = [
    {"customer_name": "Arjun Mehta",   "address": "Hebbal Ring Road",         "lat": 13.0358, "lng": 77.5970},
    {"customer_name": "Priya Nair",    "address": "Yelahanka New Town",       "lat": 13.0521, "lng": 77.5847},
    {"customer_name": "Suresh Kumar",  "address": "Jakkur Layout",            "lat": 13.0189, "lng": 77.6021},
    {"customer_name": "Kavitha Rao",   "address": "Thanisandra Main Road",    "lat": 13.0612, "lng": 77.5723},
    {"customer_name": "Ravi Shankar",  "address": "Kogilu Cross",             "lat": 13.0441, "lng": 77.5899},
    {"customer_name": "Divya Menon",   "address": "100 Feet Road Indiranagar","lat": 12.9784, "lng": 77.6408},
    {"customer_name": "Amit Patel",    "address": "MG Road Metro Station",    "lat": 12.9719, "lng": 77.6197},
    {"customer_name": "Sneha Reddy",   "address": "Koramangala 5th Block",    "lat": 12.9352, "lng": 77.6245},
    {"customer_name": "Kiran Desai",   "address": "HSR Layout Sector 4",      "lat": 12.9116, "lng": 77.6389},
    {"customer_name": "Anita Sharma",  "address": "Bellandur Signal",         "lat": 12.9259, "lng": 77.6762},
    {"customer_name": "Vijay Thomas",  "address": "Jayanagar 4th Block",      "lat": 12.9250, "lng": 77.5938},
    {"customer_name": "Lakshmi Iyer",  "address": "BTM 2nd Stage",            "lat": 12.9121, "lng": 77.6076},
    {"customer_name": "Rajesh Gupta",  "address": "Banashankari 3rd Stage",   "lat": 12.9047, "lng": 77.5881},
    {"customer_name": "Pooja Verma",   "address": "JP Nagar 6th Phase",       "lat": 12.8921, "lng": 77.5812},
    {"customer_name": "Sanjay Nair",   "address": "Uttarahalli Main Road",    "lat": 12.8698, "lng": 77.5547},
]

DRIVER_LOCATIONS = [
    {"name": "Rahul",  "lat": 13.0400, "lng": 77.5900},
    {"name": "Vikram", "lat": 12.9700, "lng": 77.6300},
    {"name": "Deepak", "lat": 12.9100, "lng": 77.5950},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    await db.users.drop()
    await db.drivers.drop()
    await db.orders.drop()
    await db.route_plans.drop()

    await db.orders.create_index([("location", "2dsphere")])
    await db.drivers.create_index([("location", "2dsphere")])

    await db.users.insert_one({
        "name": "Admin",
        "email": "admin@ecoroute.com",
        "hashed_password": hash_pw("admin123"),
        "role": "admin",
    })
    print("Created admin: admin@ecoroute.com / admin123")

    driver_emails = ["driver1@ecoroute.com", "driver2@ecoroute.com", "driver3@ecoroute.com"]
    vehicle_types = ["BIKE", "CAR", "VAN"]
    for i, (loc, email, vehicle) in enumerate(zip(DRIVER_LOCATIONS, driver_emails, vehicle_types)):
        await db.drivers.insert_one({
            "name": loc["name"],
            "email": email,
            "hashed_password": hash_pw("driver123"),
            "role": "driver",
            "vehicle_type": vehicle,
            "is_available": True,
            "location": {"type": "Point", "coordinates": [loc["lng"], loc["lat"]]},
        })
        print(f"Created driver: {email} / driver123")

    now = datetime.now(timezone.utc)
    order_docs = []
    for o in SEED_ORDERS:
        order_docs.append({
            "customer_name": o["customer_name"],
            "address": o["address"],
            "location": {"type": "Point", "coordinates": [o["lng"], o["lat"]]},
            "status": "PENDING",
            "created_at": now,
            "updated_at": now,
        })
    await db.orders.insert_many(order_docs)
    print(f"Created {len(order_docs)} orders")

    client.close()
    print("\nSeed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
