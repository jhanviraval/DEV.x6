"""
Equipment routes with CRUD, search, filter, and smart button
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from database import get_db
from models import Equipment, User, MaintenanceRequest, RequestStatus
from schemas import EquipmentCreate, EquipmentResponse, EquipmentListResponse
from auth import get_current_user, require_role, UserRole
from typing import Optional

router = APIRouter()


@router.post("/", response_model=EquipmentResponse, status_code=201)
def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Create new equipment"""
    # Check if serial number already exists
    if equipment.serial_number:
        existing = db.query(Equipment).filter(Equipment.serial_number == equipment.serial_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Serial number already exists")
    
    db_equipment = Equipment(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


@router.get("/", response_model=EquipmentListResponse)
def list_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List equipment with search and filter capabilities"""
    query = db.query(Equipment)
    
    # Search filter
    if search:
        search_filter = or_(
            Equipment.name.ilike(f"%{search}%"),
            Equipment.serial_number.ilike(f"%{search}%"),
            Equipment.location.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Department filter
    if department:
        query = query.filter(Equipment.department == department)
    
    # Status filter
    if status:
        query = query.filter(Equipment.status == status)
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    # Add open requests count for smart button
    for item in items:
        open_count = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.equipment_id == item.id,
            MaintenanceRequest.status.in_([RequestStatus.NEW, RequestStatus.IN_PROGRESS])
        ).count()
        item.open_requests_count = open_count
    
    return EquipmentListResponse(items=items, total=total)


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get equipment by ID with open requests count"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Calculate open requests count for smart button
    open_count = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.equipment_id == equipment_id,
        MaintenanceRequest.status.in_([RequestStatus.NEW, RequestStatus.IN_PROGRESS])
    ).count()
    equipment.open_requests_count = open_count
    
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Update equipment"""
    db_equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Check serial number uniqueness if changed
    if equipment.serial_number and equipment.serial_number != db_equipment.serial_number:
        existing = db.query(Equipment).filter(Equipment.serial_number == equipment.serial_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Serial number already exists")
    
    for key, value in equipment.dict().items():
        setattr(db_equipment, key, value)
    
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


@router.delete("/{equipment_id}", status_code=204)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Delete equipment"""
    db_equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db.delete(db_equipment)
    db.commit()
    return None


@router.get("/{equipment_id}/maintenance-requests")
def get_equipment_maintenance_requests(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Smart button: Get all maintenance requests for equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    requests = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.equipment_id == equipment_id
    ).all()
    
    return requests

