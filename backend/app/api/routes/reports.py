from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.inventory import Ingredient, Product
from app.models.sales import Sale

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_user)],
)


class StockAlert(BaseModel):
    id: int
    name: str
    stock: float
    min_stock: float
    kind: str  # ingredient | product


class SalesSummary(BaseModel):
    period_start: date
    period_end: date
    total_sales: int
    total_revenue: float


class DashboardSummary(BaseModel):
    low_stock_ingredients: int
    low_stock_products: int
    sales_this_month: int
    revenue_this_month: float


@router.get("/low-stock", response_model=list[StockAlert])
def low_stock_alerts(db: Session = Depends(get_db)):
    alerts: list[StockAlert] = []

    for ing in db.scalars(
        select(Ingredient).where(Ingredient.stock < Ingredient.min_stock)
    ):
        alerts.append(
            StockAlert(
                id=ing.id,
                name=ing.name,
                stock=float(ing.stock),
                min_stock=float(ing.min_stock),
                kind="ingredient",
            )
        )

    for prod in db.scalars(
        select(Product).where(Product.stock < Product.min_stock)
    ):
        alerts.append(
            StockAlert(
                id=prod.id,
                name=prod.name,
                stock=float(prod.stock),
                min_stock=float(prod.min_stock),
                kind="product",
            )
        )

    return alerts


@router.get("/sales-summary", response_model=SalesSummary)
def sales_summary(
    start: date = Query(default=None),
    end: date = Query(default=None),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    period_start = start or date(now.year, now.month, 1)
    period_end = end or now.date()

    stmt = select(
        func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0)
    ).where(
        Sale.sold_at >= datetime(
            period_start.year, period_start.month, period_start.day,
            tzinfo=timezone.utc,
        ),
        Sale.sold_at
        <= datetime(
            period_end.year, period_end.month, period_end.day,
            23, 59, 59,
            tzinfo=timezone.utc,
        ),
    )
    count, revenue = db.execute(stmt).one()

    return SalesSummary(
        period_start=period_start,
        period_end=period_end,
        total_sales=count,
        total_revenue=float(revenue),
    )


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    low_ing = db.scalar(
        select(func.count(Ingredient.id)).where(
            Ingredient.stock < Ingredient.min_stock
        )
    )
    low_prod = db.scalar(
        select(func.count(Product.id)).where(
            Product.stock < Product.min_stock
        )
    )
    sales_month = db.scalar(
        select(func.count(Sale.id)).where(Sale.sold_at >= month_start)
    )
    revenue_month = db.scalar(
        select(func.coalesce(func.sum(Sale.total), 0)).where(
            Sale.sold_at >= month_start
        )
    )

    return DashboardSummary(
        low_stock_ingredients=low_ing or 0,
        low_stock_products=low_prod or 0,
        sales_this_month=sales_month or 0,
        revenue_this_month=float(revenue_month or 0),
    )
