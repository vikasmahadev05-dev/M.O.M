import React from 'react';
import { Plus, Star, Sparkles } from 'lucide-react';

const CalendarHeader = ({ onAddClick }) => {
  return (
    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          Calendar
          <Sparkles size={24} className="text-amber-400" />
        </h1>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Organize your time effectively</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#FED7AA] text-orange-900/70 rounded-2xl shadow-[0_4px_15px_rgba(253,186,116,0.15)] hover:scale-105 transition-all font-black text-sm border border-orange-200/50"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
