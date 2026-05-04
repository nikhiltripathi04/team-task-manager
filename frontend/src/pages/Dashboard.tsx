import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

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

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Here's your productivity overview</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Tasks" value={stats?.total} color="bg-blue-500" />
          <StatCard title="To Do" value={stats?.todo} color="bg-gray-500" />
          <StatCard title="In Progress" value={stats?.inProgress} color="bg-yellow-500" />
          <StatCard title="Completed" value={stats?.done} color="bg-green-500" />
          <StatCard title="Overdue" value={stats?.overdue} color="bg-red-500" />
        </div>
        
        <div className="mt-12 bg-white p-8 rounded-lg shadow-sm text-center border-2 border-dashed border-gray-200">
           <p className="text-gray-500">Project list and Task views coming in the next step!</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className={`h-1 ${color}`} />
    <div className="p-6">
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value || 0}</p>
    </div>
  </div>
);

export default Dashboard;
