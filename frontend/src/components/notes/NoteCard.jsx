import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const NoteCard = ({ title, category, content, date, color }) => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 group hover:border-[var(--accent)] hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-lg text-[var(--text-main)] leading-tight group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-[var(--text-muted)] transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${color}`}>
          {category}
        </span>
      </div>

      <p className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed flex-1">
        {content}
      </p>

      <div className="pt-4 border-t border-[var(--border)]">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Last Edited {date}
        </p>
      </div>
    </div>
  );
};

export default NoteCard;
