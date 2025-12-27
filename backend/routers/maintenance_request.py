"""
Maintenance Request routes with business logic (auto-fill, workflows, scrap, overdue)
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, datetime
from database import get_db
from models import (
    MaintenanceRequest, Equipment, MaintenanceTeam, User, UserRole,
    RequestStatus, RequestType, EquipmentStatus, TeamMember
)
from schemas import (
    MaintenanceRequestCreate, MaintenanceRequestUpdate,
    MaintenanceRequestResponse
)
from auth import get_current_user, require_role
from typing import List, Optional

router = APIRouter()


def check_technician_team_access(technician_id: int, team_id: int, db: Session) -> bool:
    """Check if technician belongs to the team"""
    if not team_id or not technician_id:
        return False
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == technician_id
    ).first()
    return team_member is not None


def mark_overdue_requests(db: Session):
    """Helper to check and mark overdue requests"""
    today = date.today()
    overdue = db.query(MaintenanceRequest).filter(
        and_(
            MaintenanceRequest.scheduled_date < today,
            MaintenanceRequest.status != RequestStatus.REPAIRED,
            MaintenanceRequest.status != RequestStatus.SCRAP,
            MaintenanceRequest.scheduled_date.isnot(None)
        )
    ).all()
    return overdue


@router.post("/", response_model=MaintenanceRequestResponse, status_code=201)
def create_maintenance_request(
    request: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create maintenance request with auto-fill logic"""
    # Validate equipment exists
    equipment = db.query(Equipment).filter(Equipment.id == request.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Validate scheduled_date for PREVENTIVE requests
    if request.request_type == RequestType.PREVENTIVE and not request.scheduled_date:
        raise HTTPException(
            status_code=400,
            detail="Scheduled date is required for preventive maintenance"
        )
    
    # AUTO-FILL LOGIC: Fetch maintenance team and default technician from equipment
    auto_filled_team_id = equipment.maintenance_team_id
    default_technician_id = equipment.default_technician_id
    
    # If technician is assigned, validate they belong to the team
    assigned_technician_id = request.assigned_technician_id or default_technician_id
    if assigned_technician_id and auto_filled_team_id:
        if not check_technician_team_access(assigned_technician_id, auto_filled_team_id, db):
            raise HTTPException(
                status_code=403,
                detail="Assigned technician must belong to the equipment's maintenance team"
            )
    
    # Create request
    db_request = MaintenanceRequest(
        **request.dict(),
        auto_filled_team_id=auto_filled_team_id,
        assigned_technician_id=assigned_technician_id,
        status=RequestStatus.NEW,
        created_by_id=current_user.id
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Check if overdue
    is_overdue = (
        db_request.scheduled_date and
        db_request.scheduled_date < date.today() and
        db_request.status != RequestStatus.REPAIRED
    )
    db_request.is_overdue = is_overdue
    
    return db_request


@router.get("/", response_model=List[MaintenanceRequestResponse])
def list_maintenance_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    request_type: Optional[str] = Query(None),
    equipment_id: Optional[int] = Query(None),
    team_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List maintenance requests with filters"""
    query = db.query(MaintenanceRequest)
    
    # Role-based filtering
    if current_user.role == UserRole.TECHNICIAN:
        # Technicians can only see requests from their teams
        user_teams = db.query(TeamMember.team_id).filter(
            TeamMember.user_id == current_user.id
        ).subquery()
        query = query.filter(MaintenanceRequest.auto_filled_team_id.in_(user_teams))
    
    # Status filter
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    
    # Type filter
    if request_type:
        query = query.filter(MaintenanceRequest.request_type == request_type)
    
    # Equipment filter
    if equipment_id:
        query = query.filter(MaintenanceRequest.equipment_id == equipment_id)
    
    # Team filter
    if team_id:
        query = query.filter(MaintenanceRequest.auto_filled_team_id == team_id)
    
    requests = query.offset(skip).limit(limit).all()
    
    # Mark overdue requests
    today = date.today()
    for req in requests:
        req.is_overdue = (
            req.scheduled_date and
            req.scheduled_date < today and
            req.status != RequestStatus.REPAIRED and
            req.status != RequestStatus.SCRAP
        )
    
    return requests


@router.get("/{request_id}", response_model=MaintenanceRequestResponse)
def get_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance request by ID"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Role-based access check
    if current_user.role == UserRole.TECHNICIAN:
        if not check_technician_team_access(current_user.id, request.auto_filled_team_id, db):
            raise HTTPException(status_code=403, detail="Not authorized to view this request")
    
    # Check if overdue
    today = date.today()
    request.is_overdue = (
        request.scheduled_date and
        request.scheduled_date < today and
        request.status != RequestStatus.REPAIRED and
        request.status != RequestStatus.SCRAP
    )
    
    return request


@router.put("/{request_id}", response_model=MaintenanceRequestResponse)
def update_maintenance_request(
    request_id: int,
    request_update: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update maintenance request with workflow logic"""
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Role-based access check
    if current_user.role == UserRole.TECHNICIAN:
        if not check_technician_team_access(current_user.id, db_request.auto_filled_team_id, db):
            raise HTTPException(status_code=403, detail="Not authorized to update this request")
    
    # WORKFLOW LOGIC
    old_status = db_request.status
    new_status = request_update.status or old_status
    
    # Status transitions
    if new_status != old_status:
        # Only MANAGER/ADMIN can assign or change status
        if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
            if new_status not in [RequestStatus.IN_PROGRESS, RequestStatus.REPAIRED]:
                raise HTTPException(
                    status_code=403,
                    detail="Only managers can change status to this value"
                )
        
        # SCRAP LOGIC: Update equipment status
        if new_status == RequestStatus.SCRAP:
            equipment = db.query(Equipment).filter(Equipment.id == db_request.equipment_id).first()
            if equipment:
                equipment.status = EquipmentStatus.SCRAPPED
                if request_update.scrap_reason:
                    db_request.scrap_reason = request_update.scrap_reason
    
    # Update technician assignment (only MANAGER/ADMIN)
    if request_update.assigned_technician_id is not None:
        if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(
                status_code=403,
                detail="Only managers can assign technicians"
            )
        
        # Validate technician belongs to team
        if not check_technician_team_access(
            request_update.assigned_technician_id,
            db_request.auto_filled_team_id,
            db
        ):
            raise HTTPException(
                status_code=403,
                detail="Technician must belong to the equipment's maintenance team"
            )
        db_request.assigned_technician_id = request_update.assigned_technician_id
    
    # Update other fields
    update_data = request_update.dict(exclude_unset=True, exclude={"assigned_technician_id", "status", "scrap_reason"})
    for key, value in update_data.items():
        setattr(db_request, key, value)
    
    if new_status != old_status:
        db_request.status = new_status
    
    db.commit()
    db.refresh(db_request)
    
    # Check if overdue
    today = date.today()
    db_request.is_overdue = (
        db_request.scheduled_date and
        db_request.scheduled_date < today and
        db_request.status != RequestStatus.REPAIRED and
        db_request.status != RequestStatus.SCRAP
    )
    
    return db_request


@router.delete("/{request_id}", status_code=204)
def delete_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Delete maintenance request"""
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    db.delete(db_request)
    db.commit()
    return None


@router.get("/calendar/preventive")
def get_preventive_requests_calendar(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get preventive maintenance requests for calendar view"""
    query = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.request_type == RequestType.PREVENTIVE,
        MaintenanceRequest.scheduled_date.isnot(None)
    )
    
    if start_date:
        query = query.filter(MaintenanceRequest.scheduled_date >= start_date)
    if end_date:
        query = query.filter(MaintenanceRequest.scheduled_date <= end_date)
    
    # Role-based filtering
    if current_user.role == UserRole.TECHNICIAN:
        user_teams = db.query(TeamMember.team_id).filter(
            TeamMember.user_id == current_user.id
        ).subquery()
        query = query.filter(MaintenanceRequest.auto_filled_team_id.in_(user_teams))
    
    requests = query.all()
    
    # Format for calendar
    calendar_events = []
    today = date.today()
    for req in requests:
        is_overdue = (
            req.scheduled_date < today and
            req.status != RequestStatus.REPAIRED and
            req.status != RequestStatus.SCRAP
        )
        calendar_events.append({
            "id": req.id,
            "title": req.subject,
            "start": req.scheduled_date.isoformat(),
            "equipment": req.equipment.name if req.equipment else None,
            "status": req.status.value,
            "is_overdue": is_overdue
        })
    
    return calendar_events

