import React from 'react';
import { Plus, Star } from 'lucide-react';

const NotesHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Notes</h1>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl shadow-md shadow-indigo-100 hover:scale-105 transition-all font-semibold text-sm">
          <Plus size={18} />
          <span>New Note</span>
        </button>
        <button className="p-2.5 bg-white border border-[var(--border)] rounded-xl hover:bg-slate-50 transition-colors text-[var(--text-muted)]">
          <Star size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotesHeader;
