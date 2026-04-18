from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory import Ingredient
from app.models.purchases import Purchase, PurchaseItem
from app.schemas.purchases import PurchaseCreate


class PurchaseService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Purchase]:
        return list(
            self.db.scalars(
                select(Purchase).order_by(Purchase.purchased_at.desc())
            )
        )

    def get_or_404(self, purchase_id: int) -> Purchase:
        obj = self.db.scalar(
            select(Purchase).where(Purchase.id == purchase_id)
        )
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found",
            )
        return obj

    def create(
        self, payload: PurchaseCreate, user_id: int | None = None
    ) -> Purchase:
        total = 0.0
        item_objs = []

        for item in payload.items:
            ing = self.db.scalar(
                select(Ingredient).where(Ingredient.id == item.ingredient_id)
            )
            if ing is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingredient {item.ingredient_id} not found",
                )

            # Weighted average cost
            current_stock = float(ing.stock)
            current_cost = float(ing.cost_per_unit)
            new_qty = item.quantity
            new_cost = item.unit_cost

            if current_stock + new_qty > 0:
                avg = (
                    current_stock * current_cost + new_qty * new_cost
                ) / (current_stock + new_qty)
                ing.cost_per_unit = avg

            ing.stock = current_stock + new_qty
            subtotal = new_qty * new_cost
            total += subtotal

            item_objs.append(
                PurchaseItem(
                    ingredient_id=item.ingredient_id,
                    quantity=new_qty,
                    unit_cost=new_cost,
                )
            )

        purchase = Purchase(
            supplier=payload.supplier,
            notes=payload.notes,
            total=total,
            created_by_id=user_id,
            items=item_objs,
        )
        self.db.add(purchase)
        self.db.commit()
        self.db.refresh(purchase)
        return purchase
