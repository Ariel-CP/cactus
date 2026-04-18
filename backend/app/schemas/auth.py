from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=72)
    role: str = Field(default="operator", max_length=30)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
