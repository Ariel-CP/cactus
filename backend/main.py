from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.production import router as production_router
from app.api.routes.purchases import router as purchases_router
from app.api.routes.reports import router as reports_router
from app.api.routes.sales import router as sales_router
from app.core.config import settings
from app.core.database import Base, engine

app = FastAPI(
    title="Cactus API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(production_router, prefix="/api")
app.include_router(sales_router, prefix="/api")
app.include_router(purchases_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    # Temporary auto-create for MVP bootstrap before Alembic integration.
    from app import models as _models  # noqa: F401

    Base.metadata.create_all(bind=engine)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"Cactus API online in {settings.environment} mode"}
