"""
Standalone database seeder script.
Run once to populate the SQLite database with mock users, courses, quizzes, and the entire engineering curriculum hierarchy.
Usage: python seed_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from datetime import datetime, timezone
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Student, Teacher, Parent
from app.models.course import Course, Lesson
from app.models.quiz import Quiz
from app.models.engineering import (
    Department, Branch, Semester, Subject, Unit, Topic, TopicResource, VideoResource
)
from app.models.personalization import (
    LearningHistory, RecommendationRecord, StudentGoal, LearningAnalytic, RevisionSchedule, SkillProgress
)
from app.models.assessment import (
    QuestionBank, Exam, ExamQuestion, StudentExam
)
from app.models.community import (
    Discussion, DiscussionReply, StudyGroup, StudyGroupMember,
    ProjectCollaboration, ProjectTask, ResourceLibrary,
    InterviewExperience, CampusEvent, Announcement
)
from app.core.security import get_password_hash

# Auto create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # 1. Seed users if not exists
    if db.query(User).count() == 0:
        print("Seeding database with default mock users...")

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

        print("[SUCCESS] Users seeded: admin, student (Rajesh), teacher (Savitri), parent (Ramesh)")
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
        print("[SUCCESS] Courses & quizzes seeded.")
    else:
        print(f"Courses already seeded ({db.query(Course).count()} courses found).")

    # 3. Seed Engineering Curriculum
    if db.query(Department).count() == 0:
        print("Seeding Engineering curriculum structure...")
        
        # Departments
        dept_eng = Department(name="Engineering", description="All Engineering branches and academic programs.")
        db.add(dept_eng)
        db.commit()

        # Branches
        branch_data = [
            {"name": "Computer Science & Engineering", "code": "CSE"},
            {"name": "Artificial Intelligence & Data Science", "code": "AI & DS"},
            {"name": "Information Technology", "code": "IT"},
            {"name": "Electronics & Communication Engineering", "code": "ECE"},
            {"name": "Electrical & Electronics Engineering", "code": "EEE"},
            {"name": "Mechanical Engineering", "code": "Mechanical"},
            {"name": "Civil Engineering", "code": "Civil"},
            {"name": "Chemical Engineering", "code": "Chemical"},
            {"name": "Biotechnology", "code": "Biotechnology"}
        ]
        
        db_branches = []
        for bd in branch_data:
            b = Branch(name=bd["name"], code=bd["code"], department_id=dept_eng.id)
            db.add(b)
            db_branches.append(b)
        db.commit()

        # Semesters 1 to 8 for each branch, and Subjects for CSE Semester 1-8
        for branch in db_branches:
            for sem_num in range(1, 9):
                sem = Semester(branch_id=branch.id, semester_number=sem_num)
                db.add(sem)
        db.commit()

        # Let's seed subjects specifically for CSE Semester 5 as a detailed sample
        cse_branch = next(b for b in db_branches if b.code == "CSE")
        cse_sem5 = db.query(Semester).filter(Semester.branch_id == cse_branch.id, Semester.semester_number == 5).first()
        
        subjects_data = [
            {"name": "Database Management Systems", "code": "CS501"},
            {"name": "Theory of Computation", "code": "CS502"},
            {"name": "Software Engineering & Architecture", "code": "CS503"},
            {"name": "Web Technologies", "code": "CS504"}
        ]
        
        db_subjects = []
        for sd in subjects_data:
            s = Subject(name=sd["name"], code=sd["code"], semester_id=cse_sem5.id)
            db.add(s)
            db_subjects.append(s)
        db.commit()

        # Let's create units & topics for "Database Management Systems"
        dbms_subject = next(s for s in db_subjects if s.code == "CS501")
        
        units_data = [
            {"name": "Introduction to Database Systems & ER Model", "unit_number": 1},
            {"name": "Relational Model & SQL Querying", "unit_number": 2},
            {"name": "Relational Database Design & Normalization", "unit_number": 3},
            {"name": "Transaction Processing & Concurrency Control", "unit_number": 4},
            {"name": "Indexing, Hashing & Storage Systems", "unit_number": 5}
        ]
        
        db_units = []
        for ud in units_data:
            u = Unit(name=ud["name"], unit_number=ud["unit_number"], subject_id=dbms_subject.id)
            db.add(u)
            db_units.append(u)
        db.commit()

        # Let's create a couple of topics for Unit 1, 2 & 3
        # Unit 1 Topics
        u1 = db_units[0]
        t1_1 = Topic(name="Three-Schema Architecture & Data Independence", description="Understanding External, Conceptual, and Physical schemas and logic vs physical mappings.", unit_id=u1.id)
        t1_2 = Topic(name="Entity-Relationship (ER) Diagram Fundamentals", description="Entities, Attributes, Primary Keys, Relationships, and Cardinality mapping.", unit_id=u1.id)
        db.add(t1_1)
        db.add(t1_2)

        # Unit 2 Topics
        u2 = db_units[1]
        t2_1 = Topic(name="Introduction to SQL Queries & Joins", description="DDL, DML, subqueries, group by, having, and Inner/Outer Joins.", unit_id=u2.id)
        db.add(t2_1)

        # Unit 3 Topics
        u3 = db_units[2]
        t3_1 = Topic(name="Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF)", description="Redundancy reduction, functional dependency analysis, and decomposition checks.", unit_id=u3.id)
        db.add(t3_1)
        
        db.commit()

        # Seed Topic Resources for Three-Schema Architecture
        tr1 = TopicResource(
            topic_id=t1_1.id,
            resource_type="detailed_notes",
            title="Comprehensive Study Notes on Three-Schema Architecture",
            content="""# Three-Schema Architecture & Data Independence

The three-schema architecture is an index framework used to describe the structure of specific database systems. It divides the database layout into three distinct levels:

## 1. External Schema (User Level)
- Describes only the part of the database that is relevant to a specific user group.
- Users can view and interact with views tailored for their permissions.

## 2. Conceptual Schema (Logical Level)
- Describes the structure of the entire database for community admin groups.
- Defines entity structures, data types, relationships, constraints, and security logic.

## 3. Physical Schema (Internal Level)
- Describes the physical storage structure and access paths of the database.
- Handles how blocks of files are laid out on disk.

## Data Independence
*   **Logical Data Independence**: Ability to change the conceptual schema without altering external schemas.
*   **Physical Data Independence**: Ability to change the physical structure without altering the conceptual schema.
"""
        )
        
        tr2 = TopicResource(
            topic_id=t1_1.id,
            resource_type="formula_sheet",
            title="Core Rules & Database Equations",
            content="""# Database DBMS Formula Sheet

## Relational Algebra Equivalences
- Commutativity of Joins: $R \\bowtie S \\equiv S \\bowtie R$
- Associativity of Joins: $(R \\bowtie S) \\bowtie T \\equiv R \\bowtie (S \\bowtie T)$

## Normalization Checks
- BCNF: For every FD $X \\rightarrow Y$, $X$ must be a superkey.
- 3NF: For every FD $X \\rightarrow Y$, either $X$ is a superkey, or $Y$ is a prime attribute.
"""
        )
        db.add(tr1)
        db.add(tr2)

        # Seed Video Resource
        v1 = VideoResource(
            topic_id=t1_1.id,
            course_title="Database Management Systems Lecture 1",
            instructor="Prof. S. Srinath",
            platform="NPTEL",
            duration="45 mins",
            difficulty="Beginner",
            thumbnail_url="https://img.youtube.com/vi/3EJlovevfcA/0.jpg",
            video_url="https://www.youtube.com/embed/3EJlovevfcA",
            description="Introduction to DBMS architecture, data schemas, independence, and relational models."
        )
        db.add(v1)
        db.commit()
        print("[SUCCESS] Engineering curriculum structure seeded successfully!")
    else:
        print("Engineering curriculum already seeded.")

    # 4. Seed personalization tables for Rajesh Kumar
    student_user = db.query(User).filter(User.email == "student@pathfinder.com").first()
    if student_user and db.query(StudentGoal).filter(StudentGoal.user_id == student_user.id).count() == 0:
        print("Seeding Personalization & Recommendations...")
        
        # Student Goal
        sg = StudentGoal(
            user_id=student_user.id,
            target_cgpa=8.5,
            daily_study_hours=3.0,
            weekly_xp_goal=500,
            monthly_cert_goal=2
        )
        db.add(sg)
        
        # Skill Progress
        skills_mock = [
            {"name": "Python", "level": 80},
            {"name": "SQL", "level": 60},
            {"name": "React", "level": 45},
            {"name": "Data Structures", "level": 70}
        ]
        for sk in skills_mock:
            sp = SkillProgress(user_id=student_user.id, skill_name=sk["name"], proficiency_level=sk["level"])
            db.add(sp)
            
        # Recommendations
        recs_mock = [
            {"cat": "topic", "title": "Three-Schema Architecture", "desc": "Review logical vs physical data independence.", "dif": "Beginner", "pri": "High"},
            {"cat": "coding", "title": "Solve Subarray Max Sum", "desc": "Implement Kadane's algorithm and check O(N) constraints.", "dif": "Medium", "pri": "High"},
            {"cat": "certification", "title": "AWS Cloud Practitioner Essentials", "desc": "Free cloud certification on AWS platform.", "dif": "Beginner", "pri": "Medium"}
        ]
        for rm in recs_mock:
            rec = RecommendationRecord(
                user_id=student_user.id,
                category=rm["cat"],
                title=rm["title"],
                description=rm["desc"],
                difficulty=rm["dif"],
                priority=rm["pri"],
                reasons="Aligns with target Software Engineer career goal."
            )
            db.add(rec)
            
        db.commit()
        print("[SUCCESS] Personalization tables seeded.")

    # 5. Seed Assessment Question Bank & Mock Exams
    if db.query(Exam).count() == 0:
        print("Seeding Question Bank & Exams...")
        subj = db.query(Subject).first()
        subj_id = subj.id if subj else 1
        
        q1 = QuestionBank(
            subject_id=subj_id,
            type="mcq",
            question_text="What is data independence in DBMS?",
            options_json=json.dumps([
                "Logical and physical schema separation",
                "Storage space optimization",
                "User concurrency limits",
                "None of the above"
            ]),
            correct_answer="Logical and physical schema separation",
            explanation="Data independence allows modification of schema levels without forcing changes to higher levels.",
            difficulty="Easy"
        )
        db.add(q1)
        
        q2 = QuestionBank(
            subject_id=subj_id,
            type="coding",
            question_text="Write a Python program to reverse a string.",
            correct_answer="def reverse(s):\n    return s[::-1]",
            explanation="Using slicing [::-1] reverses the string in O(N) complexity.",
            difficulty="Medium",
            sample_input="hello",
            sample_output="olleh"
        )
        db.add(q2)
        
        db.commit()
        
        # Build Exam
        ex = Exam(
            title="Database Systems Assessment 1",
            exam_type="unit",
            time_limit_minutes=45,
            negative_marking=0.25,
            random_questions=False,
            is_active=True
        )
        db.add(ex)
        db.commit()
        
        eq1 = ExamQuestion(exam_id=ex.id, question_id=q1.id)
        eq2 = ExamQuestion(exam_id=ex.id, question_id=q2.id)
        db.add(eq1)
        db.add(eq2)
        db.commit()
        print("[SUCCESS] Question Bank & Exam seeded.")

    # 6. Seed Campus Community & Discussions
    if db.query(Discussion).count() == 0:
        print("Seeding Community Discussions & Study Groups...")
        subj = db.query(Subject).first()
        subj_id = subj.id if subj else 1
        student_user = db.query(User).filter(User.email == "student@pathfinder.com").first()
        teacher_user = db.query(User).filter(User.email == "teacher@pathfinder.com").first()
        student_id = student_user.id if student_user else 2
        teacher_id = teacher_user.id if teacher_user else 3

        # Discussion Forum post
        d1 = Discussion(
            user_id=student_id,
            subject_id=subj_id,
            title="Understanding 3NF vs BCNF constraints?",
            content="Can someone explain with a concrete relation example why BCNF is strictly stronger than 3NF?"
        )
        db.add(d1)
        db.commit()

        dr1 = DiscussionReply(
            discussion_id=d1.id,
            user_id=teacher_id,
            content="In 3NF, for any non-trivial FD X -> A, either X is a superkey or A is a prime attribute. BCNF removes the prime attribute loophole.",
            is_best_answer=True
        )
        db.add(dr1)

        # Study Group
        sg = StudyGroup(
            name="DBMS Query Hackers",
            description="Preparation group for DBMS lab viva and SQL optimizations.",
            created_by_id=student_id
        )
        db.add(sg)
        db.commit()

        sgm = StudyGroupMember(study_group_id=sg.id, user_id=student_id)
        db.add(sgm)

        # Project Collab
        proj = ProjectCollaboration(
            title="Smart Water Utility IoT Monitor",
            description="Arduino based ESP8266 controller monitoring water flow metrics.",
            creator_id=student_id,
            github_url="https://github.com/example/water-iot"
        )
        db.add(proj)
        db.commit()

        task = ProjectTask(
            project_id=proj.id,
            title="Interface Flow Sensors",
            description="Calibrate pulse sensors to flow rates in Litres/min.",
            assigned_to_id=student_id,
            status="todo"
        )
        db.add(task)

        # Campus Event
        evt = CampusEvent(
            title="Smart India Hackathon Mock",
            description="36-Hour coding hackathon to solve university utility problems.",
            event_type="hackathon",
            event_date=datetime.now(timezone.utc),
            registration_count=18
        )
        db.add(evt)

        # Announcement
        ann = Announcement(
            publisher_id=teacher_id,
            title="DBMS Lab Exam Schedule",
            content="Descriptive lab exams start Monday. Ensure you have your record files signed.",
            announcement_type="exam"
        )
        db.add(ann)

        db.commit()
        print("[SUCCESS] Community data seeded.")

    # Final report
    print(f"\n=== Database Summary ===")
    print(f"Users:       {db.query(User).count()}")
    print(f"Courses:     {db.query(Course).count()}")
    print(f"Departments: {db.query(Department).count()}")
    print(f"Branches:    {db.query(Branch).count()}")
    print(f"Subjects:    {db.query(Subject).count()}")
    print(f"Topics:      {db.query(Topic).count()}")

except Exception as e:
    print(f"ERROR seeding database: {e}")
    db.rollback()
    raise
finally:
    db.close()
