#!/usr/bin/env python
"""Reset the database to fix ENUM issues"""

from app.db.database import engine, Base
from app.db.models import *

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables with correct schema...")
Base.metadata.create_all(bind=engine)

print("✅ Database reset successfully!")
print("The reactions table now uses String type instead of ENUM")
