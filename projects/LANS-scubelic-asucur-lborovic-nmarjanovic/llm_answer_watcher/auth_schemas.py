from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    google_api_key: str | None = None
    groq_api_key: str | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
