import React from 'react';
import { MoreHorizontal, Clock, Calendar as CalendarIcon } from 'lucide-react';

const ScheduleItem = ({ title, time, date, category, statusColor }) => (
  <div className="p-4 bg-white border border-[var(--border)] rounded-2xl group hover:border-[var(--accent)] transition-all hover:scale-[1.02] cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <input type="checkbox" className="w-5 h-5 rounded-md border-slate-200 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer" />
        <div>
          <h4 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{title}</h4>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">Due {date}</p>
        </div>
      </div>
      <span className="text-xs font-bold text-[var(--text-main)]">{time}</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>
        {category}
      </span>
      <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-300">
        <MoreHorizontal size={16} />
      </button>
    </div>
  </div>
);

const SchedulePanel = () => {
  const schedule = [
    { title: 'Team Meeting', time: '2 PM', date: '22/04/2026', category: 'Meetings', statusColor: 'bg-indigo-50 text-indigo-500' },
    { title: 'Gym Session', time: '4:30 PM', date: '23/04/2026', category: 'Health', statusColor: 'bg-pink-50 text-pink-500' },
    { title: 'Review Design Draft', time: 'All Day', date: '24/04/2026', category: 'Work', statusColor: 'bg-blue-50 text-blue-500' },
    { title: 'Project Presentation', time: '11 AM', date: '25/04/2026', category: 'Deep Work', statusColor: 'bg-emerald-50 text-emerald-500' },
  ];

  return (
    <div className="bg-slate-50/50 border border-[var(--border)] rounded-3xl p-6 h-full space-y-6 animate-in fade-in slide-in-from-right-6 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-main)]">Upcoming Schedule</h2>
        <button className="p-2 hover:bg-white rounded-xl text-slate-300">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-4 bg-white/50 p-1 rounded-2xl border border-[var(--border)]">
        {['All', 'Meetings', 'Work'].map((tab, i) => (
          <button 
            key={tab} 
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-white'}`}
          >
            {tab}
          </button>
        ))}
        <button className="px-2 text-[var(--text-muted)]"><MoreHorizontal size={14} /></button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Today</h3>
        {schedule.map((item, i) => (
          <ScheduleItem key={i} {...item} />
        ))}
      </div>

      <button className="w-full py-3 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-center border-t border-[var(--border)] pt-6 mt-4 uppercase tracking-widest">
        View all
      </button>
    </div>
  );
};

export default SchedulePanel;
