import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect } from '../components/ui';
import { FilePlus2, Sparkles, PlusCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const ExamBuilder: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'create' | 'generate'>('create');
  
  // Create Exam States
  const [examTitle, setExamTitle] = useState('DBMS Normalization Midterm');
  const [examType, setExamType] = useState('unit');
  const [timeLimit, setTimeLimit] = useState('60');
  const [negativeMarking, setNegativeMarking] = useState('0.25');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([1, 2]);

  // AI Generation States
  const [subject, setSubject] = useState('Database Management Systems');
  const [unit, setUnit] = useState('Unit 3');
  const [topic, setTopic] = useState('Normalization');
  const [difficulty, setDifficulty] = useState('Medium');
  const [qType, setQType] = useState('mcq');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleCreateExam = async () => {
    try {
      await axios.post(`${API_URL}/assessment/faculty/create-exam`, {
        title: examTitle,
        exam_type: examType,
        time_limit_minutes: parseInt(timeLimit) || 60,
        negative_marking: parseFloat(negativeMarking) || 0.0,
        random_questions: false,
        is_active: true,
        question_ids: selectedQuestions
      }, { headers });
      alert("Exam created successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setGeneratedQuestions([]);
    try {
      const res = await axios.post(`${API_URL}/ai/generate-questions`, {
        subject,
        unit,
        topic,
        difficulty,
        question_type: qType
      }, { headers });
      setGeneratedQuestions(res.data);
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
            <FilePlus2 className="text-primary" size={32} />
            <span>Faculty Exam Builder</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Design custom exams, set time boundaries, and generate curriculum-aligned test questions dynamically with AI.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'create' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Create Exam Paper
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'generate' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI Question Generator
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Exam Properties</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Exam Title" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                    >
                      <option value="unit">Unit Test</option>
                      <option value="internal">Internal Exam</option>
                      <option value="semester">Semester Mock</option>
                      <option value="placement">Placement Mock</option>
                      <option value="coding">Coding Contest</option>
                      <option value="lab">Lab Assessment</option>
                    </select>
                  </div>
                  <ClayInput label="Time Limit (Minutes)" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                </div>
                <ClayInput label="Negative Marks per Wrong Answer" value={negativeMarking} onChange={(e) => setNegativeMarking(e.target.value)} />
                <ClayButton onClick={handleCreateExam} className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-xs mt-2">
                  Create Exam Paper
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Map Question IDs</h3>
              <ClayCard className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>DBMS Data Independence MCQ (ID: 1)</span>
                    <span className="text-[10px] font-bold text-emerald-600">Selected</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Python Reverse String coding (ID: 2)</span>
                    <span className="text-[10px] font-bold text-emerald-600">Selected</span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Target Topic</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Subject Name" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <ClayInput label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                <ClayInput label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Question Type</label>
                    <select
                      value={qType}
                      onChange={(e) => setQType(e.target.value)}
                      className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="coding">Coding Challenge</option>
                      <option value="short">Descriptive Short Answer</option>
                      <option value="numerical">Numerical Problem</option>
                    </select>
                  </div>
                </div>

                <ClayButton
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles size={14} /> {loading ? 'Drafting Questions...' : 'Generate Questions'}
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-7">
              {generatedQuestions.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-base text-slate-700 pl-1">Generated Drafts</h3>
                  {generatedQuestions.map((q, i) => (
                    <ClayCard key={i} className="flex flex-col gap-3">
                      <h4 className="font-bold text-sm text-slate-800 leading-relaxed">{q.question_text}</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong>Expected Answer:</strong> {q.correct_answer}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">Explanation: {q.explanation}</span>
                    </ClayCard>
                  ))}
                </div>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Click Generate to build custom questions for normal forms or coding tests via Gemini.</ClayCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
