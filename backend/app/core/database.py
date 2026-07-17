from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Render provides DATABASE_URL starting with "postgres://" but SQLAlchemy 2.x requires "postgresql://"
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLite connection requires special thread handling
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# pool_pre_ping prevents stale connections on Render PostgreSQL (which idle-disconnects)
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,   # Recycle connections every 5 minutes
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
