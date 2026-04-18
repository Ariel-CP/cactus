from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.inventory_repository import (
    CategoryRepository,
    IngredientRepository,
    ProductRepository,
)
from app.schemas.inventory import (
    CategoryCreate,
    CategoryUpdate,
    IngredientCreate,
    IngredientUpdate,
    ProductCreate,
    ProductUpdate,
)


class CategoryService:
    def __init__(self, db: Session) -> None:
        self.repo = CategoryRepository(db)

    def list(self):
        return self.repo.list()

    def get_or_404(self, category_id: int):
        obj = self.repo.get(category_id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        return obj

    def create(self, payload: CategoryCreate):
        return self.repo.create(**payload.model_dump())

    def update(self, category_id: int, payload: CategoryUpdate):
        obj = self.get_or_404(category_id)
        data = payload.model_dump(exclude_unset=True)
        return self.repo.update(obj, data)

    def delete(self, category_id: int) -> None:
        obj = self.get_or_404(category_id)
        self.repo.delete(obj)


class IngredientService:
    def __init__(self, db: Session) -> None:
        self.repo = IngredientRepository(db)

    def list(self, low_stock_only: bool = False):
        return self.repo.list(low_stock_only=low_stock_only)

    def get_or_404(self, ingredient_id: int):
        obj = self.repo.get(ingredient_id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingredient not found",
            )
        return obj

    def create(self, payload: IngredientCreate):
        return self.repo.create(**payload.model_dump())

    def update(self, ingredient_id: int, payload: IngredientUpdate):
        obj = self.get_or_404(ingredient_id)
        data = payload.model_dump(exclude_unset=True)
        return self.repo.update(obj, data)

    def delete(self, ingredient_id: int) -> None:
        obj = self.get_or_404(ingredient_id)
        self.repo.delete(obj)


class ProductService:
    def __init__(self, db: Session) -> None:
        self.repo = ProductRepository(db)

    def list(self, low_stock_only: bool = False):
        return self.repo.list(low_stock_only=low_stock_only)

    def get_or_404(self, product_id: int):
        obj = self.repo.get(product_id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found",
            )
        return obj

    def create(self, payload: ProductCreate):
        return self.repo.create(**payload.model_dump())

    def update(self, product_id: int, payload: ProductUpdate):
        obj = self.get_or_404(product_id)
        data = payload.model_dump(exclude_unset=True)
        return self.repo.update(obj, data)

    def delete(self, product_id: int) -> None:
        obj = self.get_or_404(product_id)
        self.repo.delete(obj)
