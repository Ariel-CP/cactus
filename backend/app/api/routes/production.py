from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.production import (
    BatchCreate,
    BatchPublic,
    FormulaCreate,
    FormulaLinePublic,
)
from app.services.production_service import ProductionService

router = APIRouter(
    prefix="/production",
    tags=["production"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/formula/{product_id}", response_model=list[FormulaLinePublic]
)
def get_formula(product_id: int, db: Session = Depends(get_db)):
    return ProductionService(db).get_formula(product_id)


@router.put(
    "/formula", response_model=list[FormulaLinePublic], status_code=200
)
def save_formula(payload: FormulaCreate, db: Session = Depends(get_db)):
    return ProductionService(db).save_formula(payload)


@router.get("/batches", response_model=list[BatchPublic])
def list_batches(
    product_id: int | None = None, db: Session = Depends(get_db)
):
    return ProductionService(db).list_batches(product_id)


@router.post("/batches", response_model=BatchPublic, status_code=201)
def register_batch(
    payload: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ProductionService(db).register_batch(payload, current_user.id)
