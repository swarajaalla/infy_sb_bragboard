from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from .database import engine, Base, get_session
from .crud import get_users, create_user
from .routers import auth as auth_router
from .routers import users as users_router
from .routers import shoutouts as shoutouts_router

app = FastAPI(title="Bragboard API - Dev")


class UserCreate(BaseModel):
    email: str
    name: str | None = None


@app.on_event("startup")
async def on_startup():
    # create tables if they don't exist (development convenience)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health(session: AsyncSession = Depends(get_session)):
    try:
        users = await get_users(session)
        return {"status": "ok", "users_count": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/users")
async def post_user(payload: UserCreate, session: AsyncSession = Depends(get_session)):
    try:
        user = await create_user(session, payload.email, payload.name)
        return {"id": user.id, "email": user.email, "name": user.name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(shoutouts_router.router)
