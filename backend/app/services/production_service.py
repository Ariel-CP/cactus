from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.inventory import Ingredient, Product
from app.models.production import ProductionBatch, ProductionFormula
from app.schemas.production import BatchCreate, FormulaCreate


class ProductionService:
    def __init__(self, db: Session) -> None:
        self.db = db

    # ── Formulas ──────────────────────────────────────────

    def get_formula(self, product_id: int) -> list[ProductionFormula]:
        return list(
            self.db.scalars(
                select(ProductionFormula).where(
                    ProductionFormula.product_id == product_id
                )
            )
        )

    def save_formula(self, payload: FormulaCreate) -> list[ProductionFormula]:
        self._assert_product(payload.product_id)

        # Replace existing formula lines for this product
        self.db.execute(
            delete(ProductionFormula).where(
                ProductionFormula.product_id == payload.product_id
            )
        )

        lines = []
        for line in payload.lines:
            self._assert_ingredient(line.ingredient_id)
            formula = ProductionFormula(
                product_id=payload.product_id,
                ingredient_id=line.ingredient_id,
                quantity=line.quantity,
            )
            self.db.add(formula)
            lines.append(formula)

        self.db.commit()
        for ln in lines:
            self.db.refresh(ln)
        return lines

    # ── Batches ───────────────────────────────────────────

    def list_batches(
        self, product_id: int | None = None
    ) -> list[ProductionBatch]:
        stmt = select(ProductionBatch).order_by(
            ProductionBatch.produced_at.desc()
        )
        if product_id is not None:
            stmt = stmt.where(ProductionBatch.product_id == product_id)
        return list(self.db.scalars(stmt))

    def register_batch(
        self, payload: BatchCreate, user_id: int | None = None
    ) -> ProductionBatch:
        product = self._assert_product(payload.product_id)
        formula = self.get_formula(payload.product_id)

        if not formula:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Product has no formula defined",
            )

        # Verify and deduct ingredient stock
        for line in formula:
            needed = float(line.quantity) * payload.quantity_produced
            ing = self.db.scalar(
                select(Ingredient).where(Ingredient.id == line.ingredient_id)
            )
            if ing is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingredient {line.ingredient_id} not found",
                )
            if float(ing.stock) < needed:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Insufficient stock for ingredient '{ing.name}': "
                        f"need {needed}, have {ing.stock}"
                    ),
                )
            ing.stock = float(ing.stock) - needed

        # Add to product stock
        product.stock = float(product.stock) + payload.quantity_produced

        batch = ProductionBatch(
            product_id=payload.product_id,
            quantity_produced=payload.quantity_produced,
            notes=payload.notes,
            created_by_id=user_id,
        )
        self.db.add(batch)
        self.db.commit()
        self.db.refresh(batch)
        return batch

    # ── Helpers ───────────────────────────────────────────

    def _assert_product(self, product_id: int) -> Product:
        product = self.db.scalar(
            select(Product).where(Product.id == product_id)
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found",
            )
        return product

    def _assert_ingredient(self, ingredient_id: int) -> Ingredient:
        ing = self.db.scalar(
            select(Ingredient).where(Ingredient.id == ingredient_id)
        )
        if not ing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingredient {ingredient_id} not found",
            )
        return ing
