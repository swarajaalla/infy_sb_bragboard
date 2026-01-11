from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.shoutout import router as shoutout_router
from app.routes.user import router as user_router
from app.routes.comment import router as comment_router
from app.routes.reaction import router as reaction_router




app = FastAPI(title="BragBoard API")

app.include_router(shoutout_router)
app.include_router(user_router)

app.include_router(comment_router)
app.include_router(reaction_router)


# ✅ CORS CONFIG (THIS FIXES YOUR ERROR)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "BragBoard backend running"}
