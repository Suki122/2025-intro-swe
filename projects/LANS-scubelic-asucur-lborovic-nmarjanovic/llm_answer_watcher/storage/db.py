from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from ..utils.time import utc_timestamp
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///./output/watcher.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    google_api_key = Column(String, nullable=True)
    groq_api_key = Column(String, nullable=True)

def init_db_if_needed():
    Base.metadata.create_all(bind=engine)

def create_user(db, email: str, hashed_password: str):
    db_user = User(email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db, email: str):
    return db.query(User).filter(User.email == email).first()

def update_user_api_keys(db, user_id: int, google_api_key: str | None = None, groq_api_key: str | None = None):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        if google_api_key:
            db_user.google_api_key = google_api_key
        if groq_api_key:
            db_user.groq_api_key = groq_api_key
        db.commit()
        db.refresh(db_user)
    return db_user
