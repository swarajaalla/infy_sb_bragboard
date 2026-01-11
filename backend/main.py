from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, auth
from database import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "ShoutOut API running 🚀"}


@app.post("/register")
def register(user: schemas.RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = models.User(
        username=user.username,
        password=auth.hash_password(user.password),
        role=user.role,
        department=user.department
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


@app.post("/login")
def login(data: schemas.LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()

    if not user or not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token}


# =========================
# MILESTONE-2 BACKEND
# =========================

@app.post("/shoutouts")
def create_shoutout(shout: schemas.ShoutOutCreate, db: Session = Depends(get_db)):
    new_shout = models.ShoutOut(
        message=shout.message,
        department=shout.department,
        sender_id=1  # (later replace with JWT user)
    )
    db.add(new_shout)
    db.commit()
    return {"message": "Shout-out created"}


@app.get("/shoutouts")
def get_shoutouts(db: Session = Depends(get_db)):
    return db.query(models.ShoutOut).order_by(models.ShoutOut.created_at.desc()).all()
