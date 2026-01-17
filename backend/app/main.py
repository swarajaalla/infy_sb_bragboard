from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users
from .database import engine
from . import models
from .config import settings
from .routers import shoutouts
from .routers import comments
from .routers import reactions
from .routers import admin
from .routers import reports


# Create database tables (development only)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)

# Test endpoint
@app.get("/")
def root():
    return {"message": "BragBoard Backend Running!"}

app.include_router(shoutouts.router)

app.include_router(comments.router)

app.include_router(reactions.router)

app.include_router(admin.router)

app.include_router(reports.router)