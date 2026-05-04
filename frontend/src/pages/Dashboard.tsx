import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/tasks/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
          <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
          Overview
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 font-medium">Your personal productivity dashboard is ready.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total" value={stats?.total} icon="🎯" color="from-indigo-500 to-indigo-600" />
        <StatCard title="To Do" value={stats?.todo} icon="📝" color="from-slate-400 to-slate-500" />
        <StatCard title="Work" value={stats?.inProgress} icon="⚡" color="from-amber-400 to-amber-500" />
        <StatCard title="Done" value={stats?.done} icon="✅" color="from-emerald-400 to-emerald-500" />
        <StatCard title="Alerts" value={stats?.overdue} icon="🚨" color="from-rose-500 to-rose-600" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-500" />
          
          <h2 className="text-2xl font-black text-slate-900 mb-4 relative z-10">System Status</h2>
          <p className="text-slate-500 leading-relaxed max-w-md relative z-10">
            All services are operational. You have <span className="text-indigo-600 font-bold">{stats?.overdue || 0} tasks</span> that require immediate attention.
          </p>
          
          <button className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/20 transition-all duration-300 relative z-10">
            View Urgent Tasks
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-10 text-white shadow-xl shadow-indigo-600/10">
          <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
          <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
            Use the Kanban board to drag and drop tasks between statuses for faster updates.
          </p>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-lg shadow-black/5 mb-4`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
    <p className="text-3xl font-black text-slate-900">{value || 0}</p>
  </div>
);

export default Dashboard;
