#!/usr/bin/env python
"""Create test user for login"""
import sys
sys.path.insert(0, '.')

from app.db.database import SessionLocal
from app.db.models import User
from app.utils.security import get_password_hash

db = SessionLocal()

try:
    # Create test user
    test_user = User(
        name="Test User",
        email="user01@example.com",
        password=get_password_hash("password123"),
        department="Engineering"
    )
    
    db.add(test_user)
    db.commit()
    print("✅ Test user created!")
    print("   Email: user01@example.com")
    print("   Password: password123")
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    db.close()
