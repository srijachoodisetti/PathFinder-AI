# Installation & Local Setup Guide

Follow these steps to configure and boot the PathFinder AI development environment.

---

## Prerequisites

*   Python 3.10+
*   Node.js 18+
*   Google Gemini API Key (Optional)

---

## 1. Backend Configuration

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the environment:
    *   **Windows**: `.\venv\Scripts\activate`
    *   **Mac/Linux**: `source venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Set up environment keys in a `.env` file inside `backend/`:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
6.  Seed the database:
    ```bash
    python seed_db.py
    ```
7.  Boot the FastAPI server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

---

## 2. Frontend Configuration

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the development node:
    ```bash
    npm run dev
    ```
4.  Access the platform at `http://localhost:5173`.
