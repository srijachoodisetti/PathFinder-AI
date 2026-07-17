import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { firestoreService } from '../services/firestoreService';
import { analytics } from '../lib/firebase';
import { logEvent } from 'firebase/analytics';
import { ClayCard, ClayButton, ClayAlert, ClayInput, SkeletonLoader } from '../components/ui';
import {
  Flame,
  Compass,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Calendar as CalendarIcon,
  Smile,
  Target,
  Bell,
  CheckCircle,
  FileText,
  AlertTriangle,
  Code,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const { isOnline, queuedQuizzes, syncPendingData } = useOfflineStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journey' | 'analytics' | 'pomo'>('journey');

  // Personalization Engine States
  const [journeyData, setJourneyData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [revisionSchedule, setRevisionSchedule] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  
  // Goals Config States
  const [editingGoals, setEditingGoals] = useState(false);
  const [targetCgpa, setTargetCgpa] = useState('8.5');
  const [dailyHours, setDailyHours] = useState('2.0');
  const [weeklyXp, setWeeklyXp] = useState('300');

  // AI revision note state
  const [aiNotes, setAiNotes] = useState('');
  const [aiNotesLoading, setAiNotesLoading] = useState(false);

  // Leaderboard & Achievements (Maintained from existing)
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [motivation, setMotivation] = useState("Keep studying to make an impact! 🌱");

  // Pomodoro states
  const [pomoTime, setPomoTime] = useState(1500);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoSession, setPomoSession] = useState<'study' | 'break'>('study');

  useEffect(() => {
    fetchPersonalizationData();
    fetchLeaderboardAndAchievements();
    if (analytics) {
      logEvent(analytics, 'login', { method: 'email', screen: 'student_dashboard' });
    }
  }, []);

  // Pomodoro ticker logic
  useEffect(() => {
    let interval: any = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime((t) => t - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      handlePomoFinish();
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const fetchPersonalizationData = async () => {
    setLoading(true);
    try {
      const journeyRes = await axios.get(`${API_URL}/personalization/learning-journey`, { headers });
      setJourneyData(journeyRes.data);
      setTargetCgpa(journeyRes.data.goals.target_cgpa || '8.5');
      setDailyHours(journeyRes.data.goals.daily_target.toString() || '2.0');
      setWeeklyXp(journeyRes.data.goals.weekly_xp_target.toString() || '300');

      const recRes = await axios.get(`${API_URL}/personalization/recommendations`, { headers });
      setRecommendations(recRes.data);

      const pathRes = await axios.get(`${API_URL}/personalization/learning-paths`, { headers });
      setLearningPaths(pathRes.data);

      const weakRes = await axios.get(`${API_URL}/personalization/weak-topics`, { headers });
      setWeakTopics(weakRes.data);

      const revRes = await axios.get(`${API_URL}/personalization/revision-schedule`, { headers });
      setRevisionSchedule(revRes.data);

      const analyticsRes = await axios.get(`${API_URL}/personalization/analytics`, { headers });
      setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error("Personalization loading error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardAndAchievements = async () => {
    try {
      const leadRes = await axios.get(`${API_URL}/quizzes/analytics/leaderboard`, { headers });
      setLeaderboard(leadRes.data);
      const achRes = await axios.get(`${API_URL}/student/achievements`, { headers });
      setAchievements(achRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGoals = async () => {
    try {
      const res = await axios.post(`${API_URL}/personalization/goals`, {
        target_cgpa: parseFloat(targetCgpa) || 8.5,
        daily_study_hours: parseFloat(dailyHours) || 2.0,
        weekly_xp_goal: parseInt(weeklyXp) || 300,
        monthly_cert_goal: 2
      }, { headers });
      setJourneyData({
        ...journeyData,
        goals: {
          daily_target: res.data.daily_study_hours,
          weekly_xp_target: res.data.weekly_xp_goal,
          completed_today_hours: journeyData.goals.completed_today_hours
        }
      });
      setEditingGoals(false);
    } catch (err) {
      console.error(err);
    }
  };

  const generateRevisionNotes = async (topicName: string) => {
    setAiNotesLoading(true);
    setAiNotes('');
    try {
      const res = await axios.post(`${API_URL}/ai/generate-notes`, {
        subject: "Database Management Systems",
        topic: topicName,
        note_type: "revision"
      }, { headers });
      setAiNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setAiNotesLoading(false);
    }
  };

  const togglePomo = () => setPomoActive(!pomoActive);
  
  const resetPomo = () => {
    setPomoActive(false);
    setPomoTime(pomoSession === 'study' ? 1500 : 300);
  };

  const handlePomoFinish = () => {
    setPomoActive(false);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        pomoSession === 'study' ? "Study session finished! Take a break." : "Break finished! Let's study."
      );
      window.speechSynthesis.speak(utterance);
    }
    if (pomoSession === 'study') {
      setPomoSession('break');
      setPomoTime(300);
    } else {
      setPomoSession('study');
      setPomoTime(1500);
    }
  };

  const formatPomoTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 text-left">
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left font-body">
      {/* Offline warning */}
      {queuedQuizzes.length > 0 && (
        <ClayAlert variant="warning" className="flex justify-between items-center">
          <div><span className="font-bold">Offline Sync pending:</span> You have {queuedQuizzes.length} offline attempts.</div>
        </ClayAlert>
      )}

      {/* Notifications Bar */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Bell size={18} className="animate-swing" />
        </div>
        <div className="flex-1 flex flex-col text-left">
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">AI Recommendation Reminder</span>
          <p className="text-xs font-semibold text-slate-700">
            {journeyData?.today_recommendation}
          </p>
        </div>
      </div>

      {/* Welcome Banner */}
      <ClayCard className="p-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="flex flex-col gap-1 z-10">
          <h2 className="font-heading font-extrabold text-2xl text-slate-800">Welcome, {user?.full_name}! 🚀</h2>
          <p className="text-sm text-slate-500 font-medium">
            Semester: <strong className="text-primary">Sem 5</strong> | Branch: <strong className="text-primary">CSE</strong> | Target CGPA: <strong className="text-secondary">{targetCgpa}</strong>
          </p>
        </div>
        <div className="flex gap-3 z-10">
          <ClayButton onClick={() => setActiveTab('journey')} className={`text-xs py-2 ${activeTab === 'journey' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600'}`}>
            Learning Journey
          </ClayButton>
          <ClayButton onClick={() => setActiveTab('analytics')} className={`text-xs py-2 ${activeTab === 'analytics' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600'}`}>
            Analytics & Progress
          </ClayButton>
          <ClayButton onClick={() => setActiveTab('pomo')} className={`text-xs py-2 ${activeTab === 'pomo' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600'}`}>
            Pomodoro Study Timer
          </ClayButton>
        </div>
      </ClayCard>

      {/* Tab Views */}
      <div className="w-full">
        {activeTab === 'journey' && journeyData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Section (Recommendations & Learning Paths) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* My AI Learning Journey Panel */}
              <ClayCard className="flex flex-col gap-4">
                <h3 className="font-heading font-extrabold text-lg text-slate-800 border-b pb-2">My AI Learning Journey</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Continue Learning */}
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Continue Learning</span>
                      <h4 className="font-bold text-sm text-slate-700 mt-1">{journeyData.continue_learning.topic}</h4>
                      <p className="text-xs text-slate-400">{journeyData.continue_learning.subject}</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{journeyData.continue_learning.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${journeyData.continue_learning.completion_percentage}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Goals progress */}
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Study Hours Goal</span>
                      <h4 className="font-bold text-lg text-primary mt-1">{journeyData.goals.completed_today_hours} hrs / {journeyData.goals.daily_target} hrs</h4>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (journeyData.goals.completed_today_hours / journeyData.goals.daily_target) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Strong Subjects</span>
                    <ul className="list-disc pl-4 text-xs font-semibold text-emerald-700 mt-1.5 flex flex-col gap-1">
                      {journeyData.strong_subjects.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-left">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Weak Subjects</span>
                    <ul className="list-disc pl-4 text-xs font-semibold text-rose-700 mt-1.5 flex flex-col gap-1">
                      {journeyData.weak_subjects.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </ClayCard>

              {/* Learning Path roadmaps */}
              <ClayCard className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <Compass size={18} className="text-primary" /> Learning Path Roadmaps
                </h3>
                <div className="flex flex-col gap-3">
                  {learningPaths.map((lp) => (
                    <div key={lp.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{lp.level}</span>
                        <h4 className="font-bold text-sm text-slate-700 mt-1.5">{lp.topic}</h4>
                        <span className="text-[10px] font-bold text-slate-400">Duration: {lp.duration} | Difficulty: {lp.difficulty}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-500 block mb-1">Priority: {lp.priority}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{lp.completion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ClayCard>

              {/* Weak Topic Detection Alert & Generator */}
              <ClayCard className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle size={18} className="text-rose-500 animate-pulse" />
                  <span>Weak Topic Detector</span>
                </h3>
                {weakTopics.map((wt, idx) => (
                  <div key={idx} className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-rose-800">{wt.name}</h4>
                        <span className="text-[10px] font-bold text-rose-600">Quiz Average: {wt.quiz_score}% | Study time: {wt.time_spent_mins} mins</span>
                      </div>
                      <ClayButton
                        onClick={() => generateRevisionNotes(wt.name)}
                        disabled={aiNotesLoading}
                        className="py-1 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-extrabold rounded-xl"
                      >
                        {aiNotesLoading ? 'Generating...' : 'Compile Revision Notes'}
                      </ClayButton>
                    </div>
                    {aiNotes && (
                      <div className="p-4 bg-white border border-rose-100 rounded-xl text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                        {aiNotes}
                      </div>
                    )}
                  </div>
                ))}
              </ClayCard>
            </div>

            {/* Right Sidebar Section (Study list feeds, revision calendar & Career mentor) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Recommendations feed list */}
              <h3 className="font-bold text-base text-slate-700 pl-1">Dynamic Recommendations</h3>
              <div className="flex flex-col gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-full">{rec.category}</span>
                      <span className="text-[10px] font-bold text-slate-400">{rec.priority} Priority</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{rec.description}</p>
                    <p className="text-[9px] font-bold text-primary mt-1">Reasons: {rec.reasons}</p>
                  </div>
                ))}
              </div>

              {/* Revision schedule list */}
              <h3 className="font-bold text-base text-slate-700 pl-1">Smart Revision Schedule</h3>
              <div className="flex flex-col gap-3">
                {revisionSchedule.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rev.revision_type} Revision</span>
                      <h4 className="font-bold text-xs text-slate-700 mt-1">Topic ID: {rev.topic_id}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Scheduled</span>
                  </div>
                ))}
              </div>

              {/* Career alignment helper */}
              <ClayCard className="flex flex-col gap-3">
                <h3 className="font-bold text-base text-slate-800">Target Career: Software Engineer</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Recommended next steps: Improve python algorithms metrics and apply to 2 remote internships.
                </p>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
            {/* Main Graphs Grid */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Learning Hours Chart */}
              <ClayCard className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-slate-800">Weekly Learning Hours</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(tick) => new Date(tick).toLocaleDateString([], { weekday: 'short' })} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="learning_hours" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ClayCard>

              {/* Quiz scores & coding progress charts */}
              <ClayCard className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-slate-800">Quiz Averages & Coding Progress</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(tick) => new Date(tick).toLocaleDateString([], { weekday: 'short' })} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="quiz_scores_average" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ClayCard>
            </div>

            {/* Attendance, CGPA & Skills progress right panels */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Skill Proficiency stats */}
              <h3 className="font-bold text-base text-slate-700 pl-1">Skill Proficiency</h3>
              <ClayCard className="flex flex-col gap-4">
                {[
                  { name: 'Python Algorithms', level: 80 },
                  { name: 'Database Queries (SQL)', level: 60 },
                  { name: 'Frontend React UI', level: 45 }
                ].map((sk, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{sk.name}</span>
                      <span>{sk.level}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${sk.level}%` }} />
                    </div>
                  </div>
                ))}
              </ClayCard>

              {/* Readiness Scores & CGPA */}
              <ClayCard className="p-5 flex flex-col gap-2 bg-slate-850 text-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement Readiness Score</span>
                <span className="text-3xl font-extrabold text-primary">72%</span>
                <span className="text-xs text-slate-400 font-semibold mt-1">Average CGPA: 8.24 | Attendance: 84%</span>
              </ClayCard>
            </div>
          </div>
        )}

        {/* Pomodoro Tab (Unmodified core functionality) */}
        {activeTab === 'pomo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Streak & Motivation</h3>
              <ClayCard className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-orange-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-orange-800">Learning Streak</h4>
                  <span className="text-2xl font-extrabold text-orange-700 flex items-center gap-1 mt-1">
                    <Flame size={24} fill="currentColor" /> {user?.student_profile?.streak || 4} Days
                  </span>
                </div>
              </ClayCard>
            </div>

            <div className="lg:col-span-8">
              <ClayCard className="p-8 text-center flex flex-col items-center gap-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pomodoro study clock</span>
                <div className="font-heading font-extrabold text-5xl text-slate-700 tabular-nums">
                  {formatPomoTime(pomoTime)}
                </div>
                <div className="flex gap-3">
                  <ClayButton onClick={togglePomo} className="bg-primary text-white hover:bg-secondary rounded-xl py-2 px-6 font-bold">
                    {pomoActive ? <Pause size={14} /> : <Play size={14} />} {pomoActive ? 'Pause' : 'Start'}
                  </ClayButton>
                  <ClayButton onClick={resetPomo} className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl py-2 px-6 font-bold">
                    <RotateCcw size={14} /> Reset
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
