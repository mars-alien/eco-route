from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from fastapi import HTTPException
from database import get_db
from config import settings

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: str, role: str, name: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "role": role, "name": name, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

async def login(email: str, password: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        user = await db.drivers.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    role = user["role"]
    name = user["name"]
    token = create_token(user_id, role, name)
    return {"token": token, "role": role, "user_id": user_id, "name": name}

async def register(name: str, email: str, password: str, role: str) -> dict:
    db = get_db()
    collection = db.drivers if role == "driver" else db.users
    existing = await collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": name,
        "email": email,
        "hashed_password": hash_password(password),
        "role": role,
    }
    if role == "driver":
        doc.update({
            "vehicle_type": "BIKE",
            "is_available": True,
            "location": {"type": "Point", "coordinates": [77.5946, 12.9716]},
        })
    result = await collection.insert_one(doc)
    return {"user_id": str(result.inserted_id), "role": role, "name": name}
