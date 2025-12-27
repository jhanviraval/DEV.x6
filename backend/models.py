"""
SQLAlchemy models for GearGuard Maintenance Management System
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.associationproxy import association_proxy
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles enum"""
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    TECHNICIAN = "TECHNICIAN"
    USER = "USER"


class EquipmentStatus(str, enum.Enum):
    """Equipment status enum"""
    ACTIVE = "ACTIVE"
    SCRAPPED = "SCRAPPED"


class RequestType(str, enum.Enum):
    """Maintenance request type enum"""
    CORRECTIVE = "CORRECTIVE"
    PREVENTIVE = "PREVENTIVE"


class RequestStatus(str, enum.Enum):
    """Maintenance request status enum"""
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    REPAIRED = "REPAIRED"
    SCRAP = "SCRAP"


class User(Base):
    """User model with role-based access"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assigned_equipment = relationship("Equipment", back_populates="assigned_employee_rel", foreign_keys="Equipment.assigned_employee_id")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="assigned_technician", foreign_keys="MaintenanceRequest.assigned_technician_id")
    team_memberships = relationship("TeamMember", back_populates="user")


class MaintenanceTeam(Base):
    """Maintenance Team model"""
    __tablename__ = "maintenance_teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_team")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="maintenance_team")
    team_members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    """Junction table for team members (technicians)"""
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("maintenance_teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    display_name = Column(String, nullable=True)  # Custom name for the member in this team
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    team = relationship("MaintenanceTeam", back_populates="team_members")
    user = relationship("User", back_populates="team_memberships")


class Equipment(Base):
    """Equipment model"""
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    serial_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    assigned_employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    purchase_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    location = Column(String, nullable=True)
    maintenance_team_id = Column(Integer, ForeignKey("maintenance_teams.id"), nullable=True)
    default_technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assigned_employee_rel = relationship("User", foreign_keys=[assigned_employee_id], back_populates="assigned_equipment")
    maintenance_team = relationship("MaintenanceTeam", back_populates="equipment")
    default_technician = relationship("User", foreign_keys=[default_technician_id])
    maintenance_requests = relationship("MaintenanceRequest", back_populates="equipment", cascade="all, delete-orphan")


class MaintenanceRequest(Base):
    """Maintenance Request model - Core module"""
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)
    auto_filled_team_id = Column(Integer, ForeignKey("maintenance_teams.id"), nullable=True)
    assigned_technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    request_type = Column(Enum(RequestType), nullable=False)
    scheduled_date = Column(Date, nullable=True)  # Required for PREVENTIVE
    duration_hours = Column(Float, nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.NEW, nullable=False)
    scrap_reason = Column(Text, nullable=True)  # Log reason when scrapped
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_requests")
    maintenance_team = relationship("MaintenanceTeam", back_populates="maintenance_requests")
    assigned_technician = relationship("User", foreign_keys=[assigned_technician_id], back_populates="maintenance_requests")
    created_by = relationship("User", foreign_keys=[created_by_id])

