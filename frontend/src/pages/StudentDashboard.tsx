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
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { isOnline, queuedQuizzes, syncPendingData } = useOfflineStore();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Daily Motivation
  const [motivation, setMotivation] = useState("Keep studying to make an impact! 🌱");

  // Pomodoro timer states
  const [pomoTime, setPomoTime] = useState(1500); // 25 minutes
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoSession, setPomoSession] = useState<'study' | 'break'>('study');

  // Study Goals state
  const [goals, setGoals] = useState({
    daily_hour_goal: 2.0,
    weekly_xp_goal: 300,
    completed_today_hours: 1.2
  });
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalDailyInput, setGoalDailyInput] = useState('2.0');
  const [goalXpInput, setGoalXpInput] = useState('300');

  // Calendar dates mock (highlighting streak days)
  const currentMonthDays = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    studied: [12, 13, 14, 15].includes(i + 1), // highlight Rajesh streak days
    hasGoal: [15, 20, 25].includes(i + 1)
  }));

  useEffect(() => {
    fetchDashboardData();
    fetchMotivation();
    fetchGoals();
    
    // Log dashboard visit to Firebase Analytics
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const recRes = await axios.get(`${API_URL}/student/recommendations`);
      setRecommendations(recRes.data);

      // Fetch leaderboard from Firestore (with local fallback/sync)
      try {
        const firestoreLeaderboard = await firestoreService.getLeaderboard();
        if (firestoreLeaderboard && firestoreLeaderboard.length > 0) {
          setLeaderboard(firestoreLeaderboard);
        } else {
          const leadRes = await axios.get(`${API_URL}/quizzes/analytics/leaderboard`);
          setLeaderboard(leadRes.data);
          // Sync to Firestore
          for (const item of leadRes.data) {
            await firestoreService.updateLeaderboardScore(item.email, item.full_name, item.xp_points);
          }
        }
      } catch (err) {
        console.error("Firestore leaderboard error, falling back to local backend:", err);
        const leadRes = await axios.get(`${API_URL}/quizzes/analytics/leaderboard`);
        setLeaderboard(leadRes.data);
      }

      // Fetch achievements from Firestore (with local fallback/sync)
      if (user) {
        try {
          const firestoreAchievements = await firestoreService.getAchievements(user.email);
          if (firestoreAchievements && firestoreAchievements.length > 0) {
            setAchievements(firestoreAchievements);
          } else {
            const achRes = await axios.get(`${API_URL}/student/achievements`);
            setAchievements(achRes.data);
            // Sync to Firestore
            for (const item of achRes.data) {
              await firestoreService.saveAchievement(user.email, {
                title: item.title,
                description: item.description,
                xp: item.xp_reward || 50
              });
            }
          }
        } catch (err) {
          console.error("Firestore achievements error, falling back to local backend:", err);
          const achRes = await axios.get(`${API_URL}/student/achievements`);
          setAchievements(achRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMotivation = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/motivation`);
      setMotivation(res.data.quote);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/goals`);
      setGoals(res.data);
      setGoalDailyInput(res.data.daily_hour_goal.toString());
      setGoalXpInput(res.data.weekly_xp_goal.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGoals = async () => {
    try {
      const updated = {
        daily_hour_goal: parseFloat(goalDailyInput) || 2.0,
        weekly_xp_goal: parseInt(goalXpInput) || 300,
        completed_today_hours: goals.completed_today_hours
      };
      await axios.put(`${API_URL}/student/goals`, updated);
      setGoals(updated);
      setEditingGoals(false);

      // Sync updated goals to Firestore
      if (user) {
        await firestoreService.syncUserProfile(user.email, {
          daily_hour_goal: updated.daily_hour_goal,
          weekly_xp_goal: updated.weekly_xp_goal
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    await syncPendingData();
    await fetchDashboardData();
    setSyncing(false);
  };

  const handleClaimStreak = async () => {
    try {
      const res = await axios.post(`${API_URL}/student/claim-streak`);
      if (user && user.student_profile) {
        const updatedUser = {
          ...user,
          student_profile: {
            ...user.student_profile,
            streak: res.data.streak
          }
        };
        setUser(updatedUser);

        // Sync streak details to Firestore
        await firestoreService.syncUserProfile(user.email, {
          streak: res.data.streak
        });
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Pomodoro Controls
  const togglePomo = () => setPomoActive(!pomoActive);
  const resetPomo = () => {
    setPomoActive(false);
    setPomoTime(pomoSession === 'study' ? 1500 : 300);
  };
  const handlePomoFinish = () => {
    setPomoActive(false);
    // Play synthesis alert to bypass empty sound assets
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        pomoSession === 'study' ? "Study session finished! Take a break." : "Break finished! Let's study."
      );
      window.speechSynthesis.speak(utterance);
    }
    if (pomoSession === 'study') {
      setPomoSession('break');
      setPomoTime(300); // 5 mins break
    } else {
      setPomoSession('study');
      setPomoTime(1500); // 25 mins study
    }
  };

  const formatPomoTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Analytics charts datasets
  const progressData = [
    { name: 'Mon', xp: 40 },
    { name: 'Tue', xp: 80 },
    { name: 'Wed', xp: 120 },
    { name: 'Thu', xp: 180 },
    { name: 'Fri', xp: 210 },
    { name: 'Sat', xp: 240 },
    { name: 'Sun', xp: 240 },
  ];

  const subjectData = [
    { subject: 'Math', A: 85, B: 110, fullMark: 150 },
    { subject: 'Science', A: 90, B: 130, fullMark: 150 },
    { subject: 'English', A: 75, B: 130, fullMark: 150 },
    { subject: 'Reasoning', A: 80, B: 100, fullMark: 150 },
    { subject: 'Computer', A: 95, B: 120, fullMark: 150 },
  ];

  const radialData = [
    { name: 'AI Confidence', value: 85, fill: '#8884d8' },
    { name: 'Accuracy', value: 78, fill: '#83a6ed' },
    { name: 'Completion', value: 92, fill: '#8dd1e1' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full text-left">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Sync sync Warning */}
      {queuedQuizzes.length > 0 && (
        <ClayAlert variant="warning" className="flex justify-between items-center">
          <div>
            <span className="font-bold">Offline records stored locally:</span> You completed {queuedQuizzes.length} quiz attempts while offline.
          </div>
          <ClayButton
            onClick={handleSyncClick}
            disabled={syncing || !isOnline}
            className="flex items-center gap-1.5 !py-1 px-4 text-xs font-bold bg-white text-warning border-warning/20 shadow-sm"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Sync Now' : 'Sync pending'}</span>
          </ClayButton>
        </ClayAlert>
      )}

      {/* Daily Motivation Message bar */}
      <ClayCard className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary animate-bounce">
          <Smile size={20} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Daily Motivation</span>
          <p className="text-xs font-semibold text-text/80">{motivation}</p>
        </div>
      </ClayCard>

      {/* Welcome Banner */}
      <ClayCard className="p-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="flex flex-col gap-1 z-10">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
            Hello, {user?.full_name}! 👋
          </h2>
          <p className="text-sm text-text/60">
            Keep learning and unlock achievements. Target Class: <strong className="text-primary">{user?.student_profile?.grade || 'Grade 6'}</strong>.
          </p>
        </div>

        <div className="flex gap-3 z-10">
          <ClayButton
            onClick={handleClaimStreak}
            variant="accent"
            className="flex items-center gap-2 !py-2.5 shadow-md"
          >
            <Flame size={16} fill="currentColor" />
            <span>Extend Streak</span>
          </ClayButton>
          
          <ClayButton
            onClick={() => navigate('/ai-tutor')}
            variant="primary"
            className="flex items-center gap-2 !py-2.5 shadow-md"
          >
            <BrainCircuit size={16} />
            <span>AI Tutor Chat</span>
          </ClayButton>
        </div>
      </ClayCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recharts Analytics & Syllabus */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Area Chart */}
          <ClayCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-heading font-bold text-base flex items-center gap-1.5">
                <TrendingUp size={18} className="text-secondary" />
                This Week's Learning Progress (XP)
              </h3>
              <span className="text-xs text-text/50 font-semibold">Weekly Goal: {goals.weekly_xp_goal} XP</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="xp" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>

          {/* New Recharts: Subject Radar & Radial ACCURACY dials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Radar Chart */}
            <ClayCard className="flex flex-col gap-3">
              <h4 className="font-heading font-bold text-xs text-text/50 uppercase border-b pb-2">Subject Performance Matrix</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#cbd5e1" fontSize={8} />
                    <Radar name="Rajesh Kumar" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>

            {/* Radial Bar Chart: Accuracy and Confidence Index */}
            <ClayCard className="flex flex-col gap-3">
              <h4 className="font-heading font-bold text-xs text-text/50 uppercase border-b pb-2">AI Learning Insights</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="80%" barSize={10} data={radialData}>
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#1e293b', fontSize: 9 }}
                      background
                      dataKey="value"
                    />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 9 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </ClayCard>
          </div>

          {/* Subjects Navigation Grid */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-base px-1">Study Your Subjects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: 'Mathematics', emoji: '📐', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { name: 'Science', emoji: '🔬', color: 'bg-green-50 text-green-600 border-green-100' },
                { name: 'English', emoji: '📖', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { name: 'Social Studies', emoji: '🌍', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                { name: 'Computer Science', emoji: '💻', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                { name: 'Logical Reasoning', emoji: '🧩', color: 'bg-pink-50 text-pink-600 border-pink-100' },
              ].map((subj) => (
                <div
                  key={subj.name}
                  onClick={() => navigate(`/courses?subject=${subj.name}`)}
                  className={`clay-card-flat p-4 cursor-pointer hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 ${subj.color}`}
                >
                  <span className="text-3xl select-none">{subj.emoji}</span>
                  <span className="text-xs font-bold text-text">{subj.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pomodoro, Streaks Grid, Recommendations */}
        <div className="flex flex-col gap-6">
          
          {/* Pomodoro Timer widget */}
          <ClayCard className="flex flex-col gap-3.5 bg-gradient-to-br from-indigo-50/20 to-white relative overflow-hidden">
            <h4 className="font-heading font-bold text-sm text-primary flex items-center gap-1.5">
              ⏱️ Pomodoro Focus Timer
            </h4>
            <p className="text-xs text-text/60 leading-tight">
              Focus 25 minutes on equations, take a 5 minute break.
            </p>

            <div className="flex flex-col items-center gap-2">
              <span className="font-heading font-extrabold text-4xl text-text tracking-wide bg-slate-100 px-6 py-2.5 rounded-3xl shadow-inner border border-slate-200">
                {formatPomoTime(pomoTime)}
              </span>
              <span className="text-[10px] font-bold uppercase text-primary tracking-widest leading-none">
                Session: {pomoSession}
              </span>
            </div>

            <div className="flex gap-2.5 justify-center mt-1">
              <ClayButton
                onClick={togglePomo}
                variant="primary"
                className="flex items-center gap-1 !py-1.5 px-4 text-xs font-bold shadow-sm"
              >
                {pomoActive ? <Pause size={12} /> : <Play size={12} />}
                <span>{pomoActive ? 'Pause' : 'Start'}</span>
              </ClayButton>
              <ClayButton
                onClick={resetPomo}
                className="flex items-center gap-1 !py-1.5 px-4 text-xs font-bold border-slate-200 bg-white"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </ClayButton>
            </div>
          </ClayCard>

          {/* Visual Streak Calendar Grid */}
          <ClayCard className="flex flex-col gap-3">
            <h4 className="font-heading font-bold text-sm text-text/80 flex items-center gap-1.5 border-b pb-2">
              <CalendarIcon size={16} className="text-secondary" />
              Learning Calendar Streak
            </h4>
            <p className="text-[10px] text-text/50">Highlighting active days in July 2026</p>

            <div className="grid grid-cols-7 gap-1.5 text-center mt-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-[9px] font-bold text-text/40">{d}</span>
              ))}
              {currentMonthDays.map((d) => (
                <div
                  key={d.day}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all relative ${
                    d.studied
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-100 text-text/60'
                  }`}
                >
                  <span>{d.day}</span>
                  {d.hasGoal && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          </ClayCard>

          {/* Target Goals Config */}
          <ClayCard className="flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-heading font-bold text-sm text-text/80 flex items-center gap-1.5">
                <Target size={16} className="text-primary" />
                Study Goals
              </h4>
              <button
                onClick={() => setEditingGoals(!editingGoals)}
                className="text-xs text-primary hover:underline font-bold"
              >
                {editingGoals ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingGoals ? (
              <div className="flex flex-col gap-3">
                <ClayInput
                  label="Daily Hour Target"
                  type="number"
                  step="0.5"
                  value={goalDailyInput}
                  onChange={(e) => setGoalDailyInput(e.target.value)}
                />
                <ClayInput
                  label="Weekly XP Target"
                  type="number"
                  value={goalXpInput}
                  onChange={(e) => setGoalXpInput(e.target.value)}
                />
                <ClayButton onClick={handleSaveGoals} variant="primary" className="!py-2 text-xs">
                  Save Goals
                </ClayButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-xs leading-relaxed text-text/80 font-medium">
                <div className="flex justify-between">
                  <span>Daily Study Hours:</span>
                  <span className="font-bold text-primary">{goals.completed_today_hours} / {goals.daily_hour_goal} Hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Target XP:</span>
                  <span className="font-bold text-success">{user?.student_profile?.xp_points || 0} / {goals.weekly_xp_goal} XP</span>
                </div>
              </div>
            )}
          </ClayCard>

          {/* AI recommendations */}
          <ClayCard className="flex flex-col gap-3.5 bg-gradient-to-br from-indigo-50/50 to-white">
            <h4 className="font-heading font-bold text-sm text-primary flex items-center gap-1.5">
              <Sparkles size={16} />
              AI Recommendations
            </h4>
            <div className="flex flex-col gap-2.5">
              {recommendations?.recommended_courses?.length > 0 ? (
                recommendations.recommended_courses.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/courses?course_id=${c.id}`)}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer flex justify-between items-center group shadow-sm"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold text-text group-hover:text-primary transition-colors">
                        {c.title}
                      </span>
                      <span className="text-[10px] text-text/50">{c.subject}</span>
                    </div>
                    <ArrowRight size={14} className="text-text/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              ) : (
                <div className="text-xs font-semibold text-text/40 py-2">
                  No recommendations yet. Let's do some syllabus study!
                </div>
              )}
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
