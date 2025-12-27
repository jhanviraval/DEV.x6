"""
Maintenance Team routes with CRUD and technician linking
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import MaintenanceTeam, TeamMember, User, UserRole
from schemas import MaintenanceTeamCreate, MaintenanceTeamResponse, TeamMemberAdd, TeamMemberUpdate
from auth import get_current_user, require_role
from typing import List

router = APIRouter()


@router.post("/", response_model=MaintenanceTeamResponse, status_code=201)
def create_maintenance_team(
    team: MaintenanceTeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Create new maintenance team"""
    # Check if team name already exists
    existing = db.query(MaintenanceTeam).filter(MaintenanceTeam.team_name == team.team_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")
    
    db_team = MaintenanceTeam(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.get("/", response_model=List[MaintenanceTeamResponse])
def list_maintenance_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all maintenance teams"""
    teams = db.query(MaintenanceTeam).all()
    return teams


@router.get("/{team_id}", response_model=MaintenanceTeamResponse)
def get_maintenance_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance team by ID"""
    team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Maintenance team not found")
    return team


@router.put("/{team_id}", response_model=MaintenanceTeamResponse)
def update_maintenance_team(
    team_id: int,
    team: MaintenanceTeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Update maintenance team"""
    db_team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Maintenance team not found")
    
    # Check name uniqueness if changed
    if team.team_name != db_team.team_name:
        existing = db.query(MaintenanceTeam).filter(MaintenanceTeam.team_name == team.team_name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Team name already exists")
    
    db_team.team_name = team.team_name
    db.commit()
    db.refresh(db_team)
    return db_team


@router.delete("/{team_id}", status_code=204)
def delete_maintenance_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Delete maintenance team"""
    db_team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Maintenance team not found")
    
    db.delete(db_team)
    db.commit()
    return None


@router.post("/{team_id}/members", response_model=MaintenanceTeamResponse)
def add_team_member(
    team_id: int,
    member: TeamMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Add technician to maintenance team"""
    team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Maintenance team not found")
    
    user = db.query(User).filter(User.id == member.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is a technician
    if user.role != UserRole.TECHNICIAN:
        raise HTTPException(status_code=400, detail="User must be a technician")
    
    # Check if already a member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == member.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this team")
    
    team_member = TeamMember(
        team_id=team_id, 
        user_id=member.user_id,
        display_name=member.display_name or user.full_name or user.username
    )
    db.add(team_member)
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}/members/{user_id}", status_code=204)
def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Remove technician from maintenance team"""
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    db.delete(team_member)
    db.commit()
    return None


@router.put("/{team_id}/members/{user_id}", response_model=MaintenanceTeamResponse)
def update_team_member(
    team_id: int,
    user_id: int,
    member_data: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
):
    """Update team member display name"""
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    if member_data.display_name is not None:
        team_member.display_name = member_data.display_name
    
    db.commit()
    
    team = db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()
    return team

