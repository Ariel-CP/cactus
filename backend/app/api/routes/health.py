import os
import threading

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_admin
from app.core.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/db")
def healthcheck_db(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "reachable"}


@router.post("/admin/restart", dependencies=[Depends(get_current_admin)])
def restart_backend() -> dict[str, str]:
    """Reinicia el proceso del backend (Docker lo relanza automáticamente)."""
    threading.Timer(0.5, lambda: os._exit(0)).start()
    return {"status": "restarting"}
