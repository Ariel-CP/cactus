from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.sales import (
    CustomerCreate,
    CustomerPublic,
    CustomerUpdate,
    SaleCreate,
    SalePublic,
)
from app.services.sales_service import CustomerService, SaleService

router = APIRouter(
    tags=["sales"],
    dependencies=[Depends(get_current_user)],
)


# ── Customers ────────────────────────────────────────────

@router.get("/customers", response_model=list[CustomerPublic])
def list_customers(db: Session = Depends(get_db)):
    return CustomerService(db).list()


@router.post("/customers", response_model=CustomerPublic, status_code=201)
def create_customer(
    payload: CustomerCreate, db: Session = Depends(get_db)
):
    return CustomerService(db).create(payload)


@router.get("/customers/{customer_id}", response_model=CustomerPublic)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return CustomerService(db).get_or_404(customer_id)


@router.patch(
    "/customers/{customer_id}", response_model=CustomerPublic
)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
):
    return CustomerService(db).update(customer_id, payload)


@router.delete("/customers/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService(db).delete(customer_id)


# ── Sales ────────────────────────────────────────────────

@router.get("/sales", response_model=list[SalePublic])
def list_sales(
    customer_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return SaleService(db).list(customer_id)


@router.get("/sales/{sale_id}", response_model=SalePublic)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    return SaleService(db).get_or_404(sale_id)


@router.post("/sales", response_model=SalePublic, status_code=201)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SaleService(db).create(payload, current_user.id)
