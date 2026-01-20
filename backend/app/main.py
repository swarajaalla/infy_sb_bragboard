from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.routes import user
from app.routes import admin
from app.routes import export

from app.routes.shoutout import router as shoutout_router
from app.routes import reactions
from app.routes import comments
from app.routes import report


# IMPORTANT: import models so tables are registered
import app.models

app = FastAPI(title="BragBoard API")

# ------------------ CORS CONFIG ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ ROUTES ------------------
app.include_router(user.router)
app.include_router(shoutout_router)
app.include_router(reactions.router)
app.include_router(comments.router)
app.include_router(admin.router)
app.include_router(report.router)
app.include_router(export.router)

# ------------------ CREATE TABLES ------------------
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "BragBoard backend is running"}
