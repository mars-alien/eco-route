from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client[settings.db_name]
    await db.orders.create_index([("location", "2dsphere")])
    await db.drivers.create_index([("location", "2dsphere")])

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return client[settings.db_name]
