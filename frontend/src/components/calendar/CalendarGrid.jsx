import React from 'react';
import { Settings } from 'lucide-react';

const CalendarGrid = () => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // 5 weeks mockup

  const events = [
    { day: 15, title: 'Gym Session', color: 'bg-indigo-100 text-indigo-500 border-indigo-200', colSpan: 3 },
    { day: 24, title: 'Team Meeting', color: 'bg-orange-50 text-orange-500 border-orange-100', colSpan: 2 },
    { day: 15, title: 'Gym Session', color: 'bg-indigo-100 text-indigo-500 border-indigo-200', colSpan: 3, rowOffset: 1 },
    { day: 31, title: 'Project Presentation', color: 'bg-emerald-50 text-emerald-500 border-emerald-100', colSpan: 3 },
  ];

  return (
    <div className="glass-card p-6 md:p-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center justify-between mb-8">
         <h4 className="font-bold text-lg text-[var(--text-main)]">May 2026</h4>
         <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-300">
           <Settings size={20} />
         </button>
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--border)] pb-4 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-bold text-[var(--text-muted)]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 relative">
        {dates.map((date, i) => {
          const isCurrentMonth = i >= 4 && i <= 34; // Mockup dummy logic
          const isToday = i === 18;
          
          return (
            <div 
              key={i} 
              className={`min-h-[100px] border-r border-b border-[var(--border)] p-2 relative transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 opacity-40'} ${i % 7 === 0 ? 'border-l' : ''} ${i < 7 ? 'border-t' : ''}`}
            >
              <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold ${isToday ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-main)]'}`}>
                {((i + 26) % 31) + 1}
              </span>

              {/* Event bars logic placeholder */}
              {i === 15 && (
                <div className="absolute top-10 left-0 right-[-200%] h-7 z-10 mx-1 px-3 bg-indigo-100 border-l-4 border-indigo-400 text-indigo-600 text-[10px] font-bold rounded-lg flex items-center shadow-sm">
                  Gym Session
                </div>
              )}
              {i === 17 && (
                <div className="absolute top-10 left-0 right-[-100%] h-7 z-10 mx-1 px-3 bg-orange-50 border-l-4 border-orange-400 text-orange-600 text-[10px] font-bold rounded-lg flex items-center shadow-sm">
                  Team Meeting
                </div>
              )}
              {i === 29 && (
                <div className="absolute top-14 left-0 right-[-100%] h-7 z-10 mx-1 px-3 bg-emerald-50 border-l-4 border-emerald-400 text-emerald-600 text-[10px] font-bold rounded-lg flex items-center shadow-sm">
                  Project Presentation
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
