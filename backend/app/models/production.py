from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProductionFormula(Base):
    """Una linea de receta: cuanto insumo usa un producto."""

    __tablename__ = "production_formulas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ingredient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ingredients.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False, comment="qty por unidad producida"
    )

    product: Mapped["Product"] = relationship(  # noqa: F821
        foreign_keys=[product_id]
    )
    ingredient: Mapped["Ingredient"] = relationship(  # noqa: F821
        foreign_keys=[ingredient_id]
    )


class ProductionBatch(Base):
    """Registro de una produccion realizada."""

    __tablename__ = "production_batches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity_produced: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    produced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    created_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    product: Mapped["Product"] = relationship(  # noqa: F821
        foreign_keys=[product_id]
    )
