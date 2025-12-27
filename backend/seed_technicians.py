
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, UserRole, TeamMember
from auth import get_password_hash

def seed_technicians():
    db = SessionLocal()
    
    # 1. Cleanup ALL technicians to be safe and strict
    print("Cleaning up all technicians...")
    # Delete anyone with role TECHNICIAN or name like Technician%
    techs = db.query(User).filter((User.role == UserRole.TECHNICIAN) | (User.username.like("technician%"))).all()
    for t in techs:
        db.query(TeamMember).filter(TeamMember.user_id == t.id).delete()
        db.delete(t)
    db.commit()

    # 2. Create EXACTLY 10 technicians
    print("Creating exactly 10 technicians...")
    for i in range(1, 11):
        username = f"technician{i}"
        
        user = User(
            username=username,
            email=f"{username}@gearguard.com",
            full_name=f"Technician {i}",
            role=UserRole.TECHNICIAN,
            hashed_password=get_password_hash("password123")
        )
        db.add(user)
        print(f"Created {user.full_name}")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_technicians()
