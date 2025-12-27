"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models import UserRole, EquipmentStatus, RequestType, RequestStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Maintenance Team Schemas
class MaintenanceTeamBase(BaseModel):
    team_name: str


class MaintenanceTeamCreate(MaintenanceTeamBase):
    pass


class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    display_name: Optional[str] = None
    user: UserResponse

    class Config:
        from_attributes = True


class MaintenanceTeamResponse(MaintenanceTeamBase):
    id: int
    created_at: datetime
    team_members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True


class TeamMemberAdd(BaseModel):
    user_id: int
    display_name: Optional[str] = None


class TeamMemberUpdate(BaseModel):
    display_name: Optional[str] = None


# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    serial_number: Optional[str] = None
    department: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    location: Optional[str] = None
    maintenance_team_id: Optional[int] = None
    default_technician_id: Optional[int] = None
    status: EquipmentStatus = EquipmentStatus.ACTIVE


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentResponse(EquipmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    assigned_employee: Optional[UserResponse] = None
    maintenance_team: Optional[MaintenanceTeamResponse] = None
    default_technician: Optional[UserResponse] = None
    open_requests_count: int = 0  # For smart button

    class Config:
        from_attributes = True


class EquipmentListResponse(BaseModel):
    items: List[EquipmentResponse]
    total: int


# Maintenance Request Schemas
class MaintenanceRequestBase(BaseModel):
    subject: str
    description: Optional[str] = None
    equipment_id: int
    request_type: RequestType
    scheduled_date: Optional[date] = None
    duration_hours: Optional[float] = None


class MaintenanceRequestCreate(MaintenanceRequestBase):
    assigned_technician_id: Optional[int] = None


class MaintenanceRequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    assigned_technician_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    duration_hours: Optional[float] = None
    status: Optional[RequestStatus] = None
    scrap_reason: Optional[str] = None


class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    status: RequestStatus
    auto_filled_team_id: Optional[int] = None
    assigned_technician_id: Optional[int] = None
    scrap_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    equipment: Optional[EquipmentResponse] = None
    maintenance_team: Optional[MaintenanceTeamResponse] = None
    assigned_technician: Optional[UserResponse] = None
    is_overdue: bool = False

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# Reporting Schemas
class ReportResponse(BaseModel):
    requests_per_team: dict
    requests_per_equipment: dict
    preventive_vs_corrective: dict

