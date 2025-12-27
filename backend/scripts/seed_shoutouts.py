"""Seed script to create sample shoutouts for testing
Run with: python -m backend.scripts.seed_shoutouts
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import random

from app.database import AsyncSessionLocal, engine, Base
from app import models, crud

SAMPLE_MESSAGES = [
    "Great job on the presentation today! 🎉",
    "Thank you for helping me debug that tricky issue!",
    "Amazing work on the new feature release!",
    "Your dedication to the project is truly inspiring!",
    "Thanks for staying late to help with the deployment!",
    "Excellent teamwork on yesterday's sprint!",
    "Your code review comments were super helpful!",
    "Love the innovative solution you came up with!",
    "Thanks for mentoring the new team members!",
    "Outstanding performance this quarter!",
]


async def seed_shoutouts():
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        # Get all users
        result = await session.execute(select(models.User))
        users = result.scalars().all()
        
        if len(users) < 2:
            print("Not enough users to create shoutouts. Run seed_dev.py first.")
            return
        
        print(f"Found {len(users)} users. Creating sample shoutouts...")
        
        # Create 15 random shoutouts
        for i in range(15):
            # Random author
            author = random.choice(users)
            
            # Random 1-3 recipients (excluding author)
            available_recipients = [u for u in users if u.id != author.id]
            num_recipients = random.randint(1, min(3, len(available_recipients)))
            recipients = random.sample(available_recipients, num_recipients)
            recipient_ids = [r.id for r in recipients]
            
            # Random message
            message = random.choice(SAMPLE_MESSAGES)
            
            # Create shoutout
            shoutout = await crud.create_shoutout(
                session,
                author_id=author.id,
                message=message,
                recipient_ids=recipient_ids
            )
            
            # Modify created_at to have some variety (last 7 days)
            days_ago = random.randint(0, 7)
            shoutout.created_at = datetime.now() - timedelta(days=days_ago)
            await session.commit()
            
            print(f"  Created: {author.name} → {[r.name for r in recipients]}: {message[:30]}...")
        
        print(f"\n✅ Successfully created 15 sample shoutouts!")


if __name__ == "__main__":
    asyncio.run(seed_shoutouts())
