from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.routers import auth, tutor, course, quiz, student, teacher, parent, admin, engineering, ai_features, personalization, assessment, community, career
from app.models.user import User, Student
from app.models.course import Course, Lesson
from app.models.quiz import Quiz
from app.core.security import get_password_hash
import json

# Auto create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
from fastapi import Request, Response
from fastapi.responses import JSONResponse

# Simple token bucket in-memory rate limiter
RATE_LIMIT_WINDOW = 60 # seconds
MAX_REQUESTS_PER_WINDOW = 100
ip_request_history = {} # ip -> list of timestamps

@app.middleware("http")
async def security_and_rate_limiting_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # 1. Clean history
    if client_ip not in ip_request_history:
        ip_request_history[client_ip] = []
    
    # Keep only timestamps in current window
    ip_request_history[client_ip] = [
        t for t in ip_request_history[client_ip]
        if current_time - t < RATE_LIMIT_WINDOW
    ]
    
    # 2. Check limit
    if len(ip_request_history[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
        
    ip_request_history[client_ip].append(current_time)
    
    # 3. Process Request
    response: Response = await call_next(request)
    
    # 4. Append Security Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    
    return response

# Register routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(tutor.router, prefix=f"{settings.API_V1_STR}/tutor", tags=["tutor"])
app.include_router(course.router, prefix=f"{settings.API_V1_STR}/courses", tags=["courses"])
app.include_router(quiz.router, prefix=f"{settings.API_V1_STR}/quizzes", tags=["quizzes"])
app.include_router(student.router, prefix=f"{settings.API_V1_STR}/student", tags=["student"])
app.include_router(teacher.router, prefix=f"{settings.API_V1_STR}/teacher", tags=["teacher"])
app.include_router(parent.router, prefix=f"{settings.API_V1_STR}/parent", tags=["parent"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(engineering.router, prefix=f"{settings.API_V1_STR}/engineering", tags=["engineering"])
app.include_router(ai_features.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(personalization.router, prefix=f"{settings.API_V1_STR}/personalization", tags=["personalization"])
app.include_router(assessment.router, prefix=f"{settings.API_V1_STR}/assessment", tags=["assessment"])
app.include_router(community.router, prefix=f"{settings.API_V1_STR}/community", tags=["community"])
app.include_router(career.router, prefix=f"{settings.API_V1_STR}/career", tags=["career"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "PathFinder AI",
        "description": "Personalized Learning Platform for underserved communities."
    }

# Startup database seeder
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed users if not exists
        if db.query(User).count() == 0:
            print("Seeding database with default mock users and courses...")
            
            # Admin User
            admin_user = User(
                email="admin@pathfinder.com",
                hashed_password=get_password_hash("admin123"),
                full_name="PathFinder Admin",
                role="admin"
            )
            db.add(admin_user)

            # Student User
            student_user = User(
                email="student@pathfinder.com",
                hashed_password=get_password_hash("student123"),
                full_name="Rajesh Kumar",
                role="student"
            )
            db.add(student_user)
            db.commit()

            student_profile = Student(
                user_id=student_user.id,
                grade="Grade 6",
                learning_goals="Learn basic maths and science concepts, improve logic",
                xp_points=240,
                streak=4,
                weak_topics="Fraction Division, Soil Nutrients",
                language_preference="Hindi"
            )
            db.add(student_profile)

            # Teacher User
            teacher_user = User(
                email="teacher@pathfinder.com",
                hashed_password=get_password_hash("teacher123"),
                full_name="Savitri Devi",
                role="teacher"
            )
            db.add(teacher_user)
            db.commit()

            teacher_profile = teacher_user.teacher_profile = Student.id  # helper linking (we will do direct model below)
            from app.models.user import Teacher
            t_profile = Teacher(
                user_id=teacher_user.id,
                subject_specialization="Science & Mathematics",
                classes_managed="Grade 5, Grade 6, Grade 7"
            )
            db.add(t_profile)

            # Parent User
            parent_user = User(
                email="parent@pathfinder.com",
                hashed_password=get_password_hash("parent123"),
                full_name="Ramesh Kumar",
                role="parent"
            )
            db.add(parent_user)
            db.commit()

            from app.models.user import Parent
            p_profile = Parent(
                user_id=parent_user.id,
                child_email="student@pathfinder.com"
            )
            db.add(p_profile)
            db.commit()

        # 2. Seed courses & lessons if empty
        if db.query(Course).count() == 0:
            # Mathematics Course
            c1 = Course(
                title="Introduction to Fractions & Ratios",
                description="Master the concepts of fractional parts, denominators, simplifying fractions, and basic ratios for everyday problem solving.",
                subject="Mathematics",
                grade="Grade 6"
            )
            db.add(c1)
            db.commit()

            l1_1 = Lesson(
                course_id=c1.id,
                title="Understanding Fraction Parts",
                content_markdown="""# Understanding Fractions
Fractions represent equal parts of a whole or a collection. When we divide a whole into equal parts, each part is a fraction.

## Core Concepts
- **Numerator (Top Number):** How many parts we have.
- **Denominator (Bottom Number):** How many equal parts the whole is divided into.

For example, in $\\frac{3}{4}$, the numerator is **3** and the denominator is **4**.

### Sustainability Focus: Sharing Clean Water Resources
Imagine a water tank of 100 liters. If we share it equally between 4 farming houses, each family receives $\\frac{1}{4}$ of the tank, which is 25 liters. Reducing waste ensures everyone gets their equal fraction!
""",
                video_url="https://www.youtube.com/embed/n0FZhQ_GkKw",
                sort_order=1
            )
            l1_2 = Lesson(
                course_id=c1.id,
                title="Adding and Subtracting Fractions",
                content_markdown="""# Adding and Subtracting Fractions
To add or subtract fractions, they must have the same denominator (common denominator).

## Step-by-Step Method
1. Find a common denominator.
2. Convert the numerators.
3. Add or subtract the numerators, keeping the denominator same.
4. Simplify the fraction if possible.

*Example:*
$$\\frac{1}{4} + \\frac{2}{4} = \\frac{1+2}{4} = \\frac{3}{4}$$
""",
                video_url="https://www.youtube.com/embed/tDQipFjAoT8",
                sort_order=2
            )
            db.add(l1_1)
            db.add(l1_2)

            # Science Course
            c2 = Course(
                title="Solar Energy and Sustainability",
                description="Learn about the environment, greenhouse gases, solar power, and how we can protect our agricultural ecosystems.",
                subject="Science",
                grade="Grade 6"
            )
            db.add(c2)
            db.commit()

            l2_1 = Lesson(
                course_id=c2.id,
                title="What is Solar Energy?",
                content_markdown="""# Solar Energy: Power from the Sun
Solar energy is radiant light and heat from the Sun that is harnessed using a range of ever-evolving technologies.

## Benefits of Solar Energy
- **Renewable:** The sun will shine for billions of years.
- **Clean:** Unlike coal or gas, solar panels do not release harmful smoke.
- **Local:** Rural villages can generate electricity directly on rooftops without long transmission cables!

### Activity
Try observing how solar cookers or solar solar street lanterns work in your village.
""",
                video_url="https://www.youtube.com/embed/1kUE0BZtTRc",
                sort_order=1
            )
            db.add(l2_1)
            db.commit()

            # Seed pre-made Quiz for Fractions
            q1 = Quiz(
                title="Fractions Challenge 1",
                course_id=c1.id,
                lesson_id=l1_1.id,
                questions_json=json.dumps([
                    {
                        "id": "q1",
                        "type": "mcq",
                        "question_text": "What does the denominator of a fraction represent?",
                        "options": ["The number of parts we have", "The total number of equal parts in the whole", "The sum of the numbers", "A decimal value"],
                        "correct_answer": "The total number of equal parts in the whole",
                        "explanation": "The denominator (bottom number) represents the total number of parts the whole was divided into."
                    },
                    {
                        "id": "q2",
                        "type": "true_false",
                        "question_text": "In the fraction 2/3, 2 is the numerator.",
                        "options": ["True", "False"],
                        "correct_answer": "True",
                        "explanation": "The top number is the numerator, which is 2."
                    },
                    {
                        "id": "q3",
                        "type": "fill_in_the_blanks",
                        "question_text": "To add fractions, they must have a common __________.",
                        "correct_answer": "denominator",
                        "explanation": "Fractions can only be directly added if they share a common denominator."
                    }
                ]),
                xp_reward=50
            )
            db.add(q1)

            # Seed Quiz for Solar Energy
            q2 = Quiz(
                title="Solar Energy Basics",
                course_id=c2.id,
                lesson_id=l2_1.id,
                questions_json=json.dumps([
                    {
                        "id": "sq1",
                        "type": "mcq",
                        "question_text": "Why is solar energy considered clean?",
                        "options": ["It generates water", "It does not emit greenhouse gases or pollution during generation", "It works only at night", "It uses fossil fuels"],
                        "correct_answer": "It does not emit greenhouse gases or pollution during generation",
                        "explanation": "Solar panel electricity generation does not produce any carbon emissions or smog, making it clean."
                    },
                    {
                        "id": "sq2",
                        "type": "true_false",
                        "question_text": "Solar energy is a non-renewable resource.",
                        "options": ["True", "False"],
                        "correct_answer": "False",
                        "explanation": "Solar energy is renewable because the Sun provides a continuous supply of light and heat."
                    }
                ]),
                xp_reward=40
            )
            db.add(q2)
            db.commit()
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
