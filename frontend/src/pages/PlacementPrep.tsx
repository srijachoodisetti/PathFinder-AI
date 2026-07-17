import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { Sparkles, FileText, CheckCircle, BrainCircuit, User, ArrowRight, ShieldAlert } from 'lucide-react';

export const PlacementPrep: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activePrepTab, setActivePrepTab] = useState<'aptitude' | 'resume' | 'interview'>('aptitude');
  
  // Resume state
  const [resumeText, setResumeText] = useState('');
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Interview Coach State
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [userResponse, setUserResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('Tell me about a challenging technical problem you solved.');
  const [lastFeedback, setLastFeedback] = useState('');
  const [lastScore, setLastScore] = useState<number | null>(null);

  const startInterview = async () => {
    setLoading(true);
    setChatHistory([]);
    setLastFeedback('');
    setLastScore(null);
    try {
      const res = await axios.post(`${API_URL}/ai/interview-coach`, {
        role: interviewRole,
        chat_history: [],
        user_response: ''
      }, { headers });
      setCurrentQuestion(res.data.next_question);
      setChatHistory([{ is_user: false, text: res.data.next_question }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userResponse.trim()) return;
    setLoading(true);
    const updatedHistory = [...chatHistory, { is_user: true, text: userResponse }];
    setChatHistory(updatedHistory);
    setUserResponse('');
    try {
      const res = await axios.post(`${API_URL}/ai/interview-coach`, {
        role: interviewRole,
        chat_history: updatedHistory,
        user_response: userResponse
      }, { headers });
      setLastFeedback(res.data.feedback);
      setLastScore(res.data.score_out_of_10);
      setCurrentQuestion(res.data.next_question);
      setChatHistory([...updatedHistory, { is_user: false, text: res.data.next_question }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reviewResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ai/review-resume`, {
        resume_text: resumeText
      }, { headers });
      setReviewResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-primary" size={32} />
            <span>Placement Preparation Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Practice Aptitude & Puzzles, review your resume with AI, and practice live mock interviews.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActivePrepTab('aptitude')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activePrepTab === 'aptitude' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Quantitative & Reasoning
        </button>
        <button
          onClick={() => setActivePrepTab('resume')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activePrepTab === 'resume' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI Resume Reviewer
        </button>
        <button
          onClick={() => setActivePrepTab('interview')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activePrepTab === 'interview' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI Interview Coach
        </button>
      </div>

      <div className="w-full">
        {activePrepTab === 'aptitude' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Syllabus of topics */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Aptitude Syllabus</h3>
              <div className="flex flex-col gap-3">
                {['Quantitative Aptitude', 'Logical Reasoning', 'Analytical Reasoning', 'Verbal Ability', 'Puzzle Solving', 'Data Interpretation'].map((t, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-700">{t}</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions center */}
            <div className="lg:col-span-8">
              <ClayCard className="flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-800">Mock Quiz: Profit, Loss & Discount</h3>
                  <span className="text-xs font-bold text-emerald-500">10 Questions</span>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-slate-400">QUESTION 1 OF 10</span>
                  <p className="font-bold text-sm text-slate-700 leading-relaxed">
                    A shopkeeper sells an article at a discount of 20% on the marked price and still makes a profit of 25%. If the cost price is ₹800, what is the marked price?
                  </p>
                  <div className="flex flex-col gap-2.5 mt-2">
                    {['₹1250', '₹1150', '₹1350', '₹1000'].map((opt, i) => (
                      <button key={i} className="w-full text-left p-3.5 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm cursor-pointer select-none">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activePrepTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Paste Resume Contents</h3>
              <ClayCard className="flex flex-col gap-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your plain text resume content here (Education, Experience, Projects, Skills)..."
                  className="w-full h-80 py-3 px-4 outline-none border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white text-sm font-mono text-slate-700"
                />
                <ClayButton
                  onClick={reviewResume}
                  disabled={loading || !resumeText.trim()}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-1"
                >
                  <Sparkles size={14} /> {loading ? 'Evaluating...' : 'Analyze Resume'}
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-7">
              {reviewResult ? (
                <ClayCard className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center font-heading font-extrabold text-2xl text-primary bg-primary/5">
                      {reviewResult.score}%
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">AI Scoring & Resume Analysis</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Scored against standard engineering templates.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2">Strengths</h4>
                      <ul className="list-disc pl-4 text-xs font-semibold text-emerald-700 flex flex-col gap-1.5">
                        {reviewResult.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                      <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2">Areas of Improvement</h4>
                      <ul className="list-disc pl-4 text-xs font-semibold text-amber-700 flex flex-col gap-1.5">
                        {reviewResult.weaknesses.map((weak: string, i: number) => <li key={i}>{weak}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Suggestions & Missing Skills</h4>
                    <div className="flex flex-col gap-3">
                      {reviewResult.suggestions.map((sug: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-slate-600 font-semibold">
                          <CheckCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                    {reviewResult.skill_gaps && reviewResult.skill_gaps.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Skill Gaps:</span>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {reviewResult.skill_gaps.map((sg: string, i: number) => (
                            <span key={i} className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                              {sg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ClayCard>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Paste your resume content in the left panel and click Analyze to view scores, strength matrices, and skill gaps.</ClayCard>
              )}
            </div>
          </div>
        )}

        {activePrepTab === 'interview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Setup Controls */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Interview</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput
                  label="Target Job Role"
                  value={interviewRole}
                  onChange={(e) => setInterviewRole(e.target.value)}
                />
                <ClayButton
                  onClick={startInterview}
                  disabled={loading}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm"
                >
                  Start New Interview
                </ClayButton>
              </ClayCard>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <ClayCard className="h-[450px] overflow-y-auto flex flex-col gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 m-auto text-center">Configure a job role and click Start Interview to begin simulating queries.</p>
                ) : (
                  chatHistory.map((h, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] p-4 rounded-2xl text-xs font-semibold leading-relaxed ${
                        h.is_user
                          ? 'bg-primary text-white self-end rounded-tr-none shadow-[2px_2px_8px_rgba(79,70,229,0.15)]'
                          : 'bg-white text-slate-700 border border-slate-100 self-start rounded-tl-none shadow-sm'
                      }`}
                    >
                      {h.text}
                    </div>
                  ))
                )}
              </ClayCard>

              {chatHistory.length > 0 && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    className="clay-input flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                  />
                  <ClayButton
                    onClick={submitAnswer}
                    disabled={loading || !userResponse.trim()}
                    className="bg-primary text-white hover:bg-secondary rounded-xl py-2 px-6 font-bold"
                  >
                    Submit Answer
                  </ClayButton>
                </div>
              )}

              {lastFeedback && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary">Interviewer Feedback</span>
                    {lastScore !== null && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Score: {lastScore}/10</span>}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1">{lastFeedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
