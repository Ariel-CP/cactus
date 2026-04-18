from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_admin, get_current_user
from app.core.database import get_db
from app.schemas.auth import UserPublic
from app.schemas.users import UserAdminCreate, UserAdminUpdate
from app.services.users_service import UserAdminService

router = APIRouter(tags=["users"])


@router.get("/users", response_model=list[UserPublic], dependencies=[Depends(get_current_admin)])
def list_users(db: Session = Depends(get_db)):
    return UserAdminService(db).list()


@router.post(
    "/users",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin)],
)
def create_user(payload: UserAdminCreate, db: Session = Depends(get_db)):
    return UserAdminService(db).create(payload)


@router.patch(
    "/users/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(get_current_admin)],
)
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
):
    return UserAdminService(db).update(user_id, payload)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin)],
)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    UserAdminService(db).deactivate(user_id=user_id, actor_user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)