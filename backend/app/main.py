"""
PathFinder AI — FastAPI Application
Single Render Web Service: serves both API (under /api/v1/*) and React SPA (everything else).
"""
import os
import time
import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.routers import (
    auth, tutor, course, quiz, student, teacher, parent, admin,
    engineering, ai_features, personalization, assessment, community, career
)
from app.models.user import User, Student
from app.models.course import Course, Lesson
from app.models.quiz import Quiz
from app.core.security import get_password_hash

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if settings.PRODUCTION else logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("pathfinder")

# ── Static files path (React build output) ────────────────────────────────
# When running from repo root (production/Render): frontend/dist
# When running from backend/ (local uvicorn): ../frontend/dist
_HERE = Path(__file__).resolve().parent.parent  # backend/
_FRONTEND_DIST = _HERE.parent / "frontend" / "dist"


# ── Database seed ─────────────────────────────────────────────────────────
def _seed_database():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            logger.info("Seeding database with default users...")

            admin_user = User(
                email="admin@pathfinder.com",
                hashed_password=get_password_hash("admin123"),
                full_name="PathFinder Admin",
                role="admin",
            )
            db.add(admin_user)

            student_user = User(
                email="student@pathfinder.com",
                hashed_password=get_password_hash("student123"),
                full_name="Student User",
                role="student",
            )
            db.add(student_user)
            db.commit()

            student_profile = Student(
                user_id=student_user.id,
                year="2nd Year",
                learning_goals="Learn basic maths and science concepts, improve logic",
                xp_points=240,
                streak=4,
                weak_topics="Fraction Division, Soil Nutrients",
                language_preference="Hindi",
            )
            db.add(student_profile)

            teacher_user = User(
                email="teacher@pathfinder.com",
                hashed_password=get_password_hash("teacher123"),
                full_name="Teacher User",
                role="teacher",
            )
            db.add(teacher_user)
            db.commit()

            from app.models.user import Teacher
            t_profile = Teacher(
                user_id=teacher_user.id,
                subject_specialization="Science & Mathematics",
                years_managed="1st Year, 2nd Year, 3rd Year",
            )
            db.add(t_profile)

            parent_user = User(
                email="parent@pathfinder.com",
                hashed_password=get_password_hash("parent123"),
                full_name="Parent User",
                role="parent",
            )
            db.add(parent_user)
            db.commit()

            from app.models.user import Parent
            p_profile = Parent(
                user_id=parent_user.id,
                child_email="student@pathfinder.com",
            )
            db.add(p_profile)
            db.commit()

        if db.query(Course).count() == 0:
            logger.info("Seeding default courses...")
            c1 = Course(
                title="Introduction to Fractions & Ratios",
                description="Master the concepts of fractional parts, denominators, simplifying fractions, and basic ratios.",
                subject="Mathematics",
                year="2nd Year",
            )
            db.add(c1)
            db.commit()

            l1 = Lesson(
                course_id=c1.id,
                title="Understanding Fraction Parts",
                content_markdown="# Fractions\nFractions represent equal parts of a whole.\n- **Numerator**: How many parts we have.\n- **Denominator**: How many equal parts the whole is divided into.",
                video_url="https://www.youtube.com/embed/n0FZhQ_GkKw",
                sort_order=1,
            )
            db.add(l1)

            c2 = Course(
                title="Solar Energy and Sustainability",
                description="Learn about the environment, greenhouse gases, solar power, and how we protect ecosystems.",
                subject="Science",
                year="2nd Year",
            )
            db.add(c2)
            db.commit()

            l2 = Lesson(
                course_id=c2.id,
                title="What is Solar Energy?",
                content_markdown="# Solar Energy\nSolar energy is radiant light and heat from the Sun.\n- **Renewable**: The sun shines for billions of years.\n- **Clean**: No harmful smoke.",
                video_url="https://www.youtube.com/embed/1kUE0BZtTRc",
                sort_order=1,
            )
            db.add(l2)

            q1 = Quiz(
                title="Fractions Challenge 1",
                course_id=c1.id,
                lesson_id=l1.id,
                questions_json=json.dumps([
                    {"id": "q1", "type": "mcq",
                     "question_text": "What does the denominator represent?",
                     "options": ["Parts we have", "Total equal parts in the whole", "Sum of numbers", "A decimal"],
                     "correct_answer": "Total equal parts in the whole",
                     "explanation": "The denominator (bottom) is total parts the whole is divided into."},
                    {"id": "q2", "type": "true_false",
                     "question_text": "In 2/3, 2 is the numerator.",
                     "options": ["True", "False"],
                     "correct_answer": "True",
                     "explanation": "The top number is the numerator."},
                ]),
                xp_reward=50,
            )
            db.add(q1)
            db.commit()
            logger.info("Database seeded successfully.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


# ── Lifespan (replaces @app.on_event) ────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("PathFinder AI starting up...")
    Base.metadata.create_all(bind=engine)
    _seed_database()
    logger.info(f"Frontend dist exists: {_FRONTEND_DIST.exists()} ({_FRONTEND_DIST})")
    yield
    # Shutdown
    logger.info("PathFinder AI shutting down gracefully.")


# ── Application factory ───────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# ── Exception Handlers ───────────────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Log 404 (Not Found) and 405 (Method Not Allowed) as INFO rather than ERROR to avoid health check noise
    if exc.status_code in (404, 405):
        logger.info(f"HTTP {exc.status_code}: {exc.detail} on {request.method} {request.url.path}")
    else:
        logger.error(f"HTTP error occurred: {exc.detail} (status code: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    message = "Internal Server Error" if settings.PRODUCTION else str(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": message},
    )

# ── Middleware stack (order matters — outermost first) ────────────────────

# 1. Trusted Hosts
if settings.ALLOWED_HOSTS and settings.ALLOWED_HOSTS != ["*"]:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# 2. GZip compression for all responses > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. CORS — allow all origins when CORS_ORIGINS contains "*", otherwise restrict
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate Limiting + Security Headers middleware ───────────────────────────
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 200  # Raised for single-service (covers static + API)
_ip_history: dict = {}

STATIC_EXTENSIONS = {
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map",
    ".webp", ".json", ".txt", ".xml",
}

@app.middleware("http")
async def security_rate_limit_cache_middleware(request: Request, call_next):
    path = request.url.path

    # Skip rate limiting for static assets
    is_static = any(path.endswith(ext) for ext in STATIC_EXTENSIONS)

    if not is_static:
        client_ip = (request.client.host if request.client else "unknown")
        now = time.time()
        _ip_history.setdefault(client_ip, [])
        _ip_history[client_ip] = [t for t in _ip_history[client_ip] if now - t < RATE_LIMIT_WINDOW]

        if len(_ip_history[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
            )
        _ip_history[client_ip].append(now)

    response: Response = await call_next(request)

    # Security headers for API responses
    if path.startswith("/api"):
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # Cache-control for static assets
    if is_static and path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif is_static:
        response.headers["Cache-Control"] = "public, max-age=86400"

    return response


# ── API Routers (all under /api/v1/) ─────────────────────────────────────
app.include_router(auth.router,            prefix=f"{settings.API_V1_STR}/auth",            tags=["auth"])
app.include_router(tutor.router,           prefix=f"{settings.API_V1_STR}/tutor",           tags=["tutor"])
app.include_router(course.router,          prefix=f"{settings.API_V1_STR}/courses",         tags=["courses"])
app.include_router(quiz.router,            prefix=f"{settings.API_V1_STR}/quizzes",         tags=["quizzes"])
app.include_router(student.router,         prefix=f"{settings.API_V1_STR}/student",         tags=["student"])
app.include_router(teacher.router,         prefix=f"{settings.API_V1_STR}/teacher",         tags=["teacher"])
app.include_router(parent.router,          prefix=f"{settings.API_V1_STR}/parent",          tags=["parent"])
app.include_router(admin.router,           prefix=f"{settings.API_V1_STR}/admin",           tags=["admin"])
app.include_router(engineering.router,     prefix=f"{settings.API_V1_STR}/engineering",     tags=["engineering"])
app.include_router(ai_features.router,     prefix=f"{settings.API_V1_STR}/ai",              tags=["ai"])
app.include_router(personalization.router, prefix=f"{settings.API_V1_STR}/personalization", tags=["personalization"])
app.include_router(assessment.router,      prefix=f"{settings.API_V1_STR}/assessment",      tags=["assessment"])
app.include_router(community.router,       prefix=f"{settings.API_V1_STR}/community",       tags=["community"])
app.include_router(career.router,          prefix=f"{settings.API_V1_STR}/career",          tags=["career"])

# ── Health check (before SPA catch-all) ──────────────────────────────────
@app.get("/health", tags=["system"])
def health_check():
    return {"status": "healthy", "service": "PathFinder AI", "version": "2.0.0"}

@app.get("/api", tags=["system"])
def api_root():
    return {
        "status": "online",
        "project": "PathFinder AI",
        "api_version": settings.API_V1_STR,
        "docs": f"{settings.API_V1_STR}/docs",
    }


# Verify frontend dist exists in production/Render mode
if settings.PRODUCTION or os.environ.get("RENDER"):
    if not _FRONTEND_DIST.exists() or not (_FRONTEND_DIST / "index.html").exists():
        logger.error(
            f"❌ CRITICAL ERROR: Frontend build output 'dist/index.html' is missing at {_FRONTEND_DIST}!"
        )
        raise RuntimeError(
            f"Frontend build output 'dist/index.html' is missing at {_FRONTEND_DIST} in production mode! "
            "Please ensure that the build command compiles the React frontend successfully."
        )

# ── Route for Root `/` (Supports GET and HEAD) ───────────────────────────
@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_root(request: Request):
    index_file = _FRONTEND_DIST / "index.html"
    if not index_file.exists():
        if settings.PRODUCTION or os.environ.get("RENDER"):
            return JSONResponse(
                status_code=503,
                content={"detail": "Production Frontend build not found."}
            )
        if request.method == "HEAD":
            return Response(status_code=200, media_type="application/json")
        return JSONResponse(
            status_code=200,
            content={
                "status": "api-only",
                "message": "Frontend not built. API is available at /api/v1/",
                "docs": f"{settings.API_V1_STR}/docs",
            }
        )
    if request.method == "HEAD":
        return Response(status_code=200, media_type="text/html")
    return FileResponse(str(index_file), media_type="text/html")


# ── Mount React Static Assets ─────────────────────────────────────────────
# Mount /assets BEFORE the SPA catch-all so Vite's hashed files are served correctly
if _FRONTEND_DIST.exists():
    _assets_dir = _FRONTEND_DIST / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    # ── SPA Catch-All: unknown paths → index.html ─────────────────────────
    # This MUST be the last route so it doesn't intercept /api/* routes
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_react_spa(full_path: str, request: Request):
        # Never intercept API calls — return 404 JSON instead
        clean_path = full_path.strip("/")
        if (clean_path.startswith("api") or
            clean_path.startswith("docs") or
            clean_path.startswith("redoc") or
            clean_path.startswith("openapi.json")):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})

        # Check if the requested path corresponds to an actual file in dist (e.g. manifest.json, favicon.svg)
        target_file = _FRONTEND_DIST / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))

        index_file = _FRONTEND_DIST / "index.html"
        if index_file.exists():
            if request.method == "HEAD":
                return Response(status_code=200, media_type="text/html")
            return FileResponse(str(index_file), media_type="text/html")

        return JSONResponse(
            status_code=503,
            content={
                "detail": "Frontend not built. Run: cd frontend && npm install && npm run build",
                "hint": "The React frontend needs to be compiled before FastAPI can serve it.",
            },
        )
else:
    logger.warning(
        f"[PathFinder AI] Frontend dist not found at {_FRONTEND_DIST}. "
        "API-only mode. Run 'cd frontend && npm install && npm run build' to enable the frontend."
    )
