@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed,
        department=user.department,
        role="employee"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered"}
