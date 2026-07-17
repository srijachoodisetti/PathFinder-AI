import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { FolderGit2, Sparkles, FileText, LayoutGrid, CheckCircle, Network } from 'lucide-react';

export const ProjectHub: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [projectTitle, setProjectTitle] = useState('Smart Solar Microgrid Controller');
  const [projectDesc, setProjectDesc] = useState('An IoT-enabled microgrid controller that dynamically balances supply from photovoltaic arrays and batteries, sending diagnostics over MQTT.');
  const [projectType, setProjectType] = useState('major');
  const [githubUrl, setGithubUrl] = useState('https://github.com/example/microgrid');

  const [activeTab, setActiveTab] = useState<'listings' | 'doc' | 'architecture'>('listings');

  // Generator States
  const [loading, setLoading] = useState(false);
  const [readmeOutput, setReadmeOutput] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');

  const generateDocs = async () => {
    setLoading(true);
    setReadmeOutput('');
    try {
      const res = await axios.post(`${API_URL}/ai/documentation-generator`, {
        title: projectTitle,
        description: projectDesc,
        project_type: projectType
      }, { headers });
      setReadmeOutput(res.data.readme);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateArchitecture = async () => {
    setLoading(true);
    setMermaidCode('');
    try {
      const res = await axios.post(`${API_URL}/ai/architecture-generator`, {
        title: projectTitle,
        description: projectDesc
      }, { headers });
      setMermaidCode(res.data.mermaid_code);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <FolderGit2 className="text-emerald-500" size={32} />
            <span>Projects & Hackathon Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Manage your engineering projects, generate GitHub documentation, and draw cloud architectures instantly using AI.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'listings' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          My Projects
        </button>
        <button
          onClick={() => setActiveTab('doc')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'doc' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI README Generator
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'architecture' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI Architecture Builder
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Input Form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Register New Project</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput
                  label="Project Title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
                <ClayInput
                  label="GitHub Repository URL"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                  >
                    <option value="mini">Mini Course Project</option>
                    <option value="major">Major Year Project</option>
                    <option value="hackathon">Hackathon Project Idea</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Project Description</label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="clay-input h-32 text-xs font-semibold"
                  />
                </div>
                <ClayButton className="bg-primary text-white hover:bg-secondary rounded-xl py-2.5 font-bold">
                  Save Project
                </ClayButton>
              </ClayCard>
            </div>

            {/* List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Active Projects Directory</h3>
              <ClayCard className="p-6 flex flex-col gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Major Project</span>
                    <span className="text-[10px] font-bold text-slate-400">July 17, 2026</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{projectTitle}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{projectDesc}</p>
                  <a href={githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                    🌐 View GitHub Repository
                  </a>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'doc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Target Documentation</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Project Title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Description summary</label>
                  <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} className="clay-input h-32 text-xs font-semibold" />
                </div>
                <ClayButton
                  onClick={generateDocs}
                  disabled={loading}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> {loading ? 'Compiling Documentation...' : 'Generate GitHub README'}
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-7">
              {readmeOutput ? (
                <ClayCard className="flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-600">Generated README.md</span>
                    <button className="text-xs font-bold text-primary hover:underline">Copy Markdown</button>
                  </div>
                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl text-left whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed shadow-sm">
                    {readmeOutput}
                  </div>
                </ClayCard>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Click Generate to build a comprehensive, detailed markdown documentation file from your project metadata.</ClayCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Microservice Diagram</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Project Title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Deployment Context</label>
                  <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} className="clay-input h-32 text-xs font-semibold" />
                </div>
                <ClayButton
                  onClick={generateArchitecture}
                  disabled={loading}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> {loading ? 'Drawing Blueprint...' : 'Draw Architecture Diagram'}
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-7">
              {mermaidCode ? (
                <ClayCard className="flex flex-col gap-4 text-left">
                  <h3 className="font-bold text-base text-slate-800">Mermaid.js Diagram Code</h3>
                  <pre className="p-4 bg-slate-900 border border-slate-950 rounded-2xl text-xs font-mono text-emerald-400 leading-relaxed shadow-inner">
                    {mermaidCode}
                  </pre>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visual Representation Outline:</span>
                    <div className="flex flex-col gap-1.5 text-xs text-slate-600 font-semibold pl-2">
                      <div>➔ Clients connect to Uvicorn Backend.</div>
                      <div>➔ Database queries SQLAlchemy storage contexts.</div>
                      <div>➔ AI nodes delegate tasks to Google Gemini.</div>
                    </div>
                  </div>
                </ClayCard>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Click Draw to generate database architecture and cloud workflow outlines in Mermaid.js script syntax.</ClayCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
