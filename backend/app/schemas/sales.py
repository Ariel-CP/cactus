from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ──────────────── Customer ────────────────

class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    notes: str | None = None


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    notes: str | None = None


class CustomerPublic(BaseModel):
    id: int
    name: str
    phone: str | None
    email: str | None
    notes: str | None
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────── Sale ────────────────

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)


class SaleCreate(BaseModel):
    customer_id: int | None = None
    payment_method: str = Field(
        default="cash", pattern="^(cash|transfer|credit)$"
    )
    notes: str | None = None
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleItemPublic(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float

    class Config:
        from_attributes = True


class SalePublic(BaseModel):
    id: int
    customer_id: int | None
    payment_method: str
    notes: str | None
    total: float
    sold_at: datetime
    created_by_id: int | None
    items: list[SaleItemPublic]

    class Config:
        from_attributes = True
