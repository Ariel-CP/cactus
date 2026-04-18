from datetime import datetime

from pydantic import BaseModel, Field


class PurchaseItemCreate(BaseModel):
    ingredient_id: int
    quantity: float = Field(gt=0)
    unit_cost: float = Field(ge=0)


class PurchaseCreate(BaseModel):
    supplier: str | None = Field(default=None, max_length=150)
    notes: str | None = None
    items: list[PurchaseItemCreate] = Field(min_length=1)


class PurchaseItemPublic(BaseModel):
    id: int
    ingredient_id: int
    quantity: float
    unit_cost: float

    class Config:
        from_attributes = True


class PurchasePublic(BaseModel):
    id: int
    supplier: str | None
    notes: str | None
    total: float
    purchased_at: datetime
    created_by_id: int | None
    items: list[PurchaseItemPublic]

    class Config:
        from_attributes = True
