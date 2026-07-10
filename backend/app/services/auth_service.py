from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register(db: Session, username: str, password: str, email: str = None) -> User:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise ValueError("用户名已存在")

        if email:
            email_exists = db.query(User).filter(User.email == email).first()
            if email_exists:
                raise ValueError("邮箱已被注册")

        user = User(
            username=username,
            hashed_password=hash_password(password),
            email=email,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, username: str, password: str) -> tuple[str, User]:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("用户名或密码错误")

        token = create_access_token({"sub": str(user.id)})
        return token, user
