from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory import Product
from app.models.sales import Customer, Sale, SaleItem
from app.schemas.sales import CustomerCreate, CustomerUpdate, SaleCreate


class CustomerService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Customer]:
        return list(
            self.db.scalars(select(Customer).order_by(Customer.name))
        )

    def get_or_404(self, customer_id: int) -> Customer:
        obj = self.db.scalar(
            select(Customer).where(Customer.id == customer_id)
        )
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found",
            )
        return obj

    def create(self, payload: CustomerCreate) -> Customer:
        customer = Customer(**payload.model_dump())
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update(self, customer_id: int, payload: CustomerUpdate) -> Customer:
        obj = self.get_or_404(customer_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, customer_id: int) -> None:
        obj = self.get_or_404(customer_id)
        self.db.delete(obj)
        self.db.commit()


class SaleService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, customer_id: int | None = None) -> list[Sale]:
        stmt = select(Sale).order_by(Sale.sold_at.desc())
        if customer_id is not None:
            stmt = stmt.where(Sale.customer_id == customer_id)
        return list(self.db.scalars(stmt))

    def get_or_404(self, sale_id: int) -> Sale:
        obj = self.db.scalar(
            select(Sale).where(Sale.id == sale_id)
        )
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sale not found",
            )
        return obj

    def create(
        self, payload: SaleCreate, user_id: int | None = None
    ) -> Sale:
        total = 0.0
        item_objs = []

        for item in payload.items:
            product = self.db.scalar(
                select(Product).where(Product.id == item.product_id)
            )
            if product is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found",
                )
            if float(product.stock) < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Insufficient stock for '{product.name}': "
                        f"need {item.quantity}, have {product.stock}"
                    ),
                )
            product.stock = float(product.stock) - item.quantity
            subtotal = item.quantity * item.unit_price
            total += subtotal
            item_objs.append(
                SaleItem(
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                )
            )

        sale = Sale(
            customer_id=payload.customer_id,
            payment_method=payload.payment_method,
            notes=payload.notes,
            total=total,
            created_by_id=user_id,
            items=item_objs,
        )
        self.db.add(sale)

        # Update customer balance for credit sales
        if payload.payment_method == "credit" and payload.customer_id:
            customer = self.db.scalar(
                select(Customer).where(Customer.id == payload.customer_id)
            )
            if customer:
                customer.balance = float(customer.balance) + total

        self.db.commit()
        self.db.refresh(sale)
        return sale
