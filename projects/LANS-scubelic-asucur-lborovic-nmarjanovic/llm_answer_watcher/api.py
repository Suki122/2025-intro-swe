from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, ValidationError
import yaml
import os
from sqlalchemy.orm import Session
import logging
from datetime import timedelta

from llm_answer_watcher.storage.db import (
    init_db_if_needed,
    SessionLocal,
    create_user,
    get_user_by_email,
    update_user_api_keys,
)
from llm_answer_watcher.config.schema import (
    WatcherConfig,
    RuntimeConfig,
    RuntimeModel,
)
from llm_answer_watcher.llm_runner.runner import run_all
from llm_answer_watcher.system_prompts import get_provider_default
from llm_answer_watcher.auth_schemas import UserCreate, UserLogin, User, Token
from llm_answer_watcher.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

logger = logging.getLogger(__name__)

app = FastAPI(title="LLM Answer Watcher API", version="0.2.0")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db_if_needed()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


class ConfigData(BaseModel):
    api_keys: dict[str, str]
    yaml_config: str


class ApiKeyData(BaseModel):
    google_api_key: str | None = None
    groq_api_key: str | None = None


def build_runtime_config_from_dict(raw_config: dict, api_keys: dict[str, str]) -> RuntimeConfig:
    """
    Build a RuntimeConfig from a parsed YAML dict and API key.

    This is similar to load_config() but works from an in-memory dict
    instead of a file, and takes the API key directly.
    """
    # Validate with WatcherConfig first
    try:
        watcher_config = WatcherConfig.model_validate(raw_config)
    except ValidationError as e:
        error_messages = []
        for error in e.errors():
            loc = ".".join(str(x) for x in error["loc"])
            msg = error["msg"]
            error_messages.append(f"  - {loc}: {msg}")
        raise ValueError(
            "Configuration validation failed:\n" + "\n".join(error_messages)
        )

    # Build resolved models with the provided API key
    resolved_models = []
    for model_config in watcher_config.run_settings.models:
        # Get system prompt
        try:
            prompt_obj = get_provider_default(model_config.provider)
            system_prompt_text = prompt_obj.prompt
        except Exception:
            system_prompt_text = "You are a helpful AI assistant."
        
        api_key = api_keys.get(model_config.provider)
        if not api_key:
            raise ValueError(f"API key for provider '{model_config.provider}' not found.")

        runtime_model = RuntimeModel(
            provider=model_config.provider,
            model_name=model_config.model_name,
            api_key=api_key,
            system_prompt=system_prompt_text,
            tools=model_config.tools,
            tool_choice=model_config.tool_choice,
        )
        resolved_models.append(runtime_model)

    # Build RuntimeConfig
    return RuntimeConfig(
        run_settings=watcher_config.run_settings,
        extraction_settings=None,  # Simplified - no extraction settings for now
        brands=watcher_config.brands,
        intents=watcher_config.intents,
        models=resolved_models,
        operation_models=[],
        runner_configs=None,
        global_operations=[],
    )


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = get_password_hash(user.password)
        new_user = create_user(db, email=user.email, hashed_password=hashed_password)
        return new_user
    except Exception as e:
        logger.error(f"Error during user registration: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/users/me/api_keys")
async def store_api_keys_for_user(
    api_key_data: ApiKeyData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_user_api_keys(db, user_id=current_user.id, google_api_key=api_key_data.google_api_key, groq_api_key=api_key_data.groq_api_key)
    return {"message": "API keys updated successfully"}


@app.post("/run_watcher")
async def run_watcher(config_data: ConfigData):
    try:
        # Build RuntimeConfig from the provided data
        runtime_config = build_runtime_config_from_dict(
            yaml.safe_load(config_data.yaml_config),
            config_data.api_keys,
        )

        # Run the watcher and get the run_id
        run_all_result = await run_all(runtime_config)
        run_id_string = run_all_result["run_id"]
        return {"run_id": run_id_string}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error running watcher: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/results/{run_id}")
async def get_results(run_id: str):
    # This is a placeholder. In a real application, you would fetch
    # results from a database or storage based on the run_id.
    # For now, let's assume run_all already writes results to a known location
    # and we can simply return a dummy success message.
    # The frontend is expecting some data structure from run_all.
    # For now, return a placeholder.
    return {"run_id": run_id, "status": "completed", "intents_data": []} # TODO: Fetch real results


@app.get("/")
def read_root():
    return {"message": "LLM Answer Watcher API", "version": "0.2.0"}



