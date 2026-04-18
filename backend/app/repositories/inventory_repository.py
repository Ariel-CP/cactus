from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory import Category, Ingredient, Product


class CategoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Category]:
        return list(self.db.scalars(select(Category).order_by(Category.name)))

    def get(self, category_id: int) -> Category | None:
        return self.db.scalar(select(Category).where(Category.id == category_id))

    def create(self, **kwargs) -> Category:
        obj = Category(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: Category, data: dict) -> Category:
        for key, value in data.items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: Category) -> None:
        self.db.delete(obj)
        self.db.commit()


class IngredientRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, low_stock_only: bool = False) -> list[Ingredient]:
        stmt = select(Ingredient).order_by(Ingredient.name)
        if low_stock_only:
            stmt = stmt.where(Ingredient.stock < Ingredient.min_stock)
        return list(self.db.scalars(stmt))

    def get(self, ingredient_id: int) -> Ingredient | None:
        return self.db.scalar(
            select(Ingredient).where(Ingredient.id == ingredient_id)
        )

    def create(self, **kwargs) -> Ingredient:
        obj = Ingredient(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: Ingredient, data: dict) -> Ingredient:
        for key, value in data.items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: Ingredient) -> None:
        self.db.delete(obj)
        self.db.commit()


class ProductRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, low_stock_only: bool = False) -> list[Product]:
        stmt = select(Product).order_by(Product.name)
        if low_stock_only:
            stmt = stmt.where(Product.stock < Product.min_stock)
        return list(self.db.scalars(stmt))

    def get(self, product_id: int) -> Product | None:
        return self.db.scalar(
            select(Product).where(Product.id == product_id)
        )

    def create(self, **kwargs) -> Product:
        obj = Product(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: Product, data: dict) -> Product:
        for key, value in data.items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: Product) -> None:
        self.db.delete(obj)
        self.db.commit()
