import React from 'react';
import { Plus, Bell, Calendar as CalendarIcon, Bot, ArrowRight } from 'lucide-react';

const RightPanel = () => {
  return (
    <aside className="hidden xl:flex w-80 h-screen bg-white border-l border-[var(--border)] p-6 space-y-8 sticky top-0 flex-col overflow-y-auto">
      {/* Search & Notifs placeholder */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-[var(--text-main)]">Planner</h3>
        <button className="p-2 rounded-full hover:bg-slate-50 relative">
          <Bell size={20} className="text-[var(--text-muted)]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3">
        <button className="flex items-center gap-3 w-full p-4 bg-[var(--accent)] text-white rounded-2xl shadow-md shadow-indigo-100 hover:scale-[1.02] transition-transform font-medium">
          <Plus size={20} />
          <span>Add New Task</span>
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-2 p-3 bg-[var(--pastel-blue)] rounded-2xl hover:bg-blue-100 transition-colors">
            <Bell size={18} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">Reminder</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-[var(--pastel-green)] rounded-2xl hover:bg-green-100 transition-colors">
            <CalendarIcon size={18} className="text-green-600" />
            <span className="text-xs font-semibold text-green-600">Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Widget Placeholder */}
      <div className="p-5 glass-card space-y-4">
        <div className="flex items-center justify-between font-bold text-sm">
          <span>April 2026</span>
          <div className="flex gap-1">
             <button className="p-1 hover:bg-slate-50 rounded">&lt;</button>
             <button className="p-1 hover:bg-slate-50 rounded">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-[var(--text-muted)]">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
          {[...Array(31)].map((_, i) => (
            <div 
              key={i} 
              className={`p-1.5 rounded-lg ${i === 18 ? 'bg-[var(--accent)] text-white' : 'hover:bg-slate-50 text-[var(--text-main)] cursor-pointer'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Assistant Widget */}
      <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 text-indigo-200 group-hover:text-indigo-300 transition-colors">
          <Bot size={40} />
        </div>
        <div className="relative space-y-3">
          <h4 className="font-bold text-[var(--text-main)] flex items-center gap-2">
            M.O.M Assistant
          </h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            "You have 3 tasks to finish today. Need help prioritizing them?"
          </p>
          <button className="flex items-center gap-2 text-[var(--accent)] text-xs font-semibold hover:gap-3 transition-all">
            Chat now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
