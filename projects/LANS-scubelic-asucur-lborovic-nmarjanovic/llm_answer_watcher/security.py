from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt # Import bcrypt directly

# Remove passlib.context and pwd_context

SECRET_KEY = "your-secret-key"  # Change this to a secure, randomly generated key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    # bcrypt.checkpw expects bytes for both password and hash
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    print(f"Password length: {len(password)}")
    # Generate a salt and hash the password
    # password needs to be bytes, truncated to 72 bytes
    hashed = bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt())
    return hashed.decode('utf-8') # Store as string



def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
