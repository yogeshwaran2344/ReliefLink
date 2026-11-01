import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal, is_sqlite
import app.models # registers all 10 models with Base
from app.api.api_router import api_router
from app.services.seed_data import seed_initial_data

# Project root path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIST_DIR = os.path.join(BASE_DIR, "dist")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure all 10 tables exist
    Base.metadata.create_all(bind=engine)

    # Seed baseline disaster operational data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API Engine for ReliefLink Physical AI & Autonomous Disaster Supply Optimization.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "SQLite" if is_sqlite else "PostgreSQL"
    }

# Mount frontend static build if present
assets_dir = os.path.join(DIST_DIR, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(request: Request, full_path: str):
    # If API or docs route, let FastAPI handle or 404
    if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json", "health"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})

    # Check if a static file exists in dist (e.g. favicon)
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    # Serve index.html for SPA client-side routing
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_v1": settings.API_V1_STR
    }
