import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err: any) {
      console.error("Failed to fetch project details", err);
      if (err.response?.status === 404) navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError("");
    try {
      await api.post("/tasks", {
        title,
        projectId: id,
        assignedTo: user.id
      });
      setTitle("");
      fetchProjectData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  if (loading) return <Loader />;

  const columns = [
    { id: "todo", label: "To Do", color: "bg-slate-100/50", dot: "bg-slate-400" },
    { id: "in-progress", label: "In Progress", color: "bg-amber-50/50", dot: "bg-amber-500" },
    { id: "done", label: "Done", color: "bg-emerald-50/50", dot: "bg-emerald-500" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            Project Board
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project?.name}</h1>
        </div>
        
        <form onSubmit={createTask} className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <input
            className="flex-1 lg:w-72 bg-transparent border-none rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none"
            placeholder="Quick add task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button 
            type="submit"
            disabled={creating || !title.trim()}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all font-bold text-xs disabled:opacity-30"
          >
            {creating ? "..." : "Add"}
          </button>
        </form>
      </header>

      {error && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {columns.map((col) => (
          <div key={col.id} className={`${col.color} p-6 rounded-[32px] min-h-[700px] border border-white/50 relative group`}>
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  {col.label}
                </h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="space-y-4">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t) => (
                  <div key={t._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group/card">
                    <h4 className="font-bold text-slate-800 leading-snug mb-6 group-hover/card:text-indigo-600 transition-colors">
                      {t.title}
                    </h4>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-white shadow-sm">
                           {t.assignedTo?.name?.[0]}
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                           {t.assignedTo?.name.split(' ')[0]}
                         </span>
                      </div>
                      
                      <div className="relative group/select">
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t._id, e.target.value)}
                          className="appearance-none text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer transition-all"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">Doing</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-300 rounded-[32px]">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Void</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
