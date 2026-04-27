import React from 'react';
import { Plus, Star, Sparkles } from 'lucide-react';

const CalendarHeader = ({ onAddClick }) => {
  return (
    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          Calendar
          <Sparkles size={24} className="text-indigo-400" />
        </h1>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Organize your time effectively</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-all font-black text-sm"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
        <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400 group shadow-sm">
          <Star size={20} className="group-hover:text-yellow-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
