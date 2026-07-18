import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import {
  Award,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Check,
  X
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { isOnline, queueQuizAttempt } = useOfflineStore();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Play states
  const [playing, setPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codingAnswer, setCodingAnswer] = useState('');
  
  // Difficulty & Timing
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Result states
  const [result, setResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [offlineCompleted, setOfflineCompleted] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      handleNext(); // auto skip/submit when time runs out
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/quizzes`);
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlay = (quiz: any) => {
    setSelectedQuiz(quiz);
    setPlaying(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCodingAnswer('');
    setResult(null);
    setOfflineCompleted(false);
    
    // Configure countdown timer based on difficulty
    const timeLimit = difficulty === 'easy' ? 90 : difficulty === 'medium' ? 60 : 30;
    setTimerSeconds(timeLimit);
    setTimerActive(true);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (!selectedQuiz) return;
    const q = selectedQuiz.questions[currentQuestionIndex];
    if (q.type === 'coding') {
      setAnswers(prev => ({
        ...prev,
        [q.id]: codingAnswer
      }));
    }
    
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const timeLimit = difficulty === 'easy' ? 90 : difficulty === 'medium' ? 60 : 30;
      setTimerSeconds(timeLimit);
    } else {
      setTimerActive(false);
      submitQuizAnswers();
    }
  };

  const submitQuizAnswers = async () => {
    if (!selectedQuiz) return;
    setSubmitting(true);

    let correctCount = 0;
    const totalQuestions = selectedQuiz.questions.length;
    
    selectedQuiz.questions.forEach((q: any) => {
      const studentAns = answers[q.id]?.trim().toLowerCase();
      const correctAns = q.correct_answer?.trim().toLowerCase();
      if (studentAns && correctAns && studentAns === correctAns) {
        correctCount += 1;
      }
    });
    
    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);

    if (!isOnline) {
      queueQuizAttempt(selectedQuiz.id, calculatedScore, answers);

      setSubmitting(false);
      setPlaying(false);
      setOfflineCompleted(true);
      
      if (user && user.student_profile && calculatedScore >= 50) {
        const addedXp = Math.round(selectedQuiz.xp_reward * (calculatedScore / 100));
        setUser({
          ...user,
          student_profile: {
            ...user.student_profile,
            xp_points: user.student_profile.xp_points + addedXp
          }
        });
      }
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/quizzes/${selectedQuiz.id}/submit`, {
        quiz_id: selectedQuiz.id,
        score: calculatedScore,
        answers: answers
      });

      
      setResult(res.data);
      setPlaying(false);
      
      if (user && user.student_profile && calculatedScore >= 50) {
        const addedXp = Math.round(selectedQuiz.xp_reward * (calculatedScore / 100));
        setUser({
          ...user,
          student_profile: {
            ...user.student_profile,
            xp_points: user.student_profile.xp_points + addedXp
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left font-body">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b pb-3.5 flex-wrap gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading font-extrabold text-2xl text-text">Quiz Center</h2>
          <p className="text-xs text-text/60">Practice concepts, earn XP points, and climb the leaderboard.</p>
        </div>

        {/* Difficulty Selectors */}
        {!playing && !result && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm text-xs font-bold">
            <span className="text-text/50 px-2">Quiz Speed:</span>
            {['easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d as any)}
                className={`py-1 px-3.5 rounded-full capitalize select-none ${difficulty === d ? 'bg-primary text-white' : 'text-text/70 hover:bg-slate-50'}`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {offlineCompleted && (
        <ClayAlert variant="success">
          <span>
            <strong>Quiz completed offline! ✓</strong> Your score was stored locally. Profiles XP points are updated and will sync on internet reconnection.
          </span>
        </ClayAlert>
      )}

      {/* Quiz Player */}
      {playing && selectedQuiz ? (
        <div className="max-w-2xl mx-auto w-full">
          <ClayCard className="flex flex-col gap-6 shadow-lg">
            
            {/* Countdown timer & progress */}
            <div className="flex justify-between items-center border-b pb-3 text-xs font-semibold text-text/50">
              <span className="flex items-center gap-1 text-primary">
                <Clock size={14} className="animate-spin" />
                Time Remaining: <strong className={timerSeconds < 10 ? 'text-danger font-extrabold' : ''}>{timerSeconds}s</strong>
              </span>
              <span>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              />
            </div>

            <div className="flex flex-col gap-4 text-left">
              <h3 className="font-heading font-extrabold text-lg text-text">
                {selectedQuiz.questions[currentQuestionIndex].question_text}
              </h3>

              {/* MCQ Options */}
              {selectedQuiz.questions[currentQuestionIndex].type === 'mcq' && (
                <div className="flex flex-col gap-2.5 mt-2">
                  {selectedQuiz.questions[currentQuestionIndex].options.map((opt: string, i: number) => {
                    const isSelected = answers[selectedQuiz.questions[currentQuestionIndex].id] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(selectedQuiz.questions[currentQuestionIndex].id, opt)}
                        className={`w-full p-4 rounded-2xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {selectedQuiz.questions[currentQuestionIndex].type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {['True', 'False'].map((opt) => {
                    const isSelected = answers[selectedQuiz.questions[currentQuestionIndex].id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(selectedQuiz.questions[currentQuestionIndex].id, opt)}
                        className={`p-4 rounded-2xl border text-xs font-semibold text-center transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill blanks */}
              {selectedQuiz.questions[currentQuestionIndex].type === 'fill_in_the_blanks' && (
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answers[selectedQuiz.questions[currentQuestionIndex].id] || ''}
                  onChange={(e) => handleSelectOption(selectedQuiz.questions[currentQuestionIndex].id, e.target.value)}
                  className="clay-input w-full mt-2"
                />
              )}

              {/* Short Answer */}
              {selectedQuiz.questions[currentQuestionIndex].type === 'short_answer' && (
                <textarea
                  placeholder="Explain briefly in your own words..."
                  value={answers[selectedQuiz.questions[currentQuestionIndex].id] || ''}
                  onChange={(e) => handleSelectOption(selectedQuiz.questions[currentQuestionIndex].id, e.target.value)}
                  className="clay-input w-full h-24 resize-none mt-2"
                />
              )}

              {/* Coding Prompt */}
              {selectedQuiz.questions[currentQuestionIndex].type === 'coding' && (
                <div className="flex flex-col gap-2.5 mt-2 w-full">
                  <span className="text-xs font-bold text-text/60">Write Python Code:</span>
                  <textarea
                    placeholder="def my_function(x):..."
                    value={codingAnswer}
                    onChange={(e) => setCodingAnswer(e.target.value)}
                    className="clay-input w-full h-32 font-mono text-xs bg-slate-900 text-green-400 border-none resize-none p-3 shadow-inner rounded-2xl focus:ring-0"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <ClayButton
                onClick={handleNext}
                variant="primary"
                className="flex items-center gap-1.5 !py-2.5 px-6"
                disabled={submitting}
              >
                <span>{currentQuestionIndex === selectedQuiz.questions.length - 1 ? (submitting ? 'Submitting...' : 'Submit Answers') : 'Next Question'}</span>
                <ArrowRight size={14} />
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      ) : result ? (
        /* Results & Wrong Answer Review View */
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          <ClayCard className="p-6 text-center flex flex-col items-center gap-4 shadow-lg border border-slate-100 bg-white">
            <span className="text-5xl">🏆</span>
            <h3 className="font-heading font-extrabold text-2xl text-text">Quiz Results</h3>
            
            <div className="flex gap-6 mt-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-primary">{result.score}%</span>
                <span className="text-[10px] text-text/50 font-semibold uppercase">Passing Score: 50%</span>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-success">
                  +{result.score >= 50 ? Math.round(result.quiz.xp_reward * (result.score / 100)) : 0} XP
                </span>
                <span className="text-[10px] text-text/50 font-semibold uppercase">Earned Reward</span>
              </div>
            </div>

            <p className="text-xs text-text/60 leading-normal max-w-sm mt-2 font-medium">
              {result.score >= 50
                ? "Excellent job! You passed the challenge. Your new XP points have been added to your profile."
                : "You did not pass this attempt. Go back to study notes and ask the AI Tutor to clarify concepts!"
              }
            </p>
          </ClayCard>

          {/* AI Wrong Answer Analysis list */}
          {result.wrong_answers_analysis && result.wrong_answers_analysis.length > 0 && (
            <div className="flex flex-col gap-4 text-left">
              <h3 className="font-heading font-bold text-sm px-1 flex items-center gap-1.5 text-text/80">
                <Sparkles size={16} className="text-primary animate-pulse" />
                AI Wrong Answer Corrections Review
              </h3>

              <div className="flex flex-col gap-3.5">
                {result.wrong_answers_analysis.map((wa: any, i: number) => (
                  <ClayCard key={i} className="border-l-4 border-l-danger p-4 flex flex-col gap-2.5 bg-red-50/10">
                    <h4 className="font-bold text-xs text-text/80">
                      Question: "{wa.question_text}"
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                      <div className="p-2 bg-red-50 text-danger border border-red-100 rounded-xl flex items-center gap-1.5">
                        <X size={12} />
                        <span>Your Answer: "{wa.your_answer}"</span>
                      </div>
                      <div className="p-2 bg-green-50 text-success border border-green-100 rounded-xl flex items-center gap-1.5">
                        <Check size={12} />
                        <span>Correct: "{wa.correct_answer}"</span>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-text/60 mt-1 border-t pt-2.5 font-medium">
                      <strong>AI Explanation:</strong> {wa.explanation}
                    </p>
                  </ClayCard>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full mt-2">
            <ClayButton
              onClick={() => handleStartPlay(selectedQuiz)}
              className="flex-1 !py-2.5 text-xs font-bold border-slate-200 bg-white"
            >
              Retry Quiz
            </ClayButton>
            <ClayButton
              onClick={() => {
                setResult(null);
                setSelectedQuiz(null);
              }}
              variant="primary"
              className="flex-1 !py-2.5 text-xs font-bold"
            >
              Back to Center
            </ClayButton>
          </div>
        </div>
      ) : (
        /* Quiz catalog Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <ClayCard key={quiz.id} className="flex flex-col gap-4 justify-between hover:scale-[1.01] transition-transform">
              <div className="flex flex-col gap-1.5 text-left">
                <div className="w-9 h-9 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">
                  🧩
                </div>
                <h3 className="font-heading font-extrabold text-sm text-text truncate mt-1">
                  {quiz.title}
                </h3>
                <p className="text-[10px] text-text/50 font-semibold">
                  Contains {quiz.questions.length} problems • Difficulty: <span className="capitalize text-primary font-bold">{difficulty}</span>
                </p>
              </div>

              <div className="flex justify-between items-center border-t pt-3.5">
                <span className="text-[10px] text-success font-extrabold flex items-center gap-0.5">
                  ★ Reward: {quiz.xp_reward} XP
                </span>
                
                <ClayButton
                  onClick={() => handleStartPlay(quiz)}
                  variant="primary"
                  className="!py-1.5 !px-4 text-[10px] font-bold shadow-sm"
                >
                  Start Quiz
                </ClayButton>
              </div>
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  );
};
