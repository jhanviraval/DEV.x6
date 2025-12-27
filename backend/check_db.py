from database import SessionLocal
from models import User, MaintenanceRequest, MaintenanceTeam, TeamMember
from sqlalchemy import or_

db = SessionLocal()
try:
    print("--- Users ---")
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Role: {u.role}")

    print("\n--- Teams ---")
    teams = db.query(MaintenanceTeam).all()
    for t in teams:
        members = db.query(User.username).join(TeamMember).filter(TeamMember.team_id == t.id).all()
        print(f"Team: {t.team_name}, Members: {[m.username for m in members]}")

    print("\n--- Maintenance Requests ---")
    reqs = db.query(MaintenanceRequest).all()
    for r in reqs:
        print(f"ID: {r.id}, Subject: {r.subject}, Status: {r.status}, Team ID: {r.auto_filled_team_id}, Tech ID: {r.assigned_technician_id}")
finally:
    db.close()
