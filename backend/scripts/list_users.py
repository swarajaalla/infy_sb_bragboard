import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app import models

async def list_users():
    async with AsyncSessionLocal() as session:
        q = await session.execute(select(models.User))
        users = q.scalars().all()
        for u in users:
            print(f"{u.id}	{u.email}	{u.name}	{u.department}")

if __name__ == '__main__':
    asyncio.run(list_users())
