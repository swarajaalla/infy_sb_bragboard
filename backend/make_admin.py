from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

# 🔴 CHANGE THIS EMAIL
ADMIN_EMAIL = "prasanna@gmail.com"

user = db.query(User).filter(User.email == ADMIN_EMAIL).first()

if not user:
    print("❌ User not found")
else:
    user.role = "admin"
    db.commit()
    print(f"✅ {user.email} promoted to ADMIN")
