import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const NotesFilters = () => {
  const categories = ['All', 'Work', 'Personal', 'Ideas'];
  
  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm"
          />
        </div>
        <button className="p-3.5 bg-white border border-[var(--border)] rounded-2xl hover:bg-slate-50 transition-colors text-[var(--text-muted)] shadow-sm">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${i === 0 ? 'bg-[var(--accent)] text-white shadow-md shadow-indigo-100' : 'bg-white text-[var(--text-muted)] border border-[var(--border)] hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotesFilters;
