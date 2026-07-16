import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import {
  Settings,
  Users,
  Database,
  Terminal,
  Activity,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await axios.get(`${API_URL}/admin/users`);
      setUsersList(usersRes.data);

      const statsRes = await axios.get(`${API_URL}/admin/system-stats`);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/toggle-active`);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error(err);
    }
  };

  // Recharts telemetry data
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
      <div className="flex flex-col gap-6 w-full">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left font-body">
      {/* Top Banner */}
      <ClayCard className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center border-none">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">System Admin Control Room 🛠️</h2>
          <p className="text-sm text-slate-300">Manage users, check platform metrics, and analyze node status.</p>
        </div>
      </ClayCard>

      {/* Telemetry Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Total Accounts</span>
            <span className="text-xl font-extrabold text-primary">{stats.users_count.total}</span>
          </ClayCard>
          
          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Courses Live</span>
            <span className="text-xl font-extrabold text-secondary">{stats.courses_count}</span>
          </ClayCard>

          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">Database State</span>
            <span className="text-xs font-bold text-success flex items-center gap-1 mt-1">
              <Database size={14} />
              {stats.database_status}
            </span>
          </ClayCard>

          <ClayCard flat className="p-4 bg-white border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-text/50 font-bold uppercase">AI Services status</span>
            <span className="text-xs font-bold text-secondary flex items-center gap-1 mt-1">
              <Activity size={14} />
              {stats.ai_engine}
            </span>
          </ClayCard>
        </div>
      )}

      {/* Roster & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roster table */}
        <div className="lg:col-span-2">
          <ClayCard className="p-4 overflow-hidden border border-slate-100 bg-white">
            <h3 className="font-heading font-bold text-sm border-b pb-3 mb-4">All Registered Accounts</h3>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b text-text/55">
                    <th className="pb-2 font-bold uppercase pl-2">Full Name</th>
                    <th className="pb-2 font-bold uppercase">Email Address</th>
                    <th className="pb-2 font-bold uppercase">System Role</th>
                    <th className="pb-2 font-bold uppercase text-center">Status</th>
                    <th className="pb-2 font-bold uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-text/80">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 pl-2 font-bold text-text/90">{u.full_name}</td>
                      <td className="py-3 text-text/60">{u.email}</td>
                      <td className="py-3 font-semibold capitalize text-primary">{u.role}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${u.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className="text-text/60 hover:text-primary transition-all p-1"
                        >
                          {u.is_active ? <ToggleRight size={22} className="text-success" /> : <ToggleLeft size={22} className="text-text/30" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>
        </div>

        {/* Telemetry charts */}
        <div className="flex flex-col gap-6">
          <ClayCard className="flex flex-col gap-3 bg-white">
            <h4 className="font-heading font-bold text-xs text-text/80 flex items-center gap-1.5 border-b pb-2">
              <TrendingUp size={16} className="text-primary" />
              API Server Traffic (Requests/min)
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" />
                  <YAxis fontSize={9} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="traffic" stroke="#4F46E5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>

          <ClayCard className="flex flex-col gap-3 bg-white">
            <h4 className="font-heading font-bold text-xs text-text/80 flex items-center gap-1.5 border-b pb-2">
              <Activity size={16} className="text-secondary" />
              Active Concurrent Sessions
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" />
                  <YAxis fontSize={9} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
