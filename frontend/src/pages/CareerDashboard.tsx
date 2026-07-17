import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton } from '../components/ui';
import {
  Upload, FileText, TrendingUp, Award, Target, Sparkles,
  CheckCircle2, AlertCircle, Clock, ChevronRight, Briefcase,
  Code, BookOpen, BarChart2, Mic, Loader2, History, ArrowUpRight
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────
interface ATSResult {
  success: boolean;
  analysis_id: number;
  ats_score: number;
  resume_strength: string;
  ats_result: {
    strengths: string[];
    weaknesses: string[];
    missing_keywords: string[];
    formatting_issues: string[];
    grammar_score: number;
    keyword_match_percent: number;
    overall_feedback: string;
  };
  gemini_insights: {
    improvement_tips: string[];
    recommended_certs: string[];
    recommended_projects: string[];
  };
  improvement_from_last: number;
}

interface RoadmapResult {
  roadmap_text: string;
  recommended_skills: string[];
  recommended_projects: string[];
  recommended_certifications: string[];
  recommended_courses: string[];
}

interface InterviewQuestion {
  question: string;
  category: string;
  expected_answer: string;
  difficulty: string;
}

interface HistoryItem {
  id: number;
  file_name: string;
  ats_score: number;
  improvement: number;
  uploaded_at: string;
}

// ── Circular Score Ring ───────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 140 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#4f46e5'; // indigo
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={getColor()} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading font-extrabold text-2xl" style={{ color: getColor() }}>{score.toFixed(0)}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">ATS Score</span>
      </div>
    </div>
  );
};

// ── Skill Badge ───────────────────────────────────────────────────────
const SkillBadge: React.FC<{ label: string; variant?: 'missing' | 'cert' | 'project' | 'skill' | 'course' }> = ({ label, variant = 'skill' }) => {
  const styles = {
    missing: 'bg-amber-50 border-amber-200 text-amber-700',
    cert: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    project: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    skill: 'bg-primary/10 border-primary/20 text-primary',
    course: 'bg-violet-50 border-violet-200 text-violet-700',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export const CareerDashboard: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'upload' | 'roadmap' | 'interview' | 'history'>('upload');

  // Upload & ATS state
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Roadmap state
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(6);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);

  // Interview state
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewDifficulty, setInterviewDifficulty] = useState('medium');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Upload Handler ────────────────────────────────────────────────
  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    setSelectedFile(file);
    setAtsResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('job_description', jobDesc);

      const res = await axios.post(`${API_URL}/career/upload-resume`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setAtsResult(res.data);
    } catch (err: any) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Roadmap Handler ───────────────────────────────────────────────
  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await axios.post(`${API_URL}/career/generate-roadmap`, {
        target_role: targetRole,
        branch,
        semester,
        career_goal: 'placement'
      }, { headers });
      setRoadmapResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ── Interview Handler ────────────────────────────────────────────
  const handleGenerateInterview = async () => {
    setInterviewLoading(true);
    setQuestions([]);
    try {
      const res = await axios.post(`${API_URL}/career/interview-preparation`, {
        target_role: interviewRole,
        interview_type: interviewType,
        difficulty: interviewDifficulty
      }, { headers });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInterviewLoading(false);
    }
  };

  // ── History Loader ───────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/career/history`, { headers });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  const strengthColors: Record<string, string> = {
    Weak: 'text-red-500 bg-red-50 border-red-200',
    Average: 'text-amber-600 bg-amber-50 border-amber-200',
    Strong: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    Excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  const tabs = [
    { id: 'upload', label: 'ATS Resume Check', icon: Upload },
    { id: 'roadmap', label: 'Career Roadmap', icon: TrendingUp },
    { id: 'interview', label: 'Interview Prep', icon: Mic },
    { id: 'history', label: 'Resume History', icon: History },
  ] as const;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body">
      {/* Hero Banner */}
      <div className="p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
              <Briefcase className="text-primary" size={32} />
              <span>Career Success Hub</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl">
              Upload your resume for AI-powered ATS scoring, get a personalized career roadmap, and practice with role-specific interview questions.
            </p>
          </div>
          <div className="flex gap-3">
            {['SkillBridge AI', 'Gemini AI'].map(badge => (
              <span key={badge} className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles size={10} /> {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm self-start flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: ATS Resume Upload ─────────────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* Upload Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Drag & Drop Zone */}
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <Upload size={16} className="text-primary" /> Upload Resume
              </h3>
              <div
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all text-center flex flex-col items-center gap-3 ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700">
                    {selectedFile ? selectedFile.name : 'Drag & drop your resume'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">PDF or DOCX • Max 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {/* Optional Job Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Target Job Description <span className="text-slate-400 font-normal">(Optional — improves ATS accuracy)</span></label>
                <textarea
                  placeholder="Paste job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="clay-input text-xs font-semibold h-24"
                />
              </div>

              <ClayButton
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedFile && !uploading ? 'bg-primary text-white hover:bg-secondary' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {uploading ? <><Loader2 size={15} className="animate-spin" /> Analyzing with SkillBridge AI...</> : <><Sparkles size={14} /> Check ATS Score</>}
              </ClayButton>
            </ClayCard>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {!atsResult ? (
              <ClayCard className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-600">Upload your resume to begin</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Your ATS score, keyword analysis, and AI suggestions will appear here.</p>
                </div>
              </ClayCard>
            ) : (
              <>
                {/* ATS Score Header */}
                <ClayCard className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <ScoreRing score={atsResult.ats_score} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${strengthColors[atsResult.resume_strength] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                          {atsResult.resume_strength}
                        </span>
                        {atsResult.improvement_from_last !== 0 && (
                          <span className={`text-xs font-bold flex items-center gap-0.5 ${atsResult.improvement_from_last > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <ArrowUpRight size={12} />
                            {atsResult.improvement_from_last > 0 ? '+' : ''}{atsResult.improvement_from_last.toFixed(1)} from last upload
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading font-extrabold text-xl text-slate-800">{atsResult.ats_result.overall_feedback}</h2>
                      <div className="flex gap-4 mt-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Keyword Match</span>
                          <span className="font-extrabold text-base text-primary">{atsResult.ats_result.keyword_match_percent?.toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Grammar</span>
                          <span className="font-extrabold text-base text-emerald-500">{atsResult.ats_result.grammar_score?.toFixed(0)}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ClayCard>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 flex items-center gap-1 uppercase">
                      <CheckCircle2 size={13} /> Strengths
                    </h4>
                    <div className="flex flex-col gap-2">
                      {atsResult.ats_result.strengths?.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-red-600 flex items-center gap-1 uppercase">
                      <AlertCircle size={13} /> Weaknesses
                    </h4>
                    <div className="flex flex-col gap-2">
                      {atsResult.ats_result.weaknesses?.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                          <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </ClayCard>
                </div>

                {/* Missing Keywords */}
                <ClayCard className="p-5 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-amber-700 flex items-center gap-1 uppercase">
                    <Target size={13} /> Missing Industry Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.ats_result.missing_keywords?.map((kw, i) => (
                      <SkillBadge key={i} label={kw} variant="missing" />
                    ))}
                  </div>
                </ClayCard>

                {/* AI Improvement Tips */}
                <ClayCard className="p-5 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1 uppercase">
                    <Sparkles size={13} className="animate-pulse" /> Gemini AI Resume Improvement Tips
                  </h4>
                  <ol className="flex flex-col gap-2">
                    {atsResult.gemini_insights.improvement_tips?.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </ClayCard>

                {/* Recommended Certifications & Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 flex items-center gap-1 uppercase">
                      <Award size={13} /> Recommended Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.gemini_insights.recommended_certs?.map((cert, i) => (
                        <SkillBadge key={i} label={cert} variant="cert" />
                      ))}
                    </div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 flex items-center gap-1 uppercase">
                      <Code size={13} /> Recommended Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.gemini_insights.recommended_projects?.map((proj, i) => (
                        <SkillBadge key={i} label={proj} variant="project" />
                      ))}
                    </div>
                  </ClayCard>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Career Roadmap ───────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-primary" /> Roadmap Parameters
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Target Role</label>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 text-xs font-bold text-slate-600">
                  {['Full Stack Developer', 'AI/ML Engineer', 'DevOps Engineer', 'Data Scientist', 'Embedded Systems Engineer', 'Cybersecurity Analyst', 'Product Manager'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 text-xs font-bold text-slate-600">
                  {['CSE', 'AI & DS', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Current Semester</label>
                <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 text-xs font-bold text-slate-600">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <ClayButton
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {roadmapLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Roadmap</>}
              </ClayButton>
            </ClayCard>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            {roadmapResult ? (
              <>
                {/* Roadmap Timeline */}
                <ClayCard className="p-6">
                  <h3 className="font-bold text-base text-slate-800 mb-4">{targetRole} — Semester-Wise Roadmap</h3>
                  <div className="prose prose-sm max-w-none text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                    {roadmapResult.roadmap_text}
                  </div>
                </ClayCard>

                {/* Skills, Certs, Projects, Courses grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-primary uppercase flex items-center gap-1"><BookOpen size={12} /> Key Skills to Acquire</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_skills?.map((s, i) => <SkillBadge key={i} label={s} variant="skill" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 uppercase flex items-center gap-1"><Award size={12} /> Certifications</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_certifications?.map((c, i) => <SkillBadge key={i} label={c} variant="cert" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 uppercase flex items-center gap-1"><Code size={12} /> Build These Projects</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_projects?.map((p, i) => <SkillBadge key={i} label={p} variant="project" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-violet-700 uppercase flex items-center gap-1"><BookOpen size={12} /> Recommended Courses</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_courses?.map((c, i) => <SkillBadge key={i} label={c} variant="course" />)}</div>
                  </ClayCard>
                </div>
              </>
            ) : (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <TrendingUp size={36} className="text-slate-200" />
                <p className="font-semibold text-sm">Set your parameters and click Generate to create a personalized career roadmap.</p>
              </ClayCard>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Interview Preparation ─────────────────────────────── */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <Mic size={16} className="text-primary" /> Interview Setup
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Target Role</label>
                <input type="text" value={interviewRole} onChange={e => setInterviewRole(e.target.value)} className="clay-input text-xs font-semibold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Interview Type</label>
                <select value={interviewType} onChange={e => setInterviewType(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 text-xs font-bold text-slate-600">
                  <option value="technical">Technical Interview</option>
                  <option value="hr">HR Behavioral Interview</option>
                  <option value="coding">Coding / DSA Interview</option>
                  <option value="mock">Mock (Mixed) Interview</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 pl-1">Difficulty Level</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map(d => (
                    <button key={d} onClick={() => setInterviewDifficulty(d)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all ${interviewDifficulty === d ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <ClayButton
                onClick={handleGenerateInterview}
                disabled={interviewLoading}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {interviewLoading ? <><Loader2 size={14} className="animate-spin" /> Generating Questions...</> : <><Sparkles size={14} /> Generate Questions</>}
              </ClayButton>
            </ClayCard>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-3">
            {questions.length === 0 && !interviewLoading ? (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <Mic size={36} className="text-slate-200" />
                <p className="font-semibold text-sm">Configure your interview parameters and generate AI-powered questions.</p>
              </ClayCard>
            ) : (
              questions.map((q, i) => {
                const diffColors: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50 border-emerald-200', Medium: 'text-amber-600 bg-amber-50 border-amber-200', Hard: 'text-red-600 bg-red-50 border-red-200' };
                const isExpanded = expandedQ === i;
                return (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-2 cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => setExpandedQ(isExpanded ? null : i)}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center">{i + 1}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">{q.category}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${diffColors[q.difficulty] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>{q.difficulty}</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    <p className="font-bold text-sm text-slate-800 leading-snug">{q.question}</p>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-slate-600 font-semibold leading-relaxed">
                        <span className="text-[9px] font-extrabold text-primary uppercase block mb-1">Model Answer / Key Points</span>
                        {q.expected_answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Resume History ─────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4 text-left">
          <h3 className="font-bold text-base text-slate-700 pl-1">Resume Submission History</h3>
          {historyLoading ? (
            <ClayCard className="text-center py-16"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></ClayCard>
          ) : history.length === 0 ? (
            <ClayCard className="text-center py-24 text-slate-400">
              <History size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-sm">No resume uploads yet. Upload your first resume to begin tracking your improvement.</p>
            </ClayCard>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item, idx) => (
                <div key={item.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center hover:scale-[1.005] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{item.file_name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ATS Score</span>
                      <span className="font-extrabold text-lg text-primary">{item.ats_score.toFixed(0)}</span>
                    </div>
                    {item.improvement !== 0 && (
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Improvement</span>
                        <span className={`font-extrabold text-sm flex items-center gap-0.5 ${item.improvement > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          <ArrowUpRight size={13} />{item.improvement > 0 ? '+' : ''}{item.improvement.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border ${idx === 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {idx === 0 ? 'Latest' : `v${history.length - idx}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
