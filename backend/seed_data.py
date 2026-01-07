#!/usr/bin/env python
"""Create test data"""
import sys
sys.path.insert(0, '.')

from app.db.database import SessionLocal
from app.db.models import User, ShoutOut, ShoutOutRecipient, Comment, Reaction
from app.utils.security import get_password_hash

db = SessionLocal()

try:
    # Check if users exist
    user1 = db.query(User).filter(User.email == "user01@example.com").first()
    user2 = db.query(User).filter(User.email == "user02@example.com").first()
    
    # Create second user if not exists
    if not user2:
        user2 = User(
            name="Jane Doe",
            email="user02@example.com",
            password=get_password_hash("password123"),
            department="Marketing"
        )
        db.add(user2)
        db.commit()
        print("✅ Created user2")
    
    # Create test shoutouts
    shoutout1 = ShoutOut(
        sender_id=user2.id,
        message="Amazing work on the project! Really impressed with your dedication and effort! 🌟"
    )
    db.add(shoutout1)
    db.flush()  # Get the ID
    
    # Add recipient
    recipient1 = ShoutOutRecipient(
        shoutout_id=shoutout1.id,
        recipient_id=user1.id
    )
    db.add(recipient1)
    
    # Add some comments
    comment1 = Comment(
        shoutout_id=shoutout1.id,
        user_id=user1.id,
        content="Thanks! It was a team effort 💪"
    )
    db.add(comment1)
    
    # Add reactions
    reaction1 = Reaction(
        shoutout_id=shoutout1.id,
        user_id=user1.id,
        type="heart"
    )
    db.add(reaction1)
    
    reaction2 = Reaction(
        shoutout_id=shoutout1.id,
        user_id=user2.id,
        type="thumbs_up"
    )
    db.add(reaction2)
    
    db.commit()
    
    print("✅ Test data created successfully!")
    print(f"   - User 1: {user1.email} (ID: {user1.id})")
    print(f"   - User 2: {user2.email} (ID: {user2.id})")
    print(f"   - Shoutout: '{shoutout1.message[:50]}...'")
    print(f"   - Comment from user1")
    print(f"   - Reactions: ❤️ from user1, 👍 from user2")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
finally:
    db.close()
