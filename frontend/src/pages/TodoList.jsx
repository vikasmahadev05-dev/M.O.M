import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, toggleTask, deleteTask } from '../store/tasksSlice';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search, 
  Filter, 
  Trash2,
  Calendar,
  Flag
} from 'lucide-react';

const TaskItem = ({ id, title, date, priority, category, status, onToggle, onDelete }) => {
  const isCompleted = status === 'completed';
  
  return (
    <div className="glass-card p-5 flex items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(id); }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-slate-200 text-transparent'}`}
        >
          <CheckCircle2 size={16} />
        </button>
        <div>
          <h4 className={`font-bold text-[var(--text-main)] ${isCompleted ? 'line-through opacity-50' : ''} text-sm md:text-base`}>{title}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Calendar size={12} /> {date}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Flag size={12} className={priority === 'High' ? 'text-red-400' : 'text-blue-400'} /> {priority}
            </p>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">{category}</span>
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg text-red-300 transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

const TodoList = () => {
  const dispatch = useDispatch();
  const { list: tasks, loading } = useSelector(state => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleToggle = (id) => dispatch(toggleTask(id));
  const handleDelete = (id) => dispatch(deleteTask(id));

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
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0">
          {['All', 'To-Do', 'Completed'].map((tab, i) => (
            <button 
              key={tab} 
              className={`px-4 md:px-6 py-2 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${i === 0 ? 'bg-white text-[var(--accent)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:bg-white'}`}
            >
              {tab}
            </button>
          ))}
          <button className="p-3 bg-white border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:bg-slate-50 shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Task Sections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Tasks</h3>
          <span className="text-[10px] font-bold text-[var(--accent)] bg-indigo-50 px-2 py-0.5 rounded-full">
            {tasks.filter(t => t.status !== 'completed').length} Tasks
          </span>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading tasks...</div>
          ) : tasks.filter(t => t.status !== 'completed').map((task) => (
            <TaskItem 
              key={task._id} 
              id={task._id} 
              title={task.title}
              date={task.date}
              priority={task.priority}
              category={task.category}
              status={task.status}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {!loading && tasks.filter(t => t.status !== 'completed').length === 0 && (
            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-sm">
              All caught up! No active tasks.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Completed</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {tasks.filter(t => t.status === 'completed').length} Task
          </span>
        </div>
        <div className="space-y-3 opacity-80">
          {tasks.filter(t => t.status === 'completed').map((task) => (
            <TaskItem 
              key={task._id} 
              id={task._id} 
              title={task.title}
              date={task.date}
              priority={task.priority}
              category={task.category}
              status={task.status}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TodoList;
