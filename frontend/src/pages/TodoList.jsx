import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  Flag
} from 'lucide-react';

const TaskItem = ({ title, date, priority, category, completed }) => (
  <div className="glass-card p-5 flex items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${completed ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-slate-200 text-transparent'}`}>
        <CheckCircle2 size={16} />
      </button>
      <div>
        <h4 className={`font-bold text-[var(--text-main)] ${completed ? 'line-through opacity-50' : ''}`}>{title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} /> {date}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider flex items-center gap-1">
            <Flag size={12} className={priority === 'High' ? 'text-red-400' : 'text-blue-400'} /> {priority}
          </p>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{category}</span>
        </div>
      </div>
    </div>
    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300">
      <MoreHorizontal size={18} />
    </button>
  </div>
);

const TodoList = () => {
  const tasks = [
    { title: 'Finalize Design System', date: 'April 22, 2026', priority: 'High', category: 'Project', completed: false },
    { title: 'User Interviews', date: 'April 23, 2026', priority: 'Medium', category: 'Research', completed: true },
    { title: 'Update Dashboard UI', date: 'April 24, 2026', priority: 'High', category: 'Frontend', completed: false },
    { title: 'Clean up codebase', date: 'April 25, 2026', priority: 'Low', category: 'Refactor', completed: false },
    { title: 'Review Marketing Copy', date: 'April 26, 2026', priority: 'Medium', category: 'Marketing', completed: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">To-Do List</h1>
          <p className="text-[var(--text-muted)] text-sm">Organize your tasks and stay productive.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-2xl shadow-lg shadow-indigo-100 font-bold text-sm hover:scale-105 transition-all">
          <Plus size={20} />
          <span>Add New Task</span>
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/50 p-2 rounded-3xl border border-[var(--border)]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'To-Do', 'Completed'].map((tab, i) => (
            <button 
              key={tab} 
              className={`px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-white text-[var(--accent)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:bg-white'}`}
            >
              {tab}
            </button>
          ))}
          <button className="p-3 bg-white border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:bg-slate-50">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Task Sections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Tasks</h3>
          <span className="text-[10px] font-bold text-[var(--accent)] bg-indigo-50 px-2 py-0.5 rounded-full">4 Tasks</span>
        </div>
        <div className="space-y-3">
          {tasks.filter(t => !t.completed).map((task, i) => (
            <TaskItem key={i} {...task} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Completed</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">1 Task</span>
        </div>
        <div className="space-y-3 opacity-80">
          {tasks.filter(t => t.completed).map((task, i) => (
            <TaskItem key={i} {...task} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TodoList;
