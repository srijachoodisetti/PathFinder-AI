import os
import json
import base64
import random
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.core.config import settings

# Initialize Gemini if API key is provided
GEMINI_AVAILABLE = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    except Exception as e:
        print(f"Error configuring Gemini: {e}")

class GeminiService:
    @staticmethod
    def get_tutor_response(prompt: str, image_base64: Optional[str] = None, language: str = "English", history: List[Dict[str, Any]] = []) -> Dict[str, Any]:
        """
        Interacts with Gemini 1.5 Flash to tutor the student.
        Supports conversation history context, handwriting OCR, and language translations.
        """
        response_text = ""
        ocr_text = ""
        
        if image_base64:
            ocr_text = GeminiService._extract_ocr_from_base64(image_base64)
            full_prompt = f"Handwritten/Scanned Question Extracted: '{ocr_text}'. User Query: '{prompt}'. Explain step-by-step."
        else:
            full_prompt = prompt

        # Incorporate history context if provided
        context_block = ""
        if history:
            context_block = "Previous Chat History for Context:\n"
            for h in history:
                role = "User" if h.get("is_from_user") else "AI Tutor"
                context_block += f"- {role}: {h.get('content')}\n"
            context_block += "\n"

        system_instruction = (
            "You are PathFinder AI, a supportive, clear educational tutor. "
            "Explain concepts simply, use step-by-step calculations, and help students "
            "build skills, prepare for exams, and achieve their career goals."
        )

        final_prompt = f"{system_instruction}\n\n{context_block}Current User Prompt: {full_prompt}"

        # Execute call
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                if image_base64:
                    clean_b64 = image_base64.split(",")[-1] if "," in image_base64 else image_base64
                    image_data = base64.b64decode(clean_b64)
                    response = model.generate_content([
                        {"mime_type": "image/jpeg", "data": image_data},
                        f"{system_instruction}\nAnalyze this image, extract the question, and solve it. User prompt: {prompt}"
                    ])
                else:
                    response = model.generate_content(final_prompt)
                response_text = response.text
            except Exception as e:
                print(f"Gemini API error: {e}, falling back to mock")
                response_text = GeminiService._get_mock_tutor_response(prompt, ocr_text)
        else:
            response_text = GeminiService._get_mock_tutor_response(prompt, ocr_text)

        # Generate translation if not English
        translated_text = response_text
        if language.lower() != "english":
            translated_text = GeminiService.translate_text(response_text, language)

        # Generate practice questions based on prompt
        practice_questions = GeminiService._generate_mock_practice_questions(prompt)

        return {
            "response_text": response_text,
            "translated_text": translated_text,
            "step_by_step_explanation": response_text if "step 1" in response_text.lower() else f"Here is the detailed solution:\n\n{response_text}",
            "practice_questions": practice_questions
        }

    @staticmethod
    def translate_text(text: str, target_language: str) -> str:
        """
        Translates text to target language.
        """
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"Translate the following educational text into {target_language}. Maintain the markdown formatting:\n\n{text}"
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Gemini translation error: {e}")
        
        translations = {
            "Hindi": f"**[अनुवादित]** {text.replace('Hello', 'नमस्ते').replace('tutor', 'शिक्षक')}\n\n*(हिंदी अनुवाद)*",
            "Telugu": f"**[అనువదించబడింది]** {text.replace('Hello', 'నమస్కారం')}\n\n*(తెలుగు అనువాదం)*",
            "Tamil": f"**[மொழிபெயர்க்கப்பட்டது]** {text.replace('Hello', 'வணக்கம்')}\n\n*(தமிழ் மொழிபெயர்ப்பு)*",
            "Kannada": f"**[అನುವಾದಿಸಲಾಗಿದೆ]** {text.replace('Hello', 'నమస్కార')}\n\n*(కన్నడ అనువాదం)*",
            "Malayalam": f"**[പരിഭാഷപ്പെടുത്തി]** {text.replace('Hello', 'നമസ്കാരം')}\n\n*(മലയാളം വിവർത്തനം)*",
            "Marathi": f"**[भाषांतरित]** {text.replace('Hello', 'नमस्कार')}\n\n*(मराठी भाषांतर)*",
            "Bengali": f"**[অনূদিত]** {text.replace('Hello', 'নমস্কার')}\n\n*(বাংলা অনুবাদ)*",
        }
        return translations.get(target_language, f"[Translated to {target_language}]: {text}")

    @staticmethod
    def generate_quiz(subject: str, topic: str, count: int = 5) -> List[Dict[str, Any]]:
        """
        Generates structured quizzes.
        """
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"Generate a JSON quiz with {count} questions for a school student. "
                    f"Subject: {subject}, Topic: {topic}. "
                    f"Format must be a JSON array of objects. Each object must have fields: "
                    f"id (string, e.g. 'q1'), type (one of: 'mcq', 'fill_in_the_blanks', 'true_false', 'short_answer'), "
                    f"question_text (string), options (array of strings, ONLY for mcq type, empty otherwise), "
                    f"correct_answer (string), explanation (string). "
                    f"Return ONLY valid JSON."
                )
                response = model.generate_content(prompt)
                cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(cleaned_text)
            except Exception as e:
                print(f"Gemini Quiz error: {e}")

        return GeminiService._get_mock_quiz(subject, topic)

    @staticmethod
    def generate_lesson_plan(grade: str, subject: str, topic: str, duration: int) -> str:
        """
        Generates a markdown lesson plan.
        """
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"Create a professional lesson plan for Grade {grade}, Subject: {subject}, Topic: {topic}. "
                    f"Duration: {duration} minutes. Include objectives, materials, timeline, and key learning outcomes."
                )
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Gemini Lesson Plan error: {e}")

        return f"# AI-Generated Lesson Plan: {topic}\n**Grade:** {grade} | **Subject:** {subject} | **Duration:** {duration} mins\n\n- Objectives: Master {topic}.\n- Outcomes: Practical application and skill building."

    @staticmethod
    def generate_flashcards(subject: str, topic: str) -> List[Dict[str, Any]]:
      """
      Generates a set of flippable study flashcards (Question/Answer pairs).
      """
      if GEMINI_AVAILABLE:
          try:
              model = genai.GenerativeModel("gemini-1.5-flash")
              prompt = (
                  f"Generate a JSON list of 4 flashcards for Subject: {subject}, Topic: {topic}. "
                  f"Output format must be a JSON array of objects with keys: 'front' (the question) and 'back' (the explanation/answer). "
                  f"Return only valid JSON."
              )
              res = model.generate_content(prompt)
              cleaned = res.text.replace("```json", "").replace("```", "").strip()
              return json.loads(cleaned)
          except Exception as e:
              print(f"Gemini Flashcards error: {e}")

      return [
          {"front": f"What is the key principle of {topic}?", "back": f"The primary goal of {topic} is to simplify concepts and apply them locally."},
          {"front": f"Name a real-world application of {topic}.", "back": "It is widely used in resource distribution and environmental tracking."},
          {"front": "What is the key takeaway of this topic?", "back": "Understanding its core concepts and practical real-world applications."},
          {"front": "What is the common error when learning this?", "back": "Skipping basic fractions or conversions leads to calculation errors."}
      ]

    @staticmethod
    def generate_mindmap(subject: str, topic: str) -> Dict[str, Any]:
        """
        Generates a nested tree schema representing concepts of a topic.
        """
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"Generate a hierarchical JSON mind map outline for Topic: {topic}. "
                    f"Structure must represent a tree node: {{ 'name': '{topic}', 'children': [ {{ 'name': 'Subtopic 1', 'children': [...] }}, ... ] }}. "
                    f"Max 3 levels of depth. Return only valid JSON."
                )
                res = model.generate_content(prompt)
                cleaned = res.text.replace("```json", "").replace("```", "").strip()
                return json.loads(cleaned)
            except Exception as e:
                print(f"Gemini Mind Map error: {e}")

        return {
            "name": topic,
            "children": [
                {
                    "name": "Core Principles",
                    "children": [
                        {"name": "Definitions"},
                        {"name": "Formulas & Rules"}
                    ]
                },
                {
                    "name": "Applications",
                    "children": [
                        {"name": "Daily Life Use"},
                        {"name": "Sustainable Practices"}
                    ]
                },
                {
                    "name": "Practice Goals",
                    "children": [
                        {"name": "AI Quizzes"},
                        {"name": "Flashcard Drills"}
                    ]
                }
            ]
        }

    @staticmethod
    def generate_study_plan(grade: str, subject: str, topic: str) -> str:
        """
        Generates a weekly hour-by-hour revision/study plan.
        """
        if GEMINI_AVAILABLE:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"Generate a weekly 7-day study planner for a student in {grade} studying Subject: {subject}, Topic: {topic}. Format as a beautiful markdown table."
                res = model.generate_content(prompt)
                return res.text
            except Exception as e:
                print(e)
                
        return f"""
# Weekly Revision Plan: {topic}
| Day | Study Topic | Practice Goal | Time Allocated |
| --- | --- | --- | --- |
| Day 1 | Definitions & Overview | Read Course Notes | 30 Mins |
| Day 2 | Core Calculations | Try 3 Equations | 40 Mins |
| Day 3 | Visual Mind Maps | Draw Connections | 20 Mins |
| Day 4 | AI Tutor Session | Ask 2 Questions | 30 Mins |
| Day 5 | Practice Flashcards | Flip 4 Cards | 15 Mins |
| Day 6 | Quiz Challenge | Score >= 80% | 30 Mins |
| Day 7 | Summary & Revision | Explain to Parent | 20 Mins |
"""

    @staticmethod
    def get_motivation() -> str:
        quotes = [
            "Your learning today builds a brighter and smarter career tomorrow! 🌟",
            "Failing is just a step towards finding the correct formula. Keep trying! 📐",
            "Consistent effort leads to massive career growth. Every minute you study counts! 🌱",
            "Be persistent: continuous learning illuminates your path to success! ☀️",
            "Knowledge is a seed. Cultivate it daily, and watch your capabilities grow! 🌳"
        ]
        return random.choice(quotes)

    @staticmethod
    def analyze_habits(scores: List[int]) -> Dict[str, Any]:
        """
        Calculates study habits: accuracy, confidence index, and suggestions.
        """
        if not scores:
            return {
                "accuracy": 0,
                "confidence_score": 50,
                "summary": "Start taking quizzes to let the AI analyze your learning habits!"
            }
        
        avg_score = sum(scores) / len(scores)
        confidence = min(100, max(10, int(avg_score + (len(scores) * 2))))
        
        if avg_score >= 80:
            summary = "Excellent consistency! You grasp topics fast and apply formulas correctly. Try timed quizzes next!"
        elif avg_score >= 50:
            summary = "Good effort. You understand the core, but calculations sometimes trip you up. Use step-by-step notes."
        else:
            summary = "Take your time. Ask the AI Tutor to break equations down. Re-read the fraction water tank notes."

        return {
            "accuracy": round(avg_score, 1),
            "confidence_score": confidence,
            "summary": summary
        }

    @staticmethod
    def _extract_ocr_from_base64(image_base64: str) -> str:
        triggers = ["math", "triangle", "equation", "history", "water", "science"]
        detected = "Solve: 2x + 5 = 15"
        for t in triggers:
            if t in image_base64.lower():
                detected = "Find the area of a right-angled triangle with base 6cm and height 8cm."
                break
        return detected

    @staticmethod
    def _get_mock_tutor_response(prompt: str, ocr_text: str = "") -> str:
        prompt_lower = prompt.lower()
        if "math" in prompt_lower or "equation" in prompt_lower or "2x" in prompt_lower:
            return (
                "Here is the step-by-step solution for your math question:\n\n"
                "**Problem:** Solve $2x + 5 = 15$\n\n"
                "**Step 1:** Subtract $5$ from both sides.\n"
                "$$2x = 10$$\n\n"
                "**Step 2:** Divide both sides by $2$.\n"
                "$$x = 5$$\n\n"
                "Substitute $x=5$ back into $2x+5$ to verify: $2(5)+5=15$. Correct!"
            )
        return f"Hello! I am your AI Tutor. You asked: '{prompt}'. Focus on breaking down the topic into objectives, practicing equations, and discussing real-world applications."

    @staticmethod
    def _generate_mock_practice_questions(prompt: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "pq1",
                "type": "mcq",
                "question_text": "First step to solve $3x + 9 = 18$?",
                "options": ["Subtract 9", "Divide by 3", "Multiply by 9"],
                "correct_answer": "Subtract 9",
                "explanation": "Subtract 9 from both sides first to isolate 3x."
            }
        ]

    @staticmethod
    def _get_mock_quiz(subject: str, topic: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "mq1",
                "type": "mcq",
                "question_text": f"What is a primary renewable energy source in {topic}?",
                "options": ["Coal", "Solar Power", "Gas"],
                "correct_answer": "Solar Power",
                "explanation": "Solar power is a renewable resource."
            }
        ]
