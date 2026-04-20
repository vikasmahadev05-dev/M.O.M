import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const CalendarControls = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-1 flex shadow-sm">
          {['Month', 'Week', 'Day'].map((view, i) => (
            <button 
              key={view} 
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${i === 0 ? 'bg-[var(--accent)] text-white shadow-md shadow-indigo-100' : 'text-[var(--text-muted)] hover:bg-slate-50'}`}
            >
              {view}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-2xl p-1 shadow-sm">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-[var(--text-muted)]">
            <ChevronLeft size={18} />
          </button>
          <button className="px-4 py-2 text-sm font-bold text-[var(--text-main)] hover:bg-slate-50 rounded-xl">Today</button>
          <button className="p-2 hover:bg-slate-50 rounded-xl text-[var(--text-muted)]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full md:w-64 pl-11 pr-4 py-3 bg-white border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm"
          />
        </div>
        <button className="p-3 bg-white border border-[var(--border)] rounded-2xl hover:bg-slate-50 transition-colors text-[var(--text-muted)] shadow-sm">
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
};

export default CalendarControls;
