"""
Seed data script for GearGuard
Run this script to populate the database with initial data
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from database import SessionLocal, engine, Base
from models import User, MaintenanceTeam, TeamMember, Equipment, MaintenanceRequest, UserRole, EquipmentStatus, RequestType, RequestStatus
from auth import get_password_hash
from datetime import date, timedelta
import time
import sys

# Create all tables
def create_tables():
    """Create database tables with retry logic"""
    max_retries = 10
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully")
            return True
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"⏳ Waiting for database to be ready... (attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                print(f"❌ Failed to create tables after {max_retries} attempts: {e}")
                raise
    return False

def seed_data():
    """Seed the database with initial data"""
    # Create tables first
    create_tables()
    
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("ℹ️  Database already seeded. Skipping seed data creation.")
            return
        
        # Create Users
        admin = User(
            email="admin@gearguard.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        
        manager = User(
            email="manager@gearguard.com",
            username="manager",
            hashed_password=get_password_hash("manager123"),
            full_name="Manager User",
            role=UserRole.MANAGER,
            is_active=True
        )
        db.add(manager)
        
        technician1 = User(
            email="tech1@gearguard.com",
            username="technician1",
            hashed_password=get_password_hash("tech123"),
            full_name="John Technician",
            role=UserRole.TECHNICIAN,
            is_active=True
        )
        db.add(technician1)
        
        technician2 = User(
            email="tech2@gearguard.com",
            username="technician2",
            hashed_password=get_password_hash("tech123"),
            full_name="Jane Technician",
            role=UserRole.TECHNICIAN,
            is_active=True
        )
        db.add(technician2)
        
        regular_user = User(
            email="user@gearguard.com",
            username="user",
            hashed_password=get_password_hash("user123"),
            full_name="Regular User",
            role=UserRole.USER,
            is_active=True
        )
        db.add(regular_user)
        
        db.commit()
        db.refresh(admin)
        db.refresh(manager)
        db.refresh(technician1)
        db.refresh(technician2)
        db.refresh(regular_user)
        
        # Create Maintenance Teams
        team1 = MaintenanceTeam(team_name="Electrical Team")
        team2 = MaintenanceTeam(team_name="Mechanical Team")
        team3 = MaintenanceTeam(team_name="IT Support Team")
        
        db.add(team1)
        db.add(team2)
        db.add(team3)
        db.commit()
        db.refresh(team1)
        db.refresh(team2)
        db.refresh(team3)
        
        # Add technicians to teams
        team_member1 = TeamMember(team_id=team1.id, user_id=technician1.id)
        team_member2 = TeamMember(team_id=team2.id, user_id=technician2.id)
        team_member3 = TeamMember(team_id=team1.id, user_id=technician2.id)  # Technician2 in both teams
        
        db.add(team_member1)
        db.add(team_member2)
        db.add(team_member3)
        db.commit()
        
        # Create Equipment
        equipment1 = Equipment(
            name="Industrial Generator A",
            serial_number="GEN-001",
            department="Production",
            assigned_employee_id=regular_user.id,
            purchase_date=date.today() - timedelta(days=365),
            warranty_expiry=date.today() + timedelta(days=365),
            location="Building A - Floor 1",
            maintenance_team_id=team1.id,
            default_technician_id=technician1.id,
            status=EquipmentStatus.ACTIVE
        )
        
        equipment2 = Equipment(
            name="Conveyor Belt System B",
            serial_number="CONV-002",
            department="Warehouse",
            assigned_employee_id=regular_user.id,
            purchase_date=date.today() - timedelta(days=180),
            warranty_expiry=date.today() + timedelta(days=180),
            location="Building B - Floor 2",
            maintenance_team_id=team2.id,
            default_technician_id=technician2.id,
            status=EquipmentStatus.ACTIVE
        )
        
        equipment3 = Equipment(
            name="Server Rack C",
            serial_number="SRV-003",
            department="IT",
            assigned_employee_id=None,
            purchase_date=date.today() - timedelta(days=730),
            warranty_expiry=date.today() - timedelta(days=30),
            location="Data Center",
            maintenance_team_id=team3.id,
            default_technician_id=None,
            status=EquipmentStatus.ACTIVE
        )
        
        equipment4 = Equipment(
            name="HVAC Unit D",
            serial_number="HVAC-004",
            department="Facilities",
            assigned_employee_id=regular_user.id,
            purchase_date=date.today() - timedelta(days=90),
            warranty_expiry=date.today() + timedelta(days=270),
            location="Building A - Roof",
            maintenance_team_id=team2.id,
            default_technician_id=technician2.id,
            status=EquipmentStatus.ACTIVE
        )
        
        db.add(equipment1)
        db.add(equipment2)
        db.add(equipment3)
        db.add(equipment4)
        db.commit()
        db.refresh(equipment1)
        db.refresh(equipment2)
        db.refresh(equipment3)
        db.refresh(equipment4)
        
        # Create Maintenance Requests
        # Corrective requests
        request1 = MaintenanceRequest(
            subject="Generator not starting",
            description="Generator fails to start in the morning. Checked fuel levels, all good.",
            equipment_id=equipment1.id,
            auto_filled_team_id=team1.id,
            assigned_technician_id=technician1.id,
            request_type=RequestType.CORRECTIVE,
            scheduled_date=None,
            duration_hours=None,
            status=RequestStatus.NEW,
            created_by_id=regular_user.id
        )
        
        request2 = MaintenanceRequest(
            subject="Conveyor belt making noise",
            description="Loud grinding noise coming from the conveyor belt system.",
            equipment_id=equipment2.id,
            auto_filled_team_id=team2.id,
            assigned_technician_id=technician2.id,
            request_type=RequestType.CORRECTIVE,
            scheduled_date=None,
            duration_hours=2.5,
            status=RequestStatus.IN_PROGRESS,
            created_by_id=regular_user.id
        )
        
        request3 = MaintenanceRequest(
            subject="Server overheating",
            description="Server rack showing high temperature warnings.",
            equipment_id=equipment3.id,
            auto_filled_team_id=team3.id,
            assigned_technician_id=None,
            request_type=RequestType.CORRECTIVE,
            scheduled_date=None,
            duration_hours=None,
            status=RequestStatus.REPAIRED,
            created_by_id=manager.id
        )
        
        # Preventive requests
        request4 = MaintenanceRequest(
            subject="Monthly generator inspection",
            description="Routine monthly inspection and oil change for generator.",
            equipment_id=equipment1.id,
            auto_filled_team_id=team1.id,
            assigned_technician_id=technician1.id,
            request_type=RequestType.PREVENTIVE,
            scheduled_date=date.today() + timedelta(days=7),
            duration_hours=1.0,
            status=RequestStatus.NEW,
            created_by_id=manager.id
        )
        
        request5 = MaintenanceRequest(
            subject="Quarterly conveyor maintenance",
            description="Quarterly maintenance check for conveyor belt system.",
            equipment_id=equipment2.id,
            auto_filled_team_id=team2.id,
            assigned_technician_id=technician2.id,
            request_type=RequestType.PREVENTIVE,
            scheduled_date=date.today() + timedelta(days=14),
            duration_hours=3.0,
            status=RequestStatus.NEW,
            created_by_id=manager.id
        )
        
        request6 = MaintenanceRequest(
            subject="Overdue preventive maintenance",
            description="This request is overdue for demonstration purposes.",
            equipment_id=equipment4.id,
            auto_filled_team_id=team2.id,
            assigned_technician_id=technician2.id,
            request_type=RequestType.PREVENTIVE,
            scheduled_date=date.today() - timedelta(days=5),  # Overdue
            duration_hours=None,
            status=RequestStatus.NEW,
            created_by_id=manager.id
        )
        
        db.add(request1)
        db.add(request2)
        db.add(request3)
        db.add(request4)
        db.add(request5)
        db.add(request6)
        db.commit()
        
        print("✅ Seed data created successfully!")
        print("\n📋 Default Users:")
        print("  Admin: admin / admin123")
        print("  Manager: manager / manager123")
        print("  Technician 1: technician1 / tech123")
        print("  Technician 2: technician2 / tech123")
        print("  User: user / user123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)

