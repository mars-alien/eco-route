from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from config import settings
from auth.router import router as auth_router
from orders.router import router as orders_router
from drivers.router import router as drivers_router
from routing.router import router as routing_router
from assignments.router import router as assignments_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="EcoRoute API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,        prefix="/api/auth",        tags=["auth"])
app.include_router(orders_router,      prefix="/api/orders",      tags=["orders"])
app.include_router(drivers_router,     prefix="/api/drivers",     tags=["drivers"])
app.include_router(routing_router,     prefix="/api/routing",     tags=["routing"])
app.include_router(assignments_router, prefix="/api/assignments", tags=["assignments"])
