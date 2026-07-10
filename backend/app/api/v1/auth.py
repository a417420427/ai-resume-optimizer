from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas import UserRegister, UserLogin, Token, UserInfo
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=Token)
def register(req: UserRegister, db: Session = Depends(get_db)):
    try:
        user = AuthService.register(db, req.username, req.password, req.email)
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "Bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
def login(req: UserLogin, db: Session = Depends(get_db)):
    try:
        token, user = AuthService.login(db, req.username, req.password)
        return {"access_token": token, "token_type": "Bearer"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
