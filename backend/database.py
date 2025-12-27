"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os

# Use SQLite for local development if DATABASE_URL is not set
# This allows the app to run without PostgreSQL setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gearguard.db")

# SQLite requires check_same_thread=False
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL connection pool settings
    connect_args = {
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"
    }

# Create engine with pool pre-ping to verify connections
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=300,     # Recycle connections after 5 minutes
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

