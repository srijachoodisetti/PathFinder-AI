import React, { useState } from 'react';
import { ClayCard, ClayButton } from '../components/ui';
import { Compass, Sparkles, AlertCircle, Award, Target, Landmark } from 'lucide-react';

const mockRoadmaps = [
  {
    role: "Full-Stack Web Engineer",
    steps: ["Internet Fundamentals", "HTML, CSS & JavaScript", "React 19 & Next.js Frameworks", "Node.js & FastAPI", "SQL & Database Design", "Docker & Kubernetes Deployment"]
  },
  {
    role: "AI & Data Science Specialist",
    steps: ["Python Fundamentals", "Calculus & Linear Algebra Basics", "Pandas & Numpy Manipulation", "Supervised Learning Models", "Deep Learning with PyTorch", "LLMs & Prompt Engineering"]
  },
  {
    role: "DevOps & Cloud Engineer",
    steps: ["Linux Admin & Bash Scripting", "AWS Cloud Core Architectures", "Docker Container Systems", "CI/CD Deployment Pipelines", "Terraform Infrastructure as Code", "Prometheus Metrics Monitoring"]
  }
];

export const CareerHub: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState(mockRoadmaps[0]);
  const [skills, setSkills] = useState<string[]>(['React', 'Python', 'FastAPI', 'HTML', 'CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter(s => s !== sk));
  };

  const analyzeGaps = () => {
    setLoading(true);
    setTimeout(() => {
      let missing: string[] = [];
      let recCerts: string[] = [];
      if (selectedRole.role.includes("Full-Stack")) {
        missing = ["Node.js", "Docker", "Kubernetes", "Next.js"];
        recCerts = ["Google UX Design Professional", "AWS Cloud Practitioner", "Cisco JavaScript Course"];
      } else if (selectedRole.role.includes("AI")) {
        missing = ["PyTorch", "Pandas", "Linear Algebra", "TensorFlow"];
        recCerts = ["Google Data Analytics Professional", "IBM AI Developer Certification"];
      } else {
        missing = ["Linux Scripting", "Terraform", "CI/CD Pipelines"];
        recCerts = ["AWS Solutions Architect Associate", "Oracle Cloud Infrastructure Associate"];
      }

      setAnalysisResult({
        missing,
        matchingPercentage: Math.max(30, Math.floor(100 - (missing.length * 15))),
        recommendations: recCerts
      });
      setLoading(false);
    }, 8000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Compass className="text-primary" size={32} />
            <span>AI Career Mentor</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Explore industry-tailored engineering career roadmaps, test your skill gaps, and get matching course suggestions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
        {/* Left panel: Roadmaps and Skill configuration */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-700 pl-1">Career Goal Selector</h3>
          <ClayCard className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 pl-1">Target Engineering Role</label>
              <select
                value={selectedRole.role}
                onChange={(e) => {
                  const match = mockRoadmaps.find(r => r.role === e.target.value);
                  if (match) {
                    setSelectedRole(match);
                    setAnalysisResult(null);
                  }
                }}
                className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
              >
                {mockRoadmaps.map((r, i) => <option key={i} value={r.role}>{r.role}</option>)}
              </select>
            </div>

            {/* My Skills Tag Area */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 pl-1">My Current Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Your Skills"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="clay-input py-1 px-3 text-xs flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <ClayButton onClick={addSkill} className="py-1 px-3 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold">
                  Add Tag
                </ClayButton>
              </div>

              <div className="flex gap-1.5 flex-wrap mt-2">
                {skills.map((s, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-primary hover:text-slate-600 font-bold">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <ClayButton
              onClick={analyzeGaps}
              disabled={loading}
              className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-1.5 mt-2"
            >
              <Sparkles size={14} /> {loading ? 'Running AI Gap Analysis...' : 'Analyze Skill Gaps'}
            </ClayButton>
          </ClayCard>
        </div>

        {/* Right Panel: Selected Roadmap Visualizer & Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {analysisResult ? (
            <ClayCard className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-50 flex items-center justify-center font-heading font-extrabold text-lg text-emerald-600">
                  {analysisResult.matchingPercentage}%
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Job Readiness Score</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Calculated alignment for {selectedRole.role}.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex flex-col gap-2">
                <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1">
                  <AlertCircle size={14} /> Identified Gap Skills
                </h4>
                <div className="flex gap-2 flex-wrap mt-1">
                  {analysisResult.missing.map((sk: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col gap-2">
                <h4 className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                  <Award size={14} /> Recommended Certifications
                </h4>
                <div className="flex flex-col gap-2 mt-1">
                  {analysisResult.recommendations.map((cert: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center text-xs text-emerald-700 font-semibold">
                      <Target size={12} className="text-emerald-500" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ClayCard>
          ) : (
            <ClayCard className="flex flex-col gap-5">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <Landmark size={16} className="text-primary" />
                <span>Roadmap Steps for {selectedRole.role}</span>
              </h3>
              <div className="relative border-l border-slate-200 pl-6 ml-3 flex flex-col gap-6 mt-2">
                {selectedRole.steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center font-bold text-[10px] text-primary">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-sm text-slate-700">{step}</h4>
                  </div>
                ))}
              </div>
            </ClayCard>
          )}
        </div>
      </div>
    </div>
  );
};
