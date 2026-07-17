from app.core.database import Base
from app.models.user import User, Student, Teacher, Parent
from app.models.course import Course, Lesson
from app.models.quiz import Quiz, QuizResult
from app.models.activity import Message, Achievement, Notification
from app.models.engineering import (
    Department,
    Branch,
    Semester,
    Subject,
    Unit,
    Topic,
    TopicResource,
    VideoResource,
    CodingProgress,
    ProjectRecord,
    CertificateRecord,
    InternshipRecord,
    CareerRoadmap
)
from app.models.personalization import (
    LearningHistory,
    RecommendationRecord,
    StudentGoal,
    LearningAnalytic,
    RevisionSchedule,
    SkillProgress
)
from app.models.assessment import (
    QuestionBank,
    Exam,
    ExamQuestion,
    StudentExam,
    StudentAnswer,
    ExamResult,
    CodingSubmission,
    ExamAnalytics
)
from app.models.community import (
    Discussion,
    DiscussionReply,
    StudyGroup,
    StudyGroupMember,
    ProjectCollaboration,
    ProjectTask,
    ResourceLibrary,
    InterviewExperience,
    CampusEvent,
    Announcement
)
from app.models.career import (
    ResumeAnalysis,
    ATSFeedback,
    CareerSuggestion,
    ResumeHistory
)

__all__ = [
    "Base",
    "User",
    "Student",
    "Teacher",
    "Parent",
    "Course",
    "Lesson",
    "Quiz",
    "QuizResult",
    "Message",
    "Achievement",
    "Notification",
    "Department",
    "Branch",
    "Semester",
    "Subject",
    "Unit",
    "Topic",
    "TopicResource",
    "VideoResource",
    "CodingProgress",
    "ProjectRecord",
    "CertificateRecord",
    "InternshipRecord",
    "CareerRoadmap",
    "LearningHistory",
    "RecommendationRecord",
    "StudentGoal",
    "LearningAnalytic",
    "RevisionSchedule",
    "SkillProgress",
    "QuestionBank",
    "Exam",
    "ExamQuestion",
    "StudentExam",
    "StudentAnswer",
    "ExamResult",
    "CodingSubmission",
    "ExamAnalytics",
    "Discussion",
    "DiscussionReply",
    "StudyGroup",
    "StudyGroupMember",
    "ProjectCollaboration",
    "ProjectTask",
    "ResourceLibrary",
    "InterviewExperience",
    "CampusEvent",
    "Announcement",
    "ResumeAnalysis",
    "ATSFeedback",
    "CareerSuggestion",
    "ResumeHistory"
]
