import React from 'react';
import { 
  Briefcase, 
  User, 
  BookOpen, 
  Star, 
  Calendar, 
  Clock,
  Hash,
  Plus
} from 'lucide-react';

const TodoSidebar = ({ activeCategory, setCategory, categories, tags }) => {
  const mainFilters = [
    { id: 'all', label: 'All Tasks', icon: Star, color: 'text-orange-500' },
    { id: 'today', label: 'Today', icon: Calendar, color: 'text-blue-500' },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Main Filters */}
      <div className="space-y-1">
        <h3 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Filters</h3>
        {mainFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setCategory(filter.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              activeCategory === filter.id 
                ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900' 
                : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
            }`}
          >
            <filter.icon size={18} className={filter.color} />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Categories</h3>
          <button className="p-1 hover:bg-white rounded-lg text-slate-300 hover:text-slate-600 transition-all">
            <Plus size={14} />
          </button>
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              activeCategory === cat.id 
                ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900' 
                : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${cat.color}`} />
              {cat.label}
            </div>
            <span className="text-[10px] font-black text-slate-300">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <h3 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2 px-4">
          {tags.map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 bg-white/50 border border-white rounded-xl text-[10px] font-bold text-slate-500 hover:bg-white hover:text-orange-500 transition-all"
            >
              # {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoSidebar;
