import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import {
  Users,
  FileText,
  PlusCircle,
  Sparkles,
  Award,
  BookOpen,
  Mail,
  UserCheck,
  Search,
  Activity,
  RefreshCw,
  Sliders,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Lesson Plan state
  const [planYear, setPlanYear] = useState('2nd Year');
  const [planSubject, setPlanSubject] = useState('Science');
  const [planTopic, setPlanTopic] = useState('');
  const [planDuration, setPlanDuration] = useState(45);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Quiz Builder state
  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubject, setQuizSubject] = useState('Science');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestionsCount, setQuizQuestionsCount] = useState(5);
  const [quizStatus, setQuizStatus] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const [activeTab, setActiveTab] = useState<'roster' | 'lesson_plan' | 'quiz_builder'>('roster');

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const studRes = await axios.get(`${API_URL}/teacher/students`);
      setStudents(studRes.data);

      const analRes = await axios.get(`${API_URL}/teacher/cohort-analytics`);
      setAnalytics(analRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!planTopic.trim()) return;
    setGeneratingPlan(true);
    setGeneratedPlan(null);
    try {
      const res = await axios.post(`${API_URL}/tutor/lesson-plan`, {
        year: planYear,
        subject: planSubject,
        topic: planTopic,
        duration_minutes: planDuration
      });
      setGeneratedPlan(res.data.plan_markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setGeneratingQuiz(true);
    setQuizStatus(null);
    try {
      await axios.post(`${API_URL}/quizzes/generate`, {
        subject: quizSubject,
        topic: quizTopic,
        title: quizTitle || `AI generated: ${quizTopic}`,
        count: quizQuestionsCount
      });
      setQuizStatus("Quiz generated and saved successfully! ✓");
      setQuizTopic('');
      setQuizTitle('');
    } catch (err) {
      console.error(err);
      setQuizStatus("Error creating AI quiz.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Recharts bar data distribution
  const chartData = [
    { range: '0-50%', count: 1 },
    { range: '50-60%', count: 2 },
    { range: '60-70%', count: 4 },
    { range: '70-80%', count: 6 },
    { range: '80-90%', count: 8 },
    { range: '90-100%', count: 3 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left font-body">
      
      {/* Top Banner */}
      <ClayCard className="p-6 bg-gradient-to-r from-primary/10 to-white flex justify-between items-center">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-text">Educator Dashboard 👩‍🏫</h2>
          <p className="text-sm text-text/60">
            Assigned Specialist: <strong className="text-primary">{user?.teacher_profile?.subject_specialization || 'Science & Mathematics'}</strong>
          </p>
        </div>
      </ClayCard>

      {/* Class Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Managed Students</span>
            <span className="text-2xl font-extrabold text-primary">{analytics.total_students}</span>
          </ClayCard>
          
          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Average Score</span>
            <span className="text-2xl font-extrabold text-secondary">{analytics.average_quiz_score}%</span>
          </ClayCard>

          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Attendance Rate</span>
            <span className="text-2xl font-extrabold text-success">{analytics.average_attendance}%</span>
          </ClayCard>

          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Students At Risk</span>
            <span className="text-2xl font-extrabold text-danger">{analytics.students_at_risk}</span>
          </ClayCard>
        </div>
      )}

      {/* Main Tab selectors */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('roster')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-text/50'}`}
        >
          Roster & Insights
        </button>
        <button
          onClick={() => setActiveTab('lesson_plan')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'lesson_plan' ? 'border-primary text-primary' : 'border-transparent text-text/50'}`}
        >
          AI Lesson Planner
        </button>
        <button
          onClick={() => setActiveTab('quiz_builder')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'quiz_builder' ? 'border-primary text-primary' : 'border-transparent text-text/50'}`}
        >
          AI Quiz Builder
        </button>
      </div>

      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Student Grids */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ClayCard className="p-4 overflow-hidden border border-slate-100 bg-white">
              <h3 className="font-heading font-bold text-sm border-b pb-3 mb-4">Student Roster</h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b text-text/55">
                      <th className="pb-2 font-bold uppercase pl-2">Name</th>
                      <th className="pb-2 font-bold uppercase">XP Points</th>
                      <th className="pb-2 font-bold uppercase">Streak</th>
                      <th className="pb-2 font-bold uppercase">Weak Topic Warning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 pl-2 font-bold text-text/80">{student.full_name}</td>
                        <td className="py-3 font-bold text-success">{student.xp_points} XP</td>
                        <td className="py-3 font-bold text-danger">{student.streak} Days</td>
                        <td className="py-3">
                          {student.weak_topics ? (
                            <span className="bg-red-50 text-danger border border-red-100 rounded-full px-2.5 py-1 font-bold text-[9px]">
                              ⚠️ {student.weak_topics}
                            </span>
                          ) : (
                            <span className="bg-green-50 text-success border border-green-100 rounded-full px-2.5 py-1 font-bold text-[9px]">
                              ✓ Exceeding Goals
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ClayCard>

            {/* Score Distribution Chart */}
            <ClayCard className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-sm border-b pb-2">Cohort Score Distribution</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>
          </div>

          {/* AI Risk Prediction & Class Comparison */}
          <div className="flex flex-col gap-6">
            <ClayCard className="flex flex-col gap-3 bg-red-50/15 border-red-200/50">
              <h4 className="font-heading font-bold text-sm text-danger flex items-center gap-1.5 border-b pb-2">
                <AlertTriangle size={16} />
                Drop-off Risk Predictions
              </h4>
              <p className="text-xs text-text/60">AI warning models flagging low study activity:</p>

              <div className="flex flex-col gap-2">
                <div className="p-3 bg-white border border-red-100 rounded-2xl text-xs flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold">Student User</span>
                    <span className="text-[10px] text-text/40">XP drop this week</span>
                  </div>
                  <span className="bg-danger text-white text-[9px] font-bold py-1 px-2.5 rounded-full">
                    High Risk
                  </span>
                </div>
              </div>
            </ClayCard>

            <ClayCard className="flex flex-col gap-3">
              <h4 className="font-heading font-bold text-sm text-text/80 border-b pb-2">
                Cohort Activity Comparison
              </h4>
              <div className="flex flex-col gap-2 text-xs leading-relaxed font-medium text-text/75">
                <div className="flex justify-between">
                  <span>2nd Year Science:</span>
                  <span className="font-bold text-success">84.2% Avg</span>
                </div>
                <div className="flex justify-between">
                  <span>2nd Year Math:</span>
                  <span className="font-bold text-primary">78.5% Avg</span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {activeTab === 'lesson_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClayCard className="flex flex-col gap-4">
            <h4 className="font-heading font-extrabold text-sm border-b pb-2 flex items-center gap-1">
              <Sparkles size={16} className="text-primary animate-pulse" />
              Lesson Configurations
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text/85">Subject</label>
              <select
                value={planSubject}
                onChange={(e) => setPlanSubject(e.target.value)}
                className="clay-input text-xs font-semibold !py-2 bg-slate-50 cursor-pointer"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text/85">Year Level</label>
              <select
                value={planYear}
                onChange={(e) => setPlanYear(e.target.value)}
                className="clay-input text-xs font-semibold !py-2 bg-slate-50 cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text/85">Topic Name</label>
              <input
                type="text"
                placeholder="e.g. Fraction Addition"
                value={planTopic}
                onChange={(e) => setPlanTopic(e.target.value)}
                className="clay-input text-xs font-semibold bg-slate-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text/85">Duration (Minutes)</label>
              <input
                type="number"
                value={planDuration}
                onChange={(e) => setPlanDuration(parseInt(e.target.value))}
                className="clay-input text-xs font-semibold bg-slate-50"
              />
            </div>

            <ClayButton
              onClick={handleGeneratePlan}
              variant="primary"
              className="flex items-center justify-center gap-1.5 !py-2.5 mt-2 shadow-md"
              disabled={generatingPlan || !planTopic.trim()}
            >
              <Sparkles size={16} />
              <span>{generatingPlan ? 'Generating Plan...' : 'Generate Plan with AI'}</span>
            </ClayButton>
          </ClayCard>

          <div className="lg:col-span-2">
            <ClayCard className="h-full flex flex-col min-h-64">
              <h3 className="font-heading font-extrabold text-sm border-b pb-2 mb-4">
                Generated Plan Preview
              </h3>
              {generatingPlan ? (
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <SkeletonLoader lines={5} />
                </div>
              ) : generatedPlan ? (
                <div className="flex-1 text-left whitespace-pre-line font-medium text-slate-800 max-w-none overflow-y-auto max-h-[400px]">
                  {generatedPlan}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-text/40 gap-1.5">
                  <FileText size={40} />
                  <span className="text-xs font-semibold">Configure details and click generate to render AI plan.</span>
                </div>
              )}
            </ClayCard>
          </div>
        </div>
      )}

      {activeTab === 'quiz_builder' && (
        <div className="max-w-xl mx-auto w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateQuiz(); }}>
            <ClayCard className="flex flex-col gap-4 shadow-lg border border-slate-100">
              <h3 className="font-heading font-extrabold text-base border-b pb-2 flex items-center gap-1.5">
                <PlusCircle size={18} className="text-primary animate-pulse" />
                AI-Generated Quiz Builder
              </h3>

              {quizStatus && <ClayAlert variant="info">{quizStatus}</ClayAlert>}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text/85">Subject Area</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="clay-input text-xs font-semibold !py-2 bg-slate-50 cursor-pointer"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text/85">Topic Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Fraction Division"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="clay-input text-xs font-semibold bg-slate-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text/85">Quiz Title</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="clay-input text-xs font-semibold bg-slate-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text/85">Questions Count</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={quizQuestionsCount}
                  onChange={(e) => setQuizQuestionsCount(parseInt(e.target.value))}
                  className="clay-input text-xs font-semibold bg-slate-50"
                />
              </div>

              <ClayButton
                type="submit"
                variant="primary"
                className="flex items-center justify-center gap-1.5 !py-2.5 mt-2"
                disabled={generatingQuiz || !quizTopic.trim()}
              >
                <Sparkles size={16} />
                <span>{generatingQuiz ? 'Generating AI Questions...' : 'Build AI Quiz'}</span>
              </ClayButton>
            </ClayCard>
          </form>
        </div>
      )}
    </div>
  );
};
