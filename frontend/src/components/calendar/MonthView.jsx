import React from 'react';
import { format, isSameMonth, isSameDay, isToday, startOfMonth, startOfWeek, endOfWeek, endOfMonth, eachDayOfInterval } from 'date-fns';
import EventCard from './EventCard';

const MonthView = ({ date, items, onEventClick, onDayClick }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col bg-transparent">
      {/* Month Header - Day Names */}
      <div className="grid grid-cols-7 border-b border-slate-100/50 bg-slate-50/30 backdrop-blur-md">
        {weekDays.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[80px] md:auto-rows-[140px]">
        {calendarDays.map((day, idx) => {
          const dayItems = items.filter(item => 
            isSameDay(new Date(item.startTime), day) && 
            !(item.type === 'reminder' && item.status === 'completed')
          );
          const isCurrentMonth = isSameMonth(day, monthStart);
          const today = isToday(day);
          
          return (
            <div 
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={`
                relative p-1 md:p-3 border-r border-b border-slate-50 flex flex-col gap-1 transition-all cursor-pointer group
                ${!isCurrentMonth ? 'bg-slate-50/20 opacity-40' : 'bg-white/40 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 hover:z-10'}
                ${idx % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`
                  text-[10px] md:text-sm font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-xl transition-all
                  ${today 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-400/50 scale-110' 
                    : isCurrentMonth ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-300'}
                `}>
                  {format(day, 'd')}
                </span>
                
                {dayItems.length > 0 && (
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400/60 uppercase tracking-tighter">
                      {dayItems.length} {dayItems.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile View: Dots */}
              <div className="flex md:hidden flex-wrap gap-1 justify-center mt-1">
                {dayItems.slice(0, 4).map(item => (
                  <div 
                    key={item._id} 
                    className="w-1.5 h-1.5 rounded-full shadow-sm"
                    style={{ backgroundColor: item.colorTag || '#9333ea' }}
                  />
                ))}
                {dayItems.length > 4 && <div className="w-1 h-1 bg-slate-300 rounded-full" />}
              </div>

              {/* Desktop View: Full Cards */}
              <div className="hidden md:flex flex-col gap-1.5 overflow-hidden">
                {dayItems.slice(0, 3).map(item => (
                  <div key={item._id} className="transition-transform hover:scale-[1.02]">
                    <EventCard item={item} onClick={onEventClick} compact={true} />
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-[10px] font-black text-indigo-500 pl-1 uppercase tracking-widest pt-1">
                    + {dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
