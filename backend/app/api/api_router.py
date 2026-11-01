from fastapi import APIRouter
from app.api.v1 import (
    auth,
    locations,
    requests,
    warehouses,
    vehicles,
    allocations,
    routes,
    deliveries,
    dashboard,
    reports
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(locations.router)
api_router.include_router(requests.router)
api_router.include_router(warehouses.router)
api_router.include_router(vehicles.router)
api_router.include_router(allocations.router)
api_router.include_router(routes.router)
api_router.include_router(deliveries.router)
api_router.include_router(dashboard.router)
api_router.include_router(reports.router)
