from datetime import datetime

from pydantic import BaseModel, Field


class FormulaLine(BaseModel):
    ingredient_id: int
    quantity: float = Field(gt=0)


class FormulaCreate(BaseModel):
    product_id: int
    lines: list[FormulaLine] = Field(min_length=1)


class FormulaLinePublic(BaseModel):
    id: int
    ingredient_id: int
    quantity: float

    class Config:
        from_attributes = True


class BatchCreate(BaseModel):
    product_id: int
    quantity_produced: float = Field(gt=0)
    notes: str | None = None


class BatchPublic(BaseModel):
    id: int
    product_id: int
    quantity_produced: float
    notes: str | None
    produced_at: datetime
    created_by_id: int | None

    class Config:
        from_attributes = True
