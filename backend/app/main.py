from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.db.database import engine, Base
from app.api import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Welcome to BragBoard API"}

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)