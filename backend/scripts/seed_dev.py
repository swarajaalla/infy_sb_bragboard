"""Seed script for development: creates a few users in different departments.
Run with: python -m backend.scripts.seed_dev or from repo root: python backend/scripts/seed_dev.py
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal, engine, Base
from app import models
from app.core import security

SAMPLE_USERS = [
    {"email": "alice@example.com", "name": "Alice", "password": "password123", "department": "Engineering"},
    {"email": "bob@example.com", "name": "Bob", "password": "password123", "department": "Sales"},
    {"email": "carol@example.com", "name": "Carol", "password": "password123", "department": "Engineering"},
    {"email": "sam@example.com", "name": "Sam", "password": "password123", "department": "Engineering"},
    {"email": "sai@example.com", "name": "Sai", "password": "password123", "department": "Sales"},
    {"email": "ani@example.com", "name": "Ani", "password": "password123", "department": "HR"},
    {"email": "dave@example.com", "name": "Dave", "password": "password123", "department": "HR"},
    {"email": "joe@example.com", "name": "Joe", "password": "password123", "department": "Engineering"},
]


async def seed():
    # ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:  # type: AsyncSession
        # insert users if they don't exist
        for u in SAMPLE_USERS:
            q = await session.execute(select(models.User).where(models.User.email == u["email"]))
            found = q.scalar_one_or_none()
            if found:
                print(f"Skipping existing user {u['email']}")
                continue
            pwd = security.get_password_hash(u["password"])
            user = models.User(email=u["email"], name=u["name"], password_hash=pwd, department=u["department"])
            session.add(user)
        await session.commit()
    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed())
