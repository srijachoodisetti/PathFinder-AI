# Production Deployment Guide

Details for deploying the PathFinder AI ecosystem to cloud nodes.

---

## 1. Backend Deployment (e.g. Render / Heroku / AWS EC2)

1.  **Configure environment variables**:
    *   `DATABASE_URL`: Set to your production PostgreSQL connection string.
    *   `GEMINI_API_KEY`: Google AI credentials.
2.  **Uvicorn entry point**:
    Configure web nodes to execute:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
    ```
3.  **Database Migrations**:
    FastAPI automatically handles initial table setup via `Base.metadata.create_all(bind=engine)` at startup.

---

## 2. Frontend Deployment (e.g. Vercel / Netlify)

1.  **Build compilation**:
    Compile static distribution bundle:
    ```bash
    npm run build
    ```
2.  **Output target**:
    Route all sub-page URLs back to `dist/index.html` to allow React Router Single Page Application execution.
3.  **CORS constraints**:
    Ensure the frontend domain is added to `CORS_ORIGINS` configuration in backend settings.
