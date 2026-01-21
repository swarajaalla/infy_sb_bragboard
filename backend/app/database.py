from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Replace YOUR_PASSWORD with the password you set for postgres
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/bragboard_db"

# Create engine for PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal is used to interact with the database
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for your models
Base = declarative_base()

# Dependency to get DB session in FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
