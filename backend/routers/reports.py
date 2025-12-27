"""
Reporting routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import MaintenanceRequest, MaintenanceTeam, Equipment, RequestType, User
from schemas import ReportResponse
from auth import get_current_user, require_role, UserRole

router = APIRouter()


@router.get("/", response_model=ReportResponse)
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Get maintenance reports"""
    # Requests per team
    requests_per_team = db.query(
        MaintenanceTeam.team_name,
        func.count(MaintenanceRequest.id).label("count")
    ).join(
        MaintenanceRequest, MaintenanceRequest.auto_filled_team_id == MaintenanceTeam.id
    ).group_by(MaintenanceTeam.team_name).all()
    
    team_dict = {team.team_name: team.count for team in requests_per_team}
    
    # Requests per equipment
    requests_per_equipment = db.query(
        Equipment.name,
        func.count(MaintenanceRequest.id).label("count")
    ).join(
        MaintenanceRequest, MaintenanceRequest.equipment_id == Equipment.id
    ).group_by(Equipment.name).limit(20).all()  # Top 20
    
    equipment_dict = {eq.name: eq.count for eq in requests_per_equipment}
    
    # Preventive vs Corrective ratio
    preventive_count = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.request_type == RequestType.PREVENTIVE
    ).count()
    
    corrective_count = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.request_type == RequestType.CORRECTIVE
    ).count()
    
    total = preventive_count + corrective_count
    preventive_vs_corrective = {
        "preventive": preventive_count,
        "corrective": corrective_count,
        "preventive_percentage": round((preventive_count / total * 100) if total > 0 else 0, 2),
        "corrective_percentage": round((corrective_count / total * 100) if total > 0 else 0, 2)
    }
    
    return ReportResponse(
        requests_per_team=team_dict,
        requests_per_equipment=equipment_dict,
        preventive_vs_corrective=preventive_vs_corrective
    )

