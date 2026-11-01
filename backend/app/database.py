import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("relieflink.database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = settings.DATABASE_URL
active_engine_url = DATABASE_URL
is_sqlite = False

# Ensure postgresql:// uses psycopg2 driver explicitly if not specified
if DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

try:
    if "postgresql" in DATABASE_URL:
        # Test connecting to PostgreSQL with a short timeout
        test_engine = create_engine(
            DATABASE_URL,
            connect_args={"connect_timeout": 3},
            pool_pre_ping=True
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        active_engine_url = DATABASE_URL
        logger.info(f"Connected to PostgreSQL database: {DATABASE_URL.split('@')[-1]}")
    else:
        engine = create_engine(DATABASE_URL)
except Exception as e:
    if settings.USE_SQLITE_FALLBACK:
        sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "relieflink.db")
        active_engine_url = f"sqlite:///{sqlite_path}"
        engine = create_engine(
            active_engine_url,
            connect_args={"check_same_thread": False}
        )
        is_sqlite = True
        logger.warning(
            f"PostgreSQL connection failed ({e}). "
            f"Seamlessly using local SQLite persistence: {sqlite_path}. "
            f"Set DATABASE_URL in backend/.env once PostgreSQL relieflink database is ready."
        )
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
