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


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    kind: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="ingredient | product | both",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    ingredients: Mapped[list["Ingredient"]] = relationship(
        back_populates="category"
    )
    products: Mapped[list["Product"]] = relationship(
        back_populates="category"
    )


class Ingredient(Base):
    """Insumo / materia prima."""

    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(150), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    unit: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="ml, g, kg, l, u"
    )
    stock: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    min_stock: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    cost_per_unit: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    category_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category: Mapped["Category | None"] = relationship(
        back_populates="ingredients"
    )


class Product(Base):
    """Producto terminado listo para la venta."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(150), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sku: Mapped[str | None] = mapped_column(
        String(60), unique=True, nullable=True
    )
    unit: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="u, ml, g"
    )
    stock: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    min_stock: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    sale_price: Mapped[float] = mapped_column(
        Numeric(12, 4), default=0, nullable=False
    )
    category_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category: Mapped["Category | None"] = relationship(
        back_populates="products"
    )
