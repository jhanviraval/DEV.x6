"""
FastAPI main application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, equipment, maintenance_team, maintenance_request, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GearGuard API",
    description="Maintenance Management System API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(maintenance_team.router, prefix="/api/maintenance-teams", tags=["Maintenance Teams"])
app.include_router(maintenance_request.router, prefix="/api/maintenance-requests", tags=["Maintenance Requests"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
def root():
    return {"message": "GearGuard API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

