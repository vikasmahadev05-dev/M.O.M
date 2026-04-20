import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../store/tasksSlice';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreHorizontal,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import QuoteCard from '../components/QuoteCard';

const StatCard = ({ title, value, color, icon }) => (
  <div className="glass-card p-6 flex items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer">
    <div className="space-y-1">
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color} shadow-sm`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: tasks, loading } = useSelector(state => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedCount = tasks.length - activeTasks.length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, Vikas 👋</h1>
            <p className="text-[var(--text-muted)] text-sm md:text-base">You have {activeTasks.length} tasks to focus on today.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] w-full md:w-60"
              />
            </div>
            <button className="p-2.5 bg-white border border-[var(--border)] rounded-xl hover:bg-slate-50 transition-colors">
              <Filter size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Combined Daily Insight Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 xl:col-span-2">
            <QuoteCard />
          </div>
          
          <div className="glass-card p-6 bg-gradient-to-br from-white to-[var(--pastel-pink)] border-none shadow-md flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Daily Focus</h2>
               <div className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded text-[10px] font-bold">LIVE</div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[var(--text-main)]">Deep Work Session</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Connect with the design team to finalize the token system and component library.
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold">
                <span className="text-pink-500 uppercase tracking-widest">Focusing</span>
                <span className="text-[var(--text-main)]">45:00</span>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={tasks.length} 
          color="bg-[var(--pastel-blue)] text-blue-500" 
          icon={<CheckCircle2 size={24} />} 
        />
        <StatCard 
          title="Active" 
          value={activeTasks.length} 
          color="bg-[var(--pastel-purple)] text-purple-500" 
          icon={<Clock size={24} />} 
        />
        <StatCard 
          title="Progress" 
          value={`${progress}%`} 
          color="bg-[var(--pastel-green)] text-green-500" 
          icon={<CheckCircle2 size={24} />} 
        />
      </section>

      {/* Main Task Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Task List (2 cols) */}
        <section className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">My Tasks</h2>

            <div className="flex gap-2">
              {['All', 'To Do', 'In Progress'].map((tab, i) => (
                <button 
                  key={i} 
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--text-muted)] border border-[var(--border)] hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-10 text-center text-slate-400">Loading tasks...</div>
            ) : tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="glass-card p-5 flex items-center justify-between group hover:scale-[1.01] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.status === 'pending' ? 'bg-[var(--pastel-orange)]' : 'bg-green-50'}`}>
                    {task.status === 'pending' ? <AlertCircle size={20} className="text-orange-500" /> : <CheckCircle2 size={20} className="text-green-500" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-[var(--text-main)] ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>{task.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{task.category} • {task.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {task.priority}
                  </span>
                  <button className="p-2 hover:bg-slate-50 rounded-lg">
                    <MoreHorizontal size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && !loading && (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-sm">
                No tasks yet. Try converting a line from your notes!
              </div>
            )}
          </div>
        </section>

        {/* Small Widgets Area */}
        <section className="space-y-6">
          <div className="glass-card p-6 border-dashed border-2 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2 py-10">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--text-muted)]">
              <Plus size={20} />
            </div>
            <p className="text-xs font-bold text-[var(--text-muted)]">Add quick note</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
