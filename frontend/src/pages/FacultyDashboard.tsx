import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect } from '../components/ui';
import { Users, FileUp, Sparkles, BookOpen, Trash2, CheckCircle, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export const FacultyDashboard: React.FC = () => {
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'upload' | 'exams' | 'analytics'>('upload');
  
  // Selections
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Upload States
  const [resourceType, setResourceType] = useState('detailed_notes');
  const [resTitle, setResTitle] = useState('');
  const [resContent, setResContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  // Question Paper States
  const [examType, setExamType] = useState('Mid');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [paperOutput, setPaperOutput] = useState('');

  useEffect(() => {
    fetchGlobalSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchUnits(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) {
      fetchTopics(selectedUnit);
    }
  }, [selectedUnit]);

  const fetchGlobalSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/engineering/subjects`);
      setSubjects(res.data);
      if (res.data.length > 0) setSelectedSubject(res.data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnits = async (subjId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/units?subject_id=${subjId}`);
      setUnits(res.data);
      if (res.data.length > 0) setSelectedUnit(res.data[0].id.toString());
      else {
        setUnits([]);
        setSelectedUnit('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopics = async (unitId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/topics?unit_id=${unitId}`);
      setTopics(res.data);
      if (res.data.length > 0) setSelectedTopic(res.data[0].id.toString());
      else {
        setTopics([]);
        setSelectedTopic('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadResource = async () => {
    if (!selectedTopic || !resTitle || !resContent) return;
    setUploadStatus('Uploading...');
    try {
      await axios.post(`${API_URL}/engineering/topics/${selectedTopic}/resources`, {
        topic_id: parseInt(selectedTopic),
        resource_type: resourceType,
        title: resTitle,
        content: resContent,
        file_url: fileUrl || null
      }, { headers });
      setUploadStatus('Upload successful!');
      setResTitle('');
      setResContent('');
      setFileUrl('');
    } catch (err) {
      setUploadStatus('Failed to upload material.');
      console.error(err);
    }
  };

  const generatePaper = async () => {
    if (!selectedSubject || !selectedUnit) return;
    setLoading(true);
    setPaperOutput('');
    try {
      const subjectName = subjects.find(s => s.id.toString() === selectedSubject)?.name || 'Subject';
      const unitName = units.find(u => u.id.toString() === selectedUnit)?.name || 'Unit';
      const res = await axios.post(`${API_URL}/ai/generate-question-paper`, {
        subject: subjectName,
        unit: unitName,
        exam_type: examType,
        difficulty: difficulty
      }, { headers });
      setPaperOutput(res.data.paper_markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performanceMock = [
    { name: 'Unit 1 Test', average: 78, max: 98 },
    { name: 'Unit 2 Test', average: 65, max: 94 },
    { name: 'Midterm Sem', average: 72, max: 96 },
    { name: 'Assignment 1', average: 85, max: 100 }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Users className="text-primary" size={32} />
            <span>Faculty Portal</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Manage course syllabi, upload course materials, dynamically generate tests with AI, and track classroom diagnostics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Upload Resources
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'exams' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          AI Exam Paper Builder
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Class Analytics
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Syllabi Selectors */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Target Syllabus Link</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClaySelect
                  label="Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  options={subjects.map(s => ({ value: s.id.toString(), label: `${s.name} (${s.code})` }))}
                />
                <ClaySelect
                  label="Unit"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  options={units.map(u => ({ value: u.id.toString(), label: `Unit ${u.unit_number}: ${u.name}` }))}
                />
                <ClaySelect
                  label="Topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  options={topics.map(t => ({ value: t.id.toString(), label: t.name }))}
                />
              </ClayCard>
            </div>

            {/* Material Editor */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Upload Notes / Attachment</h3>
              <ClayCard className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Resource Type</label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                    >
                      <option value="detailed_notes">Detailed Notes (Markdown)</option>
                      <option value="short_notes">Quick Summary Notes</option>
                      <option value="formula_sheet">Formula Cheat Sheet</option>
                      <option value="lab_program">Lab Program Code</option>
                    </select>
                  </div>
                  <ClayInput label="Title" value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="e.g. Sub-schema maps" />
                </div>
                <ClayInput label="External Attachment File Link (Optional)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="e.g. https://files.edu/unit1.pdf" />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Resource Content (Markdown Supported)</label>
                  <textarea
                    value={resContent}
                    onChange={(e) => setResContent(e.target.value)}
                    className="clay-input h-48 text-xs font-mono text-slate-700 leading-relaxed"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-slate-400">{uploadStatus}</span>
                  <ClayButton onClick={uploadResource} className="bg-primary text-white hover:bg-secondary rounded-xl py-2 px-6 font-bold text-xs">
                    Upload Material
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Exam Paper</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClaySelect
                  label="Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  options={subjects.map(s => ({ value: s.id.toString(), label: `${s.name} (${s.code})` }))}
                />
                <ClaySelect
                  label="Unit"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  options={units.map(u => ({ value: u.id.toString(), label: `Unit ${u.unit_number}: ${u.name}` }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                    >
                      <option value="Mid">Mid-Semester Exam</option>
                      <option value="Final">Semester Final Exam</option>
                      <option value="Assignment">Unit Assignment Sheet</option>
                    </select>
                  </div>
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
                </div>
                <ClayButton
                  onClick={generatePaper}
                  disabled={loading}
                  className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles size={14} /> {loading ? 'Compiling Paper...' : 'Generate Question Paper'}
                </ClayButton>
              </ClayCard>
            </div>

            <div className="lg:col-span-7">
              {paperOutput ? (
                <ClayCard className="flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-600">Generated Exam Document</span>
                    <button className="text-xs font-bold text-primary hover:underline">Copy Markdown</button>
                  </div>
                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl text-left whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed shadow-sm">
                    {paperOutput}
                  </div>
                </ClayCard>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Configure subject properties in the left panel and click Generate to build a university-grade question paper.</ClayCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Student Performance Roll</h3>
              <ClayCard className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>👦 Rajesh Kumar (Grade 6)</span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">240 XP</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>👦 Sunil Verma (Grade 6)</span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">180 XP</span>
                </div>
              </ClayCard>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Average Test Scores Diagnostics</h3>
              <ClayCard className="p-6">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceMock}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ClayCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
