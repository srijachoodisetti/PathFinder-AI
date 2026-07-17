# PathFinder AI: Personalized Engineering Learning Ecosystem

PathFinder AI is an enterprise-grade, PWA-enabled, AI-powered learning and assessment platform built for engineering students, faculty, and administrative staff. It optimizes university curriculum navigation, suggests industry certifications, auto-grades coding and descriptive exams, and fosters collaborative community learning workspaces.

---

## Technical Stack

*   **Frontend**: React 19, TypeScript, Recharts (analytics dashboards), Tailwind CSS, Lucide icons, PWA manifest triggers.
*   **Backend**: FastAPI, SQLAlchemy, Pydantic data schemas, Uvicorn server nodes.
*   **AI Models**: Google Gemini 1.5 API wrappers (notes synthesis, exam graders, mock interview dialogue simulators, Mermaid.js software architecture draft engines).
*   **Database**: SQLite (Local development), PostgreSQL compatible.
*   **Authentication**: Firebase Admin Authentication.

---

## Repository Structure

```
├── backend/                  # FastAPI backend server
│   ├── app/
│   │   ├── core/             # Database session configurations
│   │   ├── models/           # SQLAlchemy schemas (personalization, community, exams)
│   │   ├── routers/          # API endpoints controllers
│   │   └── schemas/          # Pydantic validation types
│   ├── seed_db.py            # SQLite database seeder
│   └── requirements.txt      # Python dependencies list
└── frontend/                 # React frontend application
    ├── public/               # manifest.json PWA triggers
    ├── src/
    │   ├── components/       # Claymorphic UI widgets and layouts
    │   ├── pages/            # Core views (dashboards, forum, exam centers)
    │   └── store/            # Zustand global stores (auth, offline state)
```

---

## Platform Core Modules

1.  **Academic Learning**: Select branch, semester, browse notes, formulas, and generate AI mind maps.
2.  **Assessment Center**: Take MCQ, descriptive, or coding mock exams with countdown timers and AI graders.
3.  **Campus Forum**: Community boards supporting likes, upvotes, pins, and **Ask AI Doubt** drawers.
4.  **Projects Board**: Coordinate repository task boards via Kanban layouts.
5.  **AI Career Mentor**: Explores skill gaps and suggests course roadmaps.
6.  **Career Success Hub**: Upload resume for SkillBridge AI ATS scoring, receive Gemini-powered improvement tips, generate semester-wise career roadmaps, and practice with role-specific AI interview questions.
7.  **Placement Prep**: DSA sheets, mock interviews, aptitude practice, and company-wise questions.
8.  **Collaboration & Community**: Study groups, project boards, discussion forums, and resource sharing.
9.  **AI Personalization Engine**: Tracks weak topics, recommends next study steps based on CGPA, attendance, and quiz history.
10. **Admin Telemetry**: Monitors response logs, server memory loads, and active accounts.
