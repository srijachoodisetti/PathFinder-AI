import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect, SkeletonLoader } from '../components/ui';
import { BookOpen, Sparkles, Video, FileText, Compass, GraduationCap, ChevronRight, Activity, Cpu } from 'lucide-react';

export const AcademicLearning: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  const [resources, setResources] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'videos' | 'lab' | 'ai_tools' | 'mindmap'>('notes');
  const [noteType, setNoteType] = useState<'detailed' | 'short' | 'revision' | 'formula_sheet'>('detailed');
  
  // AI Notes / Mindmap State
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [mindmapData, setMindmapData] = useState<any>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters(selectedBranch);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects(selectedSemester);
    }
  }, [selectedSemester]);

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

  useEffect(() => {
    if (selectedTopic) {
      fetchTopicResources(selectedTopic.id);
      fetchTopicVideos(selectedTopic.id);
      setGeneratedNotes('');
      setMindmapData(null);
    }
  }, [selectedTopic]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/engineering/branches`);
      setBranches(res.data);
      if (res.data.length > 0) setSelectedBranch(res.data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSemesters = async (branchId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/semesters?branch_id=${branchId}`);
      setSemesters(res.data);
      if (res.data.length > 0) setSelectedSemester(res.data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (semId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/subjects?semester_id=${semId}`);
      setSubjects(res.data);
      if (res.data.length > 0) setSelectedSubject(res.data[0].id.toString());
      else {
        setSubjects([]);
        setSelectedSubject('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnits = async (subjectId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/units?subject_id=${subjectId}`);
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
      if (res.data.length > 0) setSelectedTopic(res.data[0]);
      else setSelectedTopic(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopicResources = async (topicId: number) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/topics/${topicId}/resources`);
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopicVideos = async (topicId: number) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/topics/${topicId}/videos`);
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAINotes = async () => {
    if (!selectedTopic) return;
    setAiLoading(true);
    try {
      const subjectName = subjects.find(s => s.id.toString() === selectedSubject)?.name || 'Engineering Subject';
      const res = await axios.post(`${API_URL}/ai/generate-notes`, {
        subject: subjectName,
        topic: selectedTopic.name,
        note_type: noteType
      }, { headers });
      setGeneratedNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIMindMap = async () => {
    if (!selectedTopic) return;
    setAiLoading(true);
    try {
      const subjectName = subjects.find(s => s.id.toString() === selectedSubject)?.name || 'Engineering Subject';
      const res = await axios.post(`${API_URL}/ai/generate-mindmap`, {
        subject: subjectName,
        topic: selectedTopic.name,
        note_type: 'mindmap'
      }, { headers });
      setMindmapData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to render simple tree nodes
  const renderMindmapNode = (node: any) => {
    if (!node) return null;
    return (
      <div className="flex flex-col items-center gap-3 p-3 bg-white/80 border border-slate-100 rounded-2xl shadow-sm my-2">
        <span className="font-bold text-sm text-primary flex items-center gap-1">
          <Cpu size={14} /> {node.name}
        </span>
        {node.children && node.children.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center border-t border-slate-100 pt-3 w-full">
            {node.children.map((child: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                {renderMindmapNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Top Banner */}
      <div className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <BookOpen className="text-primary" size={32} />
            <span>Academic Curriculum Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Explore branches, download resources, watch free NPTEL/MIT lectures, and leverage AI notes compilers.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white rounded-3xl border border-white/70 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
        <ClaySelect
          label="Branch"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          options={branches.map(b => ({ value: b.id.toString(), label: `${b.name} (${b.code})` }))}
        />
        <ClaySelect
          label="Semester"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          options={semesters.map(s => ({ value: s.id.toString(), label: `Semester ${s.semester_number}` }))}
        />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topics List Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-slate-700 text-left pl-1">Syllabus Topics</h3>
          <div className="flex flex-col gap-3">
            {topics.length === 0 ? (
              <ClayCard className="text-center text-slate-400 py-6">No topics available.</ClayCard>
            ) : (
              topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all select-none cursor-pointer flex justify-between items-center ${
                    selectedTopic?.id === t.id
                      ? 'bg-primary/5 border-primary/40 shadow-[inset_2px_2px_4px_rgba(79,70,229,0.05)]'
                      : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-700">{t.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{t.description}</p>
                  </div>
                  <ChevronRight size={16} className={selectedTopic?.id === t.id ? 'text-primary' : 'text-slate-300'} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Resources Right Panel */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {selectedTopic ? (
            <ClayCard className="text-left flex flex-col gap-5 min-h-[500px]">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-slate-800">{selectedTopic.name}</h2>
                <p className="text-sm text-slate-400 mt-1">{selectedTopic.description}</p>
              </div>

              {/* Tabs list */}
              <div className="flex border-b border-slate-100 gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                    activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Syllabus Notes
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                    activeTab === 'videos' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab('ai_tools')}
                  className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ai_tools' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Sparkles size={14} /> AI Notes Compiler
                </button>
                <button
                  onClick={() => setActiveTab('mindmap')}
                  className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'mindmap' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Activity size={14} /> Mind Maps
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1">
                {activeTab === 'notes' && (
                  <div className="flex flex-col gap-4">
                    {resources.filter(r => r.resource_type === 'detailed_notes' || r.resource_type === 'formula_sheet').length === 0 ? (
                      <p className="text-sm text-slate-400 py-6 text-center">No syllabus notes uploaded by faculty yet. Generate them instantly using the AI tab!</p>
                    ) : (
                      resources.map((res) => (
                        <div key={res.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{res.resource_type.replace('_', ' ')}</span>
                          <h4 className="font-bold text-base text-slate-800">{res.title}</h4>
                          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2 font-mono">
                            {res.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.length === 0 ? (
                      <p className="text-sm text-slate-400 py-6 text-center col-span-2">No educational videos linked to this topic yet.</p>
                    ) : (
                      videos.map((vid) => (
                        <div key={vid.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                          <img src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={vid.course_title} className="w-full h-36 object-cover" />
                          <div className="p-4 flex flex-col gap-1.5 flex-1">
                            <span className="text-xs font-extrabold text-primary bg-primary/10 self-start px-2 py-0.5 rounded-full">{vid.platform}</span>
                            <h4 className="font-bold text-sm text-slate-700 line-clamp-1">{vid.course_title}</h4>
                            <p className="text-xs text-slate-400">By {vid.instructor || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{vid.description}</p>
                          </div>
                          <div className="p-4 pt-0">
                            <ClayButton
                              onClick={() => window.open(vid.video_url, '_blank')}
                              className="w-full text-xs py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
                            >
                              Watch Video
                            </ClayButton>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'ai_tools' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3 flex-wrap items-center">
                      <label className="text-xs font-bold text-slate-600">Compile Type:</label>
                      <select
                        value={noteType}
                        onChange={(e: any) => setNoteType(e.target.value)}
                        className="py-2 px-3 border border-slate-200 rounded-xl text-xs outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="detailed">Detailed Study Notes</option>
                        <option value="short">Quick Short Notes</option>
                        <option value="revision">Formula Cheat Sheet</option>
                      </select>
                      <ClayButton
                        onClick={generateAINotes}
                        disabled={aiLoading}
                        className="py-2 px-4 text-xs font-bold bg-primary text-white hover:bg-secondary rounded-xl flex items-center gap-1 ml-auto"
                      >
                        <Sparkles size={12} /> {aiLoading ? 'Compiling...' : 'Generate Notes'}
                      </ClayButton>
                    </div>

                    {generatedNotes && (
                      <div className="mt-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl text-left whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed shadow-sm">
                        {generatedNotes}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mindmap' && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="w-full flex justify-between items-center">
                      <p className="text-xs text-slate-500 font-semibold">Generate a visual mind map hierarchy of this engineering concept.</p>
                      <ClayButton
                        onClick={generateAIMindMap}
                        disabled={aiLoading}
                        className="py-2 px-4 text-xs font-bold bg-primary text-white hover:bg-secondary rounded-xl flex items-center gap-1"
                      >
                        <Sparkles size={12} /> {aiLoading ? 'Drawing...' : 'Build Mind Map'}
                      </ClayButton>
                    </div>

                    {mindmapData && (
                      <div className="w-full overflow-x-auto bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                        {renderMindmapNode(mindmapData)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ClayCard>
          ) : (
            <ClayCard className="text-center text-slate-400 py-20">Select a syllabus topic from the left side panel to view notes, tutorials, NPTEL videos, and mind maps.</ClayCard>
          )}
        </div>
      </div>
    </div>
  );
};
