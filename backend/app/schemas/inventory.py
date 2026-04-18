from datetime import datetime

from pydantic import BaseModel, Field


# ──────────────────── Category ────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    kind: str = Field(default="both", pattern="^(ingredient|product|both)$")


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = None
    kind: str | None = Field(default=None, pattern="^(ingredient|product|both)$")


class CategoryPublic(BaseModel):
    id: int
    name: str
    description: str | None
    kind: str
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────── Ingredient ────────────────────

class IngredientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    unit: str = Field(min_length=1, max_length=20)
    stock: float = Field(default=0, ge=0)
    min_stock: float = Field(default=0, ge=0)
    cost_per_unit: float = Field(default=0, ge=0)
    category_id: int | None = None


class IngredientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    stock: float | None = Field(default=None, ge=0)
    min_stock: float | None = Field(default=None, ge=0)
    cost_per_unit: float | None = Field(default=None, ge=0)
    category_id: int | None = None


class IngredientPublic(BaseModel):
    id: int
    name: str
    description: str | None
    unit: str
    stock: float
    min_stock: float
    cost_per_unit: float
    category_id: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ──────────────────── Product ────────────────────

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    sku: str | None = Field(default=None, max_length=60)
    unit: str = Field(min_length=1, max_length=20)
    stock: float = Field(default=0, ge=0)
    min_stock: float = Field(default=0, ge=0)
    sale_price: float = Field(default=0, ge=0)
    category_id: int | None = None


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    sku: str | None = Field(default=None, max_length=60)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    stock: float | None = Field(default=None, ge=0)
    min_stock: float | None = Field(default=None, ge=0)
    sale_price: float | None = Field(default=None, ge=0)
    category_id: int | None = None


class ProductPublic(BaseModel):
    id: int
    name: str
    description: str | None
    sku: str | None
    unit: str
    stock: float
    min_stock: float
    sale_price: float
    category_id: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
