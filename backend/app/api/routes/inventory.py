from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.schemas.inventory import (
    CategoryCreate,
    CategoryPublic,
    CategoryUpdate,
    IngredientCreate,
    IngredientPublic,
    IngredientUpdate,
    ProductCreate,
    ProductPublic,
    ProductUpdate,
)
from app.services.inventory_service import (
    CategoryService,
    IngredientService,
    ProductService,
)

router = APIRouter(
    tags=["inventory"],
    dependencies=[Depends(get_current_user)],
)


# ──────────────── Categories ────────────────

@router.get("/categories", response_model=list[CategoryPublic])
def list_categories(db: Session = Depends(get_db)):
    return CategoryService(db).list()


@router.post("/categories", response_model=CategoryPublic, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService(db).create(payload)


@router.get("/categories/{category_id}", response_model=CategoryPublic)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return CategoryService(db).get_or_404(category_id)


@router.patch("/categories/{category_id}", response_model=CategoryPublic)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
):
    return CategoryService(db).update(category_id, payload)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    CategoryService(db).delete(category_id)


# ──────────────── Ingredients ────────────────

@router.get("/ingredients", response_model=list[IngredientPublic])
def list_ingredients(
    low_stock: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return IngredientService(db).list(low_stock_only=low_stock)


@router.post("/ingredients", response_model=IngredientPublic, status_code=201)
def create_ingredient(
    payload: IngredientCreate, db: Session = Depends(get_db)
):
    return IngredientService(db).create(payload)


@router.get("/ingredients/{ingredient_id}", response_model=IngredientPublic)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    return IngredientService(db).get_or_404(ingredient_id)


@router.patch("/ingredients/{ingredient_id}", response_model=IngredientPublic)
def update_ingredient(
    ingredient_id: int,
    payload: IngredientUpdate,
    db: Session = Depends(get_db),
):
    return IngredientService(db).update(ingredient_id, payload)


@router.delete("/ingredients/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    IngredientService(db).delete(ingredient_id)


# ──────────────── Products ────────────────

@router.get("/products", response_model=list[ProductPublic])
def list_products(
    low_stock: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return ProductService(db).list(low_stock_only=low_stock)


@router.post("/products", response_model=ProductPublic, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ProductService(db).create(payload)


@router.get("/products/{product_id}", response_model=ProductPublic)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ProductService(db).get_or_404(product_id)


@router.patch("/products/{product_id}", response_model=ProductPublic)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    return ProductService(db).update(product_id, payload)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    ProductService(db).delete(product_id)
