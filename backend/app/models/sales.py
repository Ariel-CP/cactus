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


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(150), nullable=False, index=True
    )
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    balance: Mapped[float] = mapped_column(
        Numeric(14, 4), default=0, nullable=False,
        comment="saldo cuenta corriente (positivo = debe)"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    sales: Mapped[list["Sale"]] = relationship(back_populates="customer")


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    payment_method: Mapped[str] = mapped_column(
        String(30), nullable=False, default="cash",
        comment="cash | transfer | credit"
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    total: Mapped[float] = mapped_column(
        Numeric(14, 4), default=0, nullable=False
    )
    sold_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    customer: Mapped["Customer | None"] = relationship(
        back_populates="sales"
    )
    items: Mapped[list["SaleItem"]] = relationship(
        back_populates="sale", cascade="all, delete-orphan"
    )


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sale_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sales.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False
    )
    unit_price: Mapped[float] = mapped_column(
        Numeric(12, 4), nullable=False
    )

    sale: Mapped["Sale"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(  # noqa: F821
        foreign_keys=[product_id]
    )
