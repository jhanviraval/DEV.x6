"""
Database initialization script
Ensures the database exists and is ready for connections
"""
import os
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gearguard.db")

def init_database():
    """Initialize the database connection and verify it exists"""
    max_retries = 30
    retry_delay = 2
    
    print("🔍 Checking database connection...")
    
    for attempt in range(max_retries):
        try:
            # Parse the database URL to get connection details
            if "postgresql" in DATABASE_URL:
                # For PostgreSQL, try to connect to the postgres database first
                # to check if the target database exists
                from urllib.parse import urlparse
                parsed = urlparse(DATABASE_URL)
                
                # Create a connection to the default 'postgres' database
                admin_url = f"postgresql://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port or 5432}/postgres"
                admin_engine = create_engine(admin_url, connect_args={"connect_timeout": 5})
                
                try:
                    with admin_engine.connect() as conn:
                        # Check if the target database exists
                        db_name = parsed.path.lstrip('/')
                        if not db_name:
                            db_name = parsed.username  # Fallback to username if no db in path
                        
                        result = conn.execute(text(
                            f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"
                        ))
                        exists = result.fetchone()
                        
                        if not exists:
                            print(f"📦 Creating database '{db_name}'...")
                            # Use autocommit for DDL statements
                            conn.execute(text(f"CREATE DATABASE {db_name}"))
                            conn.commit()
                            print(f"✅ Database '{db_name}' created successfully")
                        else:
                            print(f"✅ Database '{db_name}' already exists")
                except Exception as e:
                    print(f"⚠️  Could not check/create database via admin connection: {e}")
                    # Continue anyway - the database might already exist
                finally:
                    admin_engine.dispose()
            
            # Now try to connect to the actual database
            engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 10})
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            return True
            
        except OperationalError as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                if "does not exist" in error_msg or "database" in error_msg.lower():
                    print(f"⏳ Database not ready yet... (attempt {attempt + 1}/{max_retries})")
                else:
                    print(f"⏳ Waiting for database connection... (attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                print(f"❌ Failed to connect to database after {max_retries} attempts")
                print(f"   Error: {error_msg}")
                print(f"   DATABASE_URL: {DATABASE_URL}")
                return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                return False
    
    return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

