from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.repositories.user_repository import UserRepository
from app.schemas.users import UserAdminCreate, UserAdminUpdate


class UserAdminService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def list(self):
        return self.repo.list()

    def get_or_404(self, user_id: int):
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    def create(self, payload: UserAdminCreate):
        existing = self.repo.get_by_username(payload.username)
        if existing:
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

    def update(self, user_id: int, payload: UserAdminUpdate):
        user = self.get_or_404(user_id)
        data = payload.model_dump(exclude_unset=True, exclude_none=True)

        password = data.pop("password", None)
        if password is not None:
            data["hashed_password"] = hash_password(password)

        return self.repo.update(user, data)

    def deactivate(self, user_id: int, actor_user_id: int) -> None:
        if user_id == actor_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own user",
            )

        user = self.get_or_404(user_id)
        if not user.is_active:
            return

        self.repo.update(user, {"is_active": False})