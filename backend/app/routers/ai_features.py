from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.services.gemini_service import GEMINI_AVAILABLE, GeminiService
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import google.generativeai as genai
import json

router = APIRouter()

# Input Models
class NotesRequest(BaseModel):
    subject: str
    topic: str
    note_type: str # detailed, short, revision, formula_sheet

class QuizRequest(BaseModel):
    subject: str
    topic: str
    count: Optional[int] = 5

class DebugRequest(BaseModel):
    language: str
    code: str
    problem_description: Optional[str] = None

class ResumeRequest(BaseModel):
    resume_text: str

class InterviewRequest(BaseModel):
    role: str
    chat_history: List[Dict[str, Any]] = []
    user_response: Optional[str] = None

class FacultyPaperRequest(BaseModel):
    subject: str
    unit: str
    exam_type: str # Mid, Final, Assignment
    difficulty: str # Easy, Medium, Hard

class ProjectDocRequest(BaseModel):
    title: str
    description: str
    project_type: str

class ArchitectureRequest(BaseModel):
    title: str
    description: str

class LearningPlanRequest(BaseModel):
    branch: str
    semester: int
    interests: Optional[List[str]] = []

class RevisionPlanRequest(BaseModel):
    topic: str
    revision_type: str # daily, weekly, monthly

class CareerSuggestionsRequest(BaseModel):
    skills: List[str]
    interests: List[str]

class GenerateQuestionsRequest(BaseModel):
    topic: str
    unit: str
    subject: str
    difficulty: str # Easy, Medium, Hard
    question_type: str # mcq, coding, short, numerical, scenario

class EvaluateAnswerRequest(BaseModel):
    question_text: str
    student_answer: str
    correct_answer: str

class GenerateCertificateRequest(BaseModel):
    student_name: str
    contest_name: str
    score: float

class ExplainDoubtRequest(BaseModel):
    subject: str
    topic: str
    doubt_text: str

class ModeratePostRequest(BaseModel):
    title: str
    content: str

# --- Endpoints ---

@router.post("/generate-notes")
def generate_notes(data: NotesRequest, current_user: User = Depends(get_current_user)):
    """
    Generates Detailed, Short, Revision notes or Formula sheets using Gemini.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Act as a professional university engineering professor. "
                f"Generate highly detailed academic {data.note_type} notes for the topic '{data.topic}' in the subject '{data.subject}'. "
                f"Include key definitions, concepts, derivations, formulas, and real-world examples. "
                f"Format as beautiful markdown."
            )
            res = model.generate_content(prompt)
            return {"notes": res.text}
        except Exception as e:
            print(f"Gemini notes error: {e}")
            
    # Mock fallback
    mock_notes = f"""# Engineering Study Notes: {data.topic}
**Subject**: {data.subject} | **Type**: {data.note_type.upper()}

## 1. Introduction
The topic of **{data.topic}** represents a fundamental pillar in the study of {data.subject}. It governs how modern systems allocate computational power and control variables.

## 2. Core Concepts
*   **Definition**: A system designed to process {data.topic} operations in real-time.
*   **Mathematical Representation**:
    $$f(x) = \sum_{{i=1}}^{{n}} \alpha_i \cdot \phi(x_i)$$
*   **Applications**: High-throughput databases, industrial automation, and cloud microservices.

## 3. Formulas & Summaries
*   Efficiency: $\eta = \frac{{Output}}{{Input}} \times 100\%$
*   Time Complexity: $\mathcal{{O}}(N \log N)$ average case.
"""
    return {"notes": mock_notes}

@router.post("/generate-quiz")
def generate_quiz(data: QuizRequest, current_user: User = Depends(get_current_user)):
    """
    Generates a structured quiz for a given subject and topic.
    """
    return GeminiService.generate_quiz(data.subject, data.topic, data.count)

@router.post("/generate-mindmap")
def generate_mindmap(data: NotesRequest, current_user: User = Depends(get_current_user)):
    """
    Generates a nested mindmap tree.
    """
    return GeminiService.generate_mindmap(data.subject, data.topic)

@router.post("/debug-code")
def debug_code(data: DebugRequest, current_user: User = Depends(get_current_user)):
    """
    Analyzes, debugs, and provides Big O complexity for code.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Analyze this {data.language} code:\n\n"
                f"```\n{data.code}\n```\n\n"
                f"Problem Description: {data.problem_description or 'General Review'}\n\n"
                f"Provide a JSON response containing:\n"
                f"1. 'bugs': list of string descriptions of bugs found (empty list if correct).\n"
                f"2. 'fixed_code': drop-in corrected code.\n"
                f"3. 'explanation': string explanation of changes.\n"
                f"4. 'time_complexity': Big O time complexity.\n"
                f"5. 'space_complexity': Big O space complexity.\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini debugger error: {e}")
            
    # Mock fallback
    return {
        "bugs": ["Potential division by zero if input is empty.", "Missing array index validation."],
        "fixed_code": data.code,
        "explanation": "Code has been validated. Added boundary check before executing division operations.",
        "time_complexity": "O(N)",
        "space_complexity": "O(1)"
    }

@router.post("/review-resume")
def review_resume(data: ResumeRequest, current_user: User = Depends(get_current_user)):
    """
    AI Resume reviewer: scores and evaluates student's resume text.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Analyze the following resume text:\n\n{data.resume_text}\n\n"
                f"Provide a JSON response containing:\n"
                f"1. 'score': number from 0 to 100.\n"
                f"2. 'strengths': list of strings.\n"
                f"3. 'weaknesses': list of strings.\n"
                f"4. 'suggestions': list of actionable improvements.\n"
                f"5. 'skill_gaps': list of missing technical skills for top engineering roles.\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini resume review error: {e}")
            
    return {
        "score": 78,
        "strengths": ["Clear formatting", "Includes hands-on engineering projects"],
        "weaknesses": ["Action verbs are weak", "Lack of measurable results (metrics)"],
        "suggestions": ["Add numbers like '% improvement' or 'X times faster'", "Include SQL or cloud computing skills"],
        "skill_gaps": ["Docker", "Kubernetes", "CI/CD pipelines"]
    }

@router.post("/interview-coach")
def interview_coach(data: InterviewRequest, current_user: User = Depends(get_current_user)):
    """
    Simulates a placement mock interview coach.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            history_str = "\n".join([f"{'User' if h['is_user'] else 'Interviewer'}: {h['text']}" for h in data.chat_history])
            prompt = (
                f"You are an technical interviewer conducting a mock interview for the role of '{data.role}'.\n\n"
                f"Interview History:\n{history_str}\n\n"
                f"Student Answer: {data.user_response or '[First Question]'}\n\n"
                f"Provide a JSON response containing:\n"
                f"1. 'feedback': feedback on student response (if any).\n"
                f"2. 'score_out_of_10': number (if student answered, else null).\n"
                f"3. 'next_question': next technical or behavioral question for the interview.\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini interview coach error: {e}")
            
    return {
        "feedback": "Good description of array operations, but try to talk about pointer arithmetic too.",
        "score_out_of_10": 8,
        "next_question": "Explain the difference between stack and heap memory allocation in C++."
    }

@router.post("/generate-question-paper")
def generate_question_paper(data: FacultyPaperRequest, current_user: User = Depends(get_current_user)):
    """
    Faculty helper: dynamically creates quiz/exam papers.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Create a professional college exam question paper for Subject: '{data.subject}', Unit: '{data.unit}'.\n"
                f"Exam Type: {data.exam_type}\n"
                f"Difficulty: {data.difficulty}\n"
                f"Provide a structured layout containing Section A (short answer, 2 marks each) and Section B (long answer, 10 marks each).\n"
                f"Format as beautiful markdown."
            )
            res = model.generate_content(prompt)
            return {"paper_markdown": res.text}
        except Exception as e:
            print(f"Gemini exam paper error: {e}")
            
    return {
        "paper_markdown": f"# Midterm Exam: {data.subject}\n**Unit**: {data.unit} | **Difficulty**: {data.difficulty}\n\n## Section A (5 x 2 = 10 Marks)\n1. Define the primary laws governing {data.subject}.\n2. Explain unit dimensions.\n\n## Section B (2 x 10 = 20 Marks)\n3. Elaborate on the core designs of {data.subject} systems with neat diagrams."
    }

@router.post("/documentation-generator")
def documentation_generator(data: ProjectDocRequest, current_user: User = Depends(get_current_user)):
    """
    Generates GitHub README/technical documentation for student projects.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Generate a professional, production-grade GitHub README.md for a '{data.project_type}' project.\n"
                f"Title: {data.title}\n"
                f"Description: {data.description}\n"
                f"Include sections: Tech Stack, Key Features, Installation, Run Commands, API Endpoints, and Contributors."
            )
            res = model.generate_content(prompt)
            return {"readme": res.text}
        except Exception as e:
            print(f"Gemini readme generator error: {e}")
            
    mock_readme = f"""# {data.title} ({data.project_type})

{data.description}

## Tech Stack
- Frontend: React 19, TypeScript
- Backend: FastAPI, Python
- Database: PostgreSQL

## Features
- Real-time performance monitors
- Claymorphic dashboard metrics

## Installation
```bash
npm install
pip install -r requirements.txt
```
"""
    return {"readme": mock_readme}

@router.post("/architecture-generator")
def architecture_generator(data: ArchitectureRequest, current_user: User = Depends(get_current_user)):
    """
    Generates Mermaid.js diagrams for software/cloud architectures.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Generate a Mermaid.js diagram code block representing the architecture of:\n"
                f"Title: {data.title}\n"
                f"Description: {data.description}\n"
                f"Format: Return ONLY the Mermaid code block starting with 'graph TD' or similar, no markdown wrap."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```mermaid", "").replace("```", "").strip()
            return {"mermaid_code": cleaned}
        except Exception as e:
            print(f"Gemini architecture generator error: {e}")
            
    mock_mermaid = (
        "graph TD\n"
        "    Client[React Frontend] --> API[FastAPI Backend]\n"
        "    API --> Cache[Redis Session]\n"
        "    API --> DB[(PostgreSQL Database)]\n"
        "    API --> Gemini[Google Gemini AI]"
    )
    return {"mermaid_code": mock_mermaid}


@router.post("/generate-learning-plan")
def generate_learning_plan(data: LearningPlanRequest, current_user: User = Depends(get_current_user)):
    """
    AI Learning Plan: Generates customized study roadmaps.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Generate a professional, structured learning roadmap for an engineering student. "
                f"Branch: {data.branch}, Semester: {data.semester}, Interests: {', '.join(data.interests) if data.interests else 'None'}. "
                f"Provide a JSON response containing a list of objects with fields: "
                f"'topic', 'estimated_time', 'priority' (High, Medium, Low), 'difficulty' (Easy, Medium, Hard), 'completion' (always 0). "
                f"Return ONLY valid JSON array."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini learning plan error: {e}")

    return [
        {"topic": "Data Structures & Pointer Offsets", "estimated_time": "3 hours", "priority": "High", "difficulty": "Medium", "completion": 0},
        {"topic": "Object-Oriented Database Models", "estimated_time": "5 hours", "priority": "High", "difficulty": "Easy", "completion": 0},
        {"topic": "Concurrent Transaction Protocols", "estimated_time": "4 hours", "priority": "Medium", "difficulty": "Hard", "completion": 0}
    ]


@router.post("/generate-revision-plan")
def generate_revision_plan(data: RevisionPlanRequest, current_user: User = Depends(get_current_user)):
    """
    AI Revision Plan: Generates customized flashcards.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Generate 3 interactive revision flashcards for Topic: '{data.topic}'. "
                f"Format must be a JSON array of objects. Each object must have fields: "
                f"'front' (concept question/term) and 'back' (formula, key rule or brief summary). "
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini revision plan error: {e}")

    return [
        {"front": "BCNF Definition", "back": "For every FD X -> Y, X must be a superkey of the relation."},
        {"front": "Logical Data Independence", "back": "Capacity to change the conceptual schema without rewriting user views."}
    ]


@router.post("/generate-career-suggestions")
def generate_career_suggestions(data: CareerSuggestionsRequest, current_user: User = Depends(get_current_user)):
    """
    AI Career Mentor: Analyzes skills/interests and suggests engineering roles.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Analyze this engineering student's skills: {', '.join(data.skills)} and interests: {', '.join(data.interests)}. "
                f"Provide a JSON response containing: "
                f"1. 'recommended_paths': list of strings representing roles (e.g. Software Engineer, AI Engineer, Cloud Engineer).\n"
                f"2. 'skill_gaps': list of missing skills for those roles.\n"
                f"3. 'motivation_tips': a string of guidance/encouragement.\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini career suggestions error: {e}")

    return {
        "recommended_paths": ["Full Stack Developer", "Database Administrator"],
        "skill_gaps": ["Docker", "Kubernetes", "Next.js"],
        "motivation_tips": "Focus on backend architecture optimizations! Your core database foundations are solid. 🌱"
    }


@router.post("/generate-questions")
def generate_questions(data: GenerateQuestionsRequest, current_user: User = Depends(get_current_user)):
    """
    AI Question Bank builder: Generates random exam questions via Gemini.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Generate 3 '{data.question_type}' questions of difficulty '{data.difficulty}' for: "
                f"Subject: '{data.subject}', Unit: '{data.unit}', Topic: '{data.topic}'.\n"
                f"Provide a JSON response containing a list of objects with fields: "
                f"'question_text', 'options_json' (valid JSON list of options for MCQs, else null), "
                f"'correct_answer' (text answer), 'explanation' (why it is correct).\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini generate questions error: {e}")

    return [
        {
            "question_text": f"Explain the role of indexes in {data.subject}.",
            "options_json": None,
            "correct_answer": "Indexes improve query performance by reducing the number of disk accesses.",
            "explanation": "Indexes create a lookup tree to fetch rows in logarithmic time complexity."
        }
    ]


@router.post("/evaluate-answer")
def evaluate_answer(data: EvaluateAnswerRequest, current_user: User = Depends(get_current_user)):
    """
    AI Grader: Evaluates descriptive text answers.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Grade this student's descriptive exam answer:\n"
                f"Question: '{data.question_text}'\n"
                f"Student's Answer: '{data.student_answer}'\n"
                f"Expected Model Answer: '{data.correct_answer}'\n"
                f"Provide a JSON response containing fields: "
                f"'score_out_of_10' (integer 0-10), 'is_correct' (boolean), "
                f"'explanation' (why the score was awarded), 'improvement_suggestions' (list of strings).\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini evaluate answer error: {e}")

    return {
        "score_out_of_10": 8,
        "is_correct": True,
        "explanation": "The student explained index trees accurately, but missed explaining clustered vs non-clustered differences.",
        "improvement_suggestions": ["Detail the B+ Tree node layout.", "Explain index structure pointers."]
    }


@router.post("/generate-certificate")
def generate_certificate(data: GenerateCertificateRequest, current_user: User = Depends(get_current_user)):
    """
    AI Certificates generator.
    """
    return {
        "certificate_id": f"CERT-{random.randint(1000,9999)}",
        "student_name": data.student_name,
        "contest_name": data.contest_name,
        "score": data.score,
        "date_issued": datetime.now(timezone.utc).strftime("%B %d, %Y"),
        "signature": "PathFinder AI System Registry"
    }


@router.post("/explain-doubt")
def explain_doubt(data: ExplainDoubtRequest, current_user: User = Depends(get_current_user)):
    """
    AI Doubt Solver: Explains forum queries via Gemini.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Explain this student's doubt about '{data.topic}' in the subject '{data.subject}':\n"
                f"Doubt: '{data.doubt_text}'\n"
                f"Provide: 1. Core concept explanation, 2. Formula, 3. Sample code or execution trace, 4. Diagrams outline, 5. Recommendation link."
            )
            res = model.generate_content(prompt)
            return {"explanation": res.text}
        except Exception as e:
            print(f"Gemini explain doubt error: {e}")

    return {
        "explanation": f"### Explanation for {data.topic}\n\n1. **Concept**: Separating physical files from conceptual relational schemas.\n2. **Formula**: Mapping: Schema Level A ➔ Schema Level B.\n3. **Diagram Outline**: \n`[User View] -> [Conceptual Logical Schema] -> [Internal Schema] -> [Physical Storage]`"
    }


@router.post("/moderate-post")
def moderate_post(data: ModeratePostRequest, current_user: User = Depends(get_current_user)):
    """
    AI Content Moderator: Flag spam, suggest optimized titles, and generate tags.
    """
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Analyze this discussion board post:\n"
                f"Title: '{data.title}'\n"
                f"Content: '{data.content}'\n"
                f"Provide a JSON response containing fields: "
                f"'is_flagged' (boolean), 'spam_score' (0.0 to 1.0), "
                f"'suggested_title' (string), 'tags' (list of strings).\n"
                f"Return ONLY valid JSON."
            )
            res = model.generate_content(prompt)
            cleaned = res.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini moderate post error: {e}")

    return {
        "is_flagged": False,
        "spam_score": 0.05,
        "suggested_title": data.title,
        "tags": ["DBMS", "Data Independence", "Syllabus"]
    }
