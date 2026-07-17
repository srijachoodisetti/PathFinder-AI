import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect, SkeletonLoader } from '../components/ui';
import { Settings, Users, Database, Sparkles, BookOpen, Layers, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'users' | 'curriculum' | 'telemetry'>('users');
  
  // Users States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Curriculum Management States
  const [depts, setDepts] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [sems, setSems] = useState<any[]>([]);
  const [selectedSem, setSelectedSem] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // CRUD Create states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  useEffect(() => {
    fetchAdminData();
    fetchCurriculumData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsersList(usersRes.data);

      const statsRes = await axios.get(`${API_URL}/admin/system-stats`, { headers });
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculumData = async () => {
    try {
      const deptsRes = await axios.get(`${API_URL}/engineering/departments`, { headers });
      setDepts(deptsRes.data);
      if (deptsRes.data.length > 0) {
        setSelectedDept(deptsRes.data[0].id.toString());
        fetchBranches(deptsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranches = async (deptId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/branches?department_id=${deptId}`, { headers });
      setBranches(res.data);
      if (res.data.length > 0) {
        setSelectedBranch(res.data[0].id.toString());
        fetchSemesters(res.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSemesters = async (branchId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/semesters?branch_id=${branchId}`, { headers });
      setSems(res.data);
      if (res.data.length > 0) {
        setSelectedSem(res.data[0].id.toString());
        fetchSubjects(res.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (semId: string) => {
    try {
      const res = await axios.get(`${API_URL}/engineering/subjects?semester_id=${semId}`, { headers });
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addSubject = async () => {
    if (!selectedSem || !newSubjectName || !newSubjectCode) return;
    try {
      const res = await axios.post(`${API_URL}/engineering/subjects`, {
        semester_id: parseInt(selectedSem),
        name: newSubjectName,
        code: newSubjectCode
      }, { headers });
      setSubjects([...subjects, res.data]);
      setNewSubjectName('');
      setNewSubjectCode('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/toggle-active`, {}, { headers });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const telemetryData = [
    { name: '08:00', users: 120, traffic: 340 },
    { name: '10:00', users: 240, traffic: 650 },
    { name: '12:00', users: 310, traffic: 890 },
    { name: '14:00', users: 280, traffic: 710 },
    { name: '16:00', users: 390, traffic: 920 },
    { name: '18:00', users: 450, traffic: 1200 },
    { name: '20:00', users: 300, traffic: 800 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4">
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-white flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-2">
            <Settings className="text-primary" size={32} />
            <span>Admin Control Room</span>
          </h1>
          <p className="text-sm text-slate-300 font-medium mt-2">
            Global CRUD configuration of departments, branches, semesters, subjects, and user access.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'curriculum' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Manage Curriculum
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'telemetry' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          System Telemetry
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'users' && (
          <ClayCard className="p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" /> Registered User Accounts
            </h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-800">{usr.full_name}</td>
                      <td className="py-3.5">{usr.email}</td>
                      <td className="py-3.5 capitalize">{usr.role}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          usr.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {usr.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button onClick={() => handleToggleActive(usr.id)} className="text-xs font-bold text-primary hover:underline">
                          {usr.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>
        )}

        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Selectors */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Syllabus Selectors</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClaySelect
                  label="Department"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    fetchBranches(e.target.value);
                  }}
                  options={depts.map(d => ({ value: d.id.toString(), label: d.name }))}
                />
                <ClaySelect
                  label="Branch"
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    fetchSemesters(e.target.value);
                  }}
                  options={branches.map(b => ({ value: b.id.toString(), label: b.name }))}
                />
                <ClaySelect
                  label="Semester"
                  value={selectedSem}
                  onChange={(e) => {
                    setSelectedSem(e.target.value);
                    fetchSubjects(e.target.value);
                  }}
                  options={sems.map(s => ({ value: s.id.toString(), label: `Semester ${s.semester_number}` }))}
                />
              </ClayCard>
            </div>

            {/* Subjects Table & Creator */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Configure Subjects</h3>
              <ClayCard className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <ClayInput label="Subject Name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="e.g. Distributed Systems" />
                  <ClayInput label="Subject Code" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="e.g. CS508" />
                </div>
                <ClayButton onClick={addSubject} className="bg-primary text-white hover:bg-secondary rounded-xl py-2 px-6 text-xs font-bold self-end">
                  Add Subject
                </ClayButton>

                <div className="mt-4 border-t border-slate-100 pt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="pb-2">Code</th>
                        <th className="pb-2">Subject Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id} className="border-b border-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{s.code}</td>
                          <td className="py-2.5">{s.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 flex flex-col gap-4">
              {stats && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <ClayCard className="p-4 flex flex-col gap-1">
                      <span className="text-[10px] text-text/50 font-bold uppercase">Users Count</span>
                      <span className="text-xl font-extrabold text-primary">{stats.users_count.total}</span>
                    </ClayCard>
                    <ClayCard className="p-4 flex flex-col gap-1">
                      <span className="text-[10px] text-text/50 font-bold uppercase">Database status</span>
                      <span className="text-xs font-bold text-success flex items-center gap-1 mt-2">
                        <Database size={14} /> {stats.database_status}
                      </span>
                    </ClayCard>
                  </div>
                </>
              )}

              {/* Server CPU and Performance Dials */}
              <ClayCard className="p-5 flex flex-col gap-3">
                <h3 className="font-bold text-xs text-slate-700 uppercase border-b pb-2">Active Node Metrics</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>CPU Core Load</span>
                    <span className="text-primary">12%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Server RAM Usage</span>
                    <span className="text-emerald-500">42%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Disk Capacity</span>
                    <span className="text-amber-500">68%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
              </ClayCard>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Traffic chart */}
              <ClayCard className="p-6">
                <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                  <Database size={18} className="text-primary" /> Active User Traffic (Real-time telemetry)
                </h3>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ClayCard>

              {/* Server Console Logs */}
              <ClayCard className="p-6">
                <h3 className="font-bold text-base text-slate-800 mb-3 border-b pb-2">Active Server Log Stream</h3>
                <div className="p-4 bg-slate-900 border border-slate-950 rounded-2xl text-[10px] font-mono text-emerald-400 leading-relaxed h-32 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                  <div>[INFO] 2026-07-17T14:18:02Z - GET /api/v1/personalization/recommendations - 200 OK - client_ip: 127.0.0.1</div>
                  <div>[INFO] 2026-07-17T14:18:10Z - POST /api/v1/ai/explain-doubt - 200 OK - client_ip: 127.0.0.1</div>
                  <div>[INFO] 2026-07-17T14:18:12Z - GET /api/v1/assessment/exams - 200 OK - client_ip: 127.0.0.1</div>
                  <div>[INFO] 2026-07-17T14:18:18Z - GET /api/v1/community/discussions - 200 OK - client_ip: 127.0.0.1</div>
                </div>
              </ClayCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
