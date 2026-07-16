"""
Standalone database seeder script.
Run once to populate the SQLite database with mock users, courses, and quizzes.
Usage: python seed_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Student, Teacher, Parent
from app.models.course import Course, Lesson
from app.models.quiz import Quiz
from app.core.security import get_password_hash

# Auto create tables
Base.metadata.create_all(bind=engine)

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

        p_profile = Parent(
            user_id=parent_user.id,
            child_email="student@pathfinder.com"
        )
        db.add(p_profile)
        db.commit()

        print("✓ Users seeded: admin, student (Rajesh), teacher (Savitri), parent (Ramesh)")
    else:
        print(f"Users already seeded ({db.query(User).count()} users found).")

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
Fractions represent equal parts of a whole or a collection.

## Core Concepts
- **Numerator (Top):** How many parts we have.
- **Denominator (Bottom):** Total equal parts the whole is divided into.

For example, in 3/4, the numerator is **3** and the denominator is **4**.
""",
            video_url="https://www.youtube.com/embed/n0FZhQ_GkKw",
            sort_order=1
        )
        l1_2 = Lesson(
            course_id=c1.id,
            title="Adding and Subtracting Fractions",
            content_markdown="""# Adding and Subtracting Fractions
To add or subtract fractions, they must have the same denominator.

## Step-by-Step
1. Find a common denominator.
2. Convert numerators accordingly.
3. Add or subtract numerators, keeping denominator.
4. Simplify if possible.
""",
            video_url="https://www.youtube.com/embed/tDQipFjAoT8",
            sort_order=2
        )
        db.add(l1_1)
        db.add(l1_2)

        # Science Course
        c2 = Course(
            title="Solar Energy and Sustainability",
            description="Learn about the environment, greenhouse gases, solar power, and agricultural ecosystems.",
            subject="Science",
            grade="Grade 6"
        )
        db.add(c2)
        db.commit()

        l2_1 = Lesson(
            course_id=c2.id,
            title="What is Solar Energy?",
            content_markdown="""# Solar Energy: Power from the Sun
Solar energy is radiant light and heat from the Sun.

## Benefits
- **Renewable:** The sun shines for billions of years.
- **Clean:** No harmful smoke.
- **Local:** Villages can generate power directly on rooftops.
""",
            video_url="https://www.youtube.com/embed/1kUE0BZtTRc",
            sort_order=1
        )
        db.add(l2_1)
        db.commit()

        # Seed Quiz for Fractions
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
                    "explanation": "The denominator (bottom number) is the total parts the whole was divided into."
                },
                {
                    "id": "q2",
                    "type": "true_false",
                    "question_text": "In the fraction 2/3, 2 is the numerator.",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "explanation": "The top number is the numerator."
                },
                {
                    "id": "q3",
                    "type": "fill_in_the_blanks",
                    "question_text": "To add fractions, they must have a common __________.",
                    "correct_answer": "denominator",
                    "explanation": "Fractions must share a common denominator to be directly added."
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
                    "options": ["It generates water", "It does not emit greenhouse gases during generation", "It works only at night", "It uses fossil fuels"],
                    "correct_answer": "It does not emit greenhouse gases during generation",
                    "explanation": "Solar generation produces no carbon emissions."
                },
                {
                    "id": "sq2",
                    "type": "true_false",
                    "question_text": "Solar energy is a non-renewable resource.",
                    "options": ["True", "False"],
                    "correct_answer": "False",
                    "explanation": "Solar energy is renewable as the Sun provides continuous supply."
                }
            ]),
            xp_reward=40
        )
        db.add(q2)
        db.commit()

        print("✓ Courses & quizzes seeded.")
    else:
        print(f"Courses already seeded ({db.query(Course).count()} courses found).")

    # Final report
    print(f"\n=== Database Summary ===")
    print(f"Users:   {db.query(User).count()}")
    print(f"Courses: {db.query(Course).count()}")
    print(f"Lessons: {db.query(Lesson).count()}")
    print(f"Quizzes: {db.query(Quiz).count()}")

except Exception as e:
    print(f"ERROR seeding database: {e}")
    db.rollback()
    raise
finally:
    db.close()
