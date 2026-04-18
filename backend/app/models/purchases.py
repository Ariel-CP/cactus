from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    supplier: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    total: Mapped[float] = mapped_column(
        Numeric(14, 4), default=0, nullable=False
    )
    purchased_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    items: Mapped[list["PurchaseItem"]] = relationship(
        back_populates="purchase", cascade="all, delete-orphan"
    )


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    purchase_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ingredient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ingredients.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False
    )
    unit_cost: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False
    )

    purchase: Mapped["Purchase"] = relationship(back_populates="items")
    ingredient: Mapped["Ingredient"] = relationship(  # noqa: F821
        foreign_keys=[ingredient_id]
    )
