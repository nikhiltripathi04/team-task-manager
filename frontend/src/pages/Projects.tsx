import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Could not load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError("");
    try {
      await api.post("/projects", { name });
      setName("");
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
          <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
          Workspaces
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Projects</h1>
        <p className="text-slate-500 font-medium">Create or jump into your collaborative boards.</p>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <form onSubmit={createProject} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Workspace name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            type="submit"
            disabled={creating || !name.trim()}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-indigo-600 transition-all duration-300 font-bold text-sm shadow-lg shadow-black/5 disabled:opacity-30 disabled:hover:bg-slate-900"
          >
            {creating ? "Launching..." : "Launch Project"}
          </button>
        </form>
        {error && <p className="mt-4 text-xs font-bold text-rose-500 px-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-6">🏜️</div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active projects</p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/projects/${p._id}`)}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 cursor-pointer transition-all duration-500 group relative"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    📂
                  </div>
                  <div className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">
                    #{p._id.slice(-4).toUpperCase()}
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {p.name}
                </h3>
                
                <p className="text-xs text-slate-400 font-medium mb-8">
                  Owned by <span className="text-slate-600 font-bold">{p.createdBy.name}</span>
                </p>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex -space-x-2">
                      {p.members?.slice(0, 4).map((m: any) => (
                        <div 
                          key={m._id} 
                          title={m.name}
                          className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm"
                        >
                          {m.name?.[0]}
                        </div>
                      ))}
                      {p.members?.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-500">
                          +{p.members.length - 4}
                        </div>
                      )}
                   </div>
                   <div className="text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Board →
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
