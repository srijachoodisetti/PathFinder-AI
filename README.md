# PathFinder AI 🌱 - Personalized Learning for Every Child

**PathFinder AI** is an intelligent personalized learning platform designed to empower children, especially those in rural and underserved communities, with high-quality education. Built under the theme of **Sustainability & Social Impact**, it addresses UN Sustainable Development Goal 4 (Quality Education) by offering cutting-edge AI tutoring, voice interfaces, multilingual support, and offline-first functionalities.

---

## 🚀 Key Features

1.  **AI Conversational Tutor (Gemini 1.5 Flash):** Chat interface with step-by-step math and science problem explanations.
2.  **Homework scanner (OCR):** Upload base64 scans of handwritten workbook questions to let the AI solve them.
3.  **Offline-First Synchronizer:** Save lesson notes, flashcards, and quizzes offline. Answers are cached in LocalStorage and automatically synced when connection returns.
4.  **Vocal Progress Reports (Vernacular support):** Transcribes speech and translates performance reports into Hindi, Telugu, Tamil, Malayalam, Marathi, Bengali, and Kannada voice memos for parents.
5.  **Gamified Learning Streaks:** Earn experience points (XP) and unlock progress badges to maintain streaks.
6.  **Classroom Analytics:** Educator dashboards highlighting class averages, weak topics, and student drop-out alerts.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Claymorphic Theme), Zustand, Framer Motion, Recharts, Axios.
*   **Backend:** FastAPI, Python, SQLAlchemy, JWT Authentication, Pydantic.
*   **AI integrations:** Google Gemini SDK, Google Text-to-Speech free browser/API routing, Gemini Vision OCR.
*   **Deployment:** Docker, docker-compose, SQLite (development) / PostgreSQL (production compatibility).

---

## 📁 Directory Structure

```
/
├── docker-compose.yml       # Production services orchestrator
├── README.md                # General guidance
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Claymorphic cards, buttons, modals, input elements
│   │   │   ├── layout/      # Navbars, Sidebars
│   │   │   └── ai/          # OCR, Voice interactives
│   │   ├── store/           # authStore (Zustand), offlineStore
│   │   └── pages/           # Landing, Login, Student, Teacher, Parent, Admin dashboards
│   └── tailwind.config.js   # Premium Claymorphic shadows config
└── backend/
    ├── requirements.txt     # Python backend libraries
    ├── Dockerfile           # Backend container
    └── app/
        ├── main.py          # FastAPI application startup & seeder
        ├── core/            # Config, Security, Database
        ├── services/        # Gemini, Speech, OCR logic
        └── routers/         # Endpoint paths
```

---

## 📦 Installation & Setup

### Option 1: Run Frontend & Backend Concurrently (Quick Start)

To start both servers with a single command (which also checks for virtual environments and automatically installs any missing dependencies):

Run this command in the project root directory:
```bash
python run.py
```

Or, if you prefer using npm:
```bash
npm run dev
```

Both the backend (FastAPI at `http://localhost:8000`) and frontend (Vite at `http://localhost:5173`) will start up concurrently. Press `Ctrl+C` in the terminal to stop both services cleanly.

---

### Option 2: Run Locally (Manual setup)

If you prefer to run the services in separate terminal windows:

#### 1. Setup Backend
1.  Navigate to the backend:
    ```bash
    cd backend
    ```
2.  Create virtual environment & install requirements:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  Run the FastAPI application (Uvicorn):
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will start at `http://localhost:8000`. It automatically seeds a default set of mock users and courses at first run.

#### 2. Setup Frontend
1.  Navigate to the frontend:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Launch Vite dev server:
    ```bash
    npm run dev
    ```
    Open your browser at the displayed port (usually `http://localhost:5173`).

---

### Option 2: Run via Docker (Zero Configuration)

Build and run both the database and the backend app under a shared network:
```bash
docker-compose up --build
```
*   FastAPI backend is exposed on port `8000`.
*   PostgreSQL database runs on port `5432`.

---

## 🧪 Testing Guide

We have integrated testing capabilities:
1.  **Backend unit tests:**
    ```bash
    cd backend
    pytest
    ```
2.  **Frontend production validation:**
    ```bash
    cd frontend
    npm run build
    ```

---

## 🔑 Environment Variables

Create a `.env` file in the root or set inside `docker-compose.yml`:
*   `GEMINI_API_KEY`: Official Google Gemini API Key. (If empty, the system runs a premium educational simulator so the application remains 100% functional out-of-the-box for hackathon reviews).
*   `DATABASE_URL`: PostgreSQL connection string (defaults to `sqlite:///./pathfinder.db` if empty).
*   `SECRET_KEY`: Custom string used for hashing JWT tokens.
