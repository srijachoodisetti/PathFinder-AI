import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { Users, FolderGit, CheckSquare, Plus, CheckCircle2 } from 'lucide-react';

export const StudyGroups: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'groups' | 'projects'>('groups');

  // Groups
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Projects
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');

  // Project Tasks (Kanban)
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchStudyGroups();
    fetchProjects();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/study-groups`, { headers });
      setGroups(res.data);
      if (res.data.length > 0) setSelectedGroup(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/projects`, { headers });
      setProjects(res.data);
      if (res.data.length > 0) {
        handleSelectProject(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProject = async (proj: any) => {
    setSelectedProject(proj);
    try {
      const res = await axios.get(`${API_URL}/community/projects/${proj.id}/tasks`, { headers });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/community/study-groups`, {
        name: newGroupName,
        description: newGroupDesc
      }, { headers });
      setGroups([...groups, res.data]);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjTitle.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/community/projects`, {
        title: newProjTitle,
        description: newProjDesc,
        github_url: newProjGithub
      }, { headers });
      setProjects([...projects, res.data]);
      handleSelectProject(res.data);
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjGithub('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      const res = await axios.post(`${API_URL}/community/projects/${selectedProject.id}/tasks`, {
        project_id: selectedProject.id,
        title: newTaskTitle,
        description: "",
        status: "todo"
      }, { headers });
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskStatus = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'done' : 'todo';
    try {
      const res = await axios.post(`${API_URL}/community/projects/tasks/${taskId}/status?status_str=${nextStatus}`, {}, { headers });
      setTasks(tasks.map(t => t.id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Users className="text-primary" size={32} />
            <span>Collaboration Spaces</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Co-ordinate study sessions with group study chat feeds, or manage milestone task boards for course projects.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'groups' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Study Groups
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'projects' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Project Collaboration Workspace
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Create Group Form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Create Study Group</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                <textarea
                  placeholder="Focus subject details..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="clay-input text-xs font-semibold h-24"
                />
                <ClayButton onClick={handleCreateGroup} className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-xs">
                  Save Group
                </ClayButton>
              </ClayCard>
            </div>

            {/* List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Active Groups</h3>
              <div className="flex flex-col gap-3">
                {groups.map((g) => (
                  <div key={g.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:scale-[1.01] transition-transform">
                    <h4 className="font-bold text-sm text-slate-800">{g.name}</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{g.description}</p>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                      <span>Created at: {new Date(g.created_at).toLocaleDateString()}</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">Joined</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Project Creator Form */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Register New Project</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Project Title" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} />
                <ClayInput label="GitHub Repo URL" value={newProjGithub} onChange={(e) => setNewProjGithub(e.target.value)} />
                <textarea
                  placeholder="Task board objectives summary..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="clay-input text-xs font-semibold h-24"
                />
                <ClayButton onClick={handleCreateProject} className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-xs">
                  Create Project
                </ClayButton>
              </ClayCard>

              {/* List */}
              <h3 className="font-bold text-base text-slate-700 pl-1 mt-4">Project Workspaces</h3>
              <div className="flex flex-col gap-3">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className={`p-4 border rounded-2xl text-left transition-all ${
                      selectedProject?.id === p.id ? 'bg-primary/5 border-primary' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <h4 className="font-bold text-xs text-slate-800">{p.title}</h4>
                    {p.github_url && <span className="text-[10px] text-primary font-bold mt-1 inline-block">🌐 GitHub Linked</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Kanban Board */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {selectedProject ? (
                <>
                  <ClayCard className="p-6">
                    <h2 className="font-heading font-extrabold text-base text-slate-800 leading-tight">{selectedProject.title}</h2>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{selectedProject.description}</p>
                    {selectedProject.github_url && (
                      <a href={selectedProject.github_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline mt-4 inline-block">
                        🌐 View GitHub Repository
                      </a>
                    )}
                  </ClayCard>

                  {/* Task Adder */}
                  <ClayCard className="flex gap-2 p-3">
                    <input
                      type="text"
                      placeholder="Add milestone task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="clay-input text-xs font-semibold flex-1 outline-none border-none bg-slate-50 py-2 px-4 rounded-xl"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <ClayButton onClick={handleAddTask} className="bg-primary text-white hover:bg-secondary px-5 py-2 font-bold text-xs flex items-center gap-1">
                      <Plus size={14} /> Add
                    </ClayButton>
                  </ClayCard>

                  {/* Kanban Columns */}
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {/* Todo Column */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-3 min-h-[300px]">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider border-b pb-2">To Do ({tasks.filter(t => t.status === 'todo').length})</h4>
                      {tasks.filter(t => t.status === 'todo').map(t => (
                        <div key={t.id} onClick={() => handleToggleTaskStatus(t.id, t.status)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-primary">
                          <h5 className="font-bold text-xs text-slate-700">{t.title}</h5>
                        </div>
                      ))}
                    </div>

                    {/* In Progress Column */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-3 min-h-[300px]">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider border-b pb-2">In Progress ({tasks.filter(t => t.status === 'in_progress').length})</h4>
                      {tasks.filter(t => t.status === 'in_progress').map(t => (
                        <div key={t.id} onClick={() => handleToggleTaskStatus(t.id, t.status)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-primary">
                          <h5 className="font-bold text-xs text-slate-700">{t.title}</h5>
                        </div>
                      ))}
                    </div>

                    {/* Done Column */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-3 min-h-[300px]">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider border-b pb-2">Done ({tasks.filter(t => t.status === 'done').length})</h4>
                      {tasks.filter(t => t.status === 'done').map(t => (
                        <div key={t.id} onClick={() => handleToggleTaskStatus(t.id, t.status)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-primary flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-400 line-through">{t.title}</h5>
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <ClayCard className="text-center text-slate-400 py-32">Select a project workspace from the left list to load the task board.</ClayCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
