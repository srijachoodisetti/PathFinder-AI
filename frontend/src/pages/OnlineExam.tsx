import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton } from '../components/ui';
import { Timer, ArrowLeft, ArrowRight, Bookmark, CheckCircle, Lock } from 'lucide-react';

export const OnlineExam: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const fetchExamDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/assessment/exams/${examId}`, { headers });
      setExam(res.data);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.time_limit_minutes * 60);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (qId: number, option: string) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const toggleBookmark = (idx: number) => {
    if (bookmarked.includes(idx)) {
      setBookmarked(bookmarked.filter(i => i !== idx));
    } else {
      setBookmarked([...bookmarked, idx]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          question_id: parseInt(qId),
          answered_text: answers[parseInt(qId)]
        }))
      };
      const res = await axios.post(`${API_URL}/assessment/exams/${examId}/submit`, payload, { headers });
      // Navigate to detailed result review
      navigate(`/exam/result/${res.data.student_exam_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left">
        <h3 className="text-slate-400">Loading exam payload...</h3>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left font-body">
      {/* Header Info */}
      <div className="p-6 bg-slate-900 rounded-[24px] text-white flex justify-between items-center shadow-lg">
        <div>
          <h2 className="font-heading font-extrabold text-xl">{exam.title}</h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-1">{exam.exam_type} mode</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm font-bold">
          <Timer size={16} className="animate-pulse" />
          <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Sheet */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {currentQuestion ? (
            <ClayCard className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                <button onClick={() => toggleBookmark(currentIndex)} className={`text-xs font-bold flex items-center gap-1 ${
                  bookmarked.includes(currentIndex) ? 'text-primary' : 'text-slate-400'
                }`}>
                  <Bookmark size={14} fill={bookmarked.includes(currentIndex) ? 'currentColor' : 'none'} />
                  <span>Bookmark</span>
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-800 leading-relaxed mt-2">
                {currentQuestion.question_text}
              </h3>

              {/* MCQs options */}
              {currentQuestion.type === 'mcq' && currentQuestion.options && (
                <div className="flex flex-col gap-3 mt-4">
                  {currentQuestion.options.map((opt: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(currentQuestion.id, opt)}
                      className={`w-full py-3 px-5 text-left text-xs font-bold rounded-2xl border transition-all ${
                        answers[currentQuestion.id] === opt
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Coding type compiler/editor inputs */}
              {currentQuestion.type === 'coding' && (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>Sample Input: <code className="block mt-1 bg-white p-2 border rounded">{currentQuestion.sample_input}</code></div>
                    <div>Sample Output: <code className="block mt-1 bg-white p-2 border rounded">{currentQuestion.sample_output}</code></div>
                  </div>
                  <textarea
                    placeholder="Write your solution here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                    className="w-full h-64 p-4 mt-2 border border-slate-100 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-6 border-t border-slate-100 pt-4">
                <ClayButton
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl py-2 px-5 font-bold text-xs flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </ClayButton>

                {currentIndex < questions.length - 1 ? (
                  <ClayButton
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="bg-primary text-white hover:bg-secondary rounded-xl py-2 px-5 font-bold text-xs flex items-center gap-1"
                  >
                    Next <ArrowRight size={14} />
                  </ClayButton>
                ) : (
                  <ClayButton
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl py-2 px-6 font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle size={14} /> {submitting ? 'Submitting...' : 'Submit Exam'}
                  </ClayButton>
                )}
              </div>
            </ClayCard>
          ) : (
            <div className="text-slate-400 py-16 text-center font-semibold">No questions found.</div>
          )}
        </div>

        {/* Right Navigation sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <ClayCard className="p-5">
            <h3 className="font-bold text-sm text-slate-700 mb-4">Question Directory</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs border flex items-center justify-center transition-all ${
                    currentIndex === idx
                      ? 'bg-primary border-primary text-white'
                      : bookmarked.includes(idx)
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : answers[questions[idx].id]
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-primary rounded-md inline-block" /> Active Question
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-emerald-50 border border-emerald-200 rounded-md inline-block" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-amber-100 border border-amber-300 rounded-md inline-block" /> Bookmarked
              </div>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
