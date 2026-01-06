from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.database import engine
from app import models  # 👈 THIS MUST COME BEFORE create_all

from app.routers import auth_router
from app.shoutout import router as shoutout_router

# Create tables AFTER models are imported
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BradBoard",
    description="A blackboard collaboration platform",
    version="1.0.0"
)

# Swagger
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="BradBoard",
        version="1.0.0",
        description="A blackboard collaboration platform",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router)
app.include_router(shoutout_router)

@app.get("/")
def root():
    return {"message": "BradBoard API running"}
