from typing import Literal

from pydantic import BaseModel, Field


class UserAdminCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=72)
    role: Literal["admin", "operator"] = "operator"


class UserAdminUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    password: str | None = Field(default=None, min_length=8, max_length=72)
    role: Literal["admin", "operator"] | None = None
    is_active: bool | None = None