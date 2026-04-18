from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.purchases import PurchaseCreate, PurchasePublic
from app.services.purchases_service import PurchaseService

router = APIRouter(
    prefix="/purchases",
    tags=["purchases"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[PurchasePublic])
def list_purchases(db: Session = Depends(get_db)):
    return PurchaseService(db).list()


@router.get("/{purchase_id}", response_model=PurchasePublic)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    return PurchaseService(db).get_or_404(purchase_id)


@router.post("", response_model=PurchasePublic, status_code=201)
def create_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PurchaseService(db).create(payload, current_user.id)
