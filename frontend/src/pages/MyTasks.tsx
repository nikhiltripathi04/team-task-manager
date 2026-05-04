import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

const MyTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks/my-tasks");
        setTasks(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
          <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
          Task Center
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {user?.role === "admin" ? "All Project Tasks" : "My Assigned Tasks"}
        </h1>
        <p className="text-slate-500 font-medium">
          {user?.role === "admin" 
            ? "Overview of all tasks across your managed projects." 
            : "Focus on your personal work queue."}
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 border border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">✨</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-500">Everything looks clear! Enjoy the breathing room.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <div 
              key={task._id}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                  task.status === 'done' ? 'bg-emerald-50 text-emerald-500' :
                  task.status === 'in-progress' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
                }`}>
                  {task.status === 'done' ? '✅' : task.status === 'in-progress' ? '⚡' : '📝'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {task.project?.name}
                    </span>
                    {user?.role === "admin" && (
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        Assigned to: <span className="text-slate-600">{task.assignedTo?.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                    task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {task.status}
                  </span>
                </div>
                
                <Link 
                  to={`/projects/${task.project?._id}`}
                  className="px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
