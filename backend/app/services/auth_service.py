from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserCreate


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def register(self, payload: UserCreate):
        existing_user = self.repo.get_by_username(payload.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists",
            )

        return self.repo.create(
            username=payload.username,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )

    def login(self, username: str, password: str) -> TokenResponse:
        user = self.repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user",
            )

        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token)
