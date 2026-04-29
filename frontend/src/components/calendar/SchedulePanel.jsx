import React from 'react';
import { MoreHorizontal, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { format, isAfter, startOfDay } from 'date-fns';
import { setView } from '../../store/calendarSlice';
import { generateRecurrenceInstances } from '../../utils/calendarUtils';
import { addDays } from 'date-fns';

const ScheduleItem = ({ item }) => (
  <div className="group relative p-5 bg-white border border-slate-100/80 rounded-[1.5rem] hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer overflow-hidden">
    <div 
      className="absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2" 
      style={{ backgroundColor: item.colorTag || '#9333ea' }}
    />
    
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-black text-sm text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1 tracking-tight">
            {item.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {format(new Date(item.startTime), 'MMM d')}
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {format(new Date(item.startTime), 'h:mm a')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-orange-600 transition-all">
            <MoreHorizontal size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ backgroundColor: `${item.colorTag}15`, color: item.colorTag }}
          >
            {item.type}
          </div>
          {item.calendarName && (
            <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 max-w-[100px] truncate">
              {item.calendarName}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {item.status === 'completed' ? (
            <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
              <Clock size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SchedulePanel = () => {
  const dispatch = useDispatch();
  const { items, googleEvents, googleConnected, googleSyncEnabled } = useSelector((state) => state.calendar);
  
  // Get upcoming items (next 24 hours)
  const upcomingItems = React.useMemo(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // 1. Expand local recurring items for the next day
    const localInstances = generateRecurrenceInstances(items, now, next24Hours);
    
    // 2. Deduplicate Google events (don't show if we already have it locally)
    const localGoogleEventIds = new Set(
      localInstances
        .filter(item => item.googleEventId)
        .map(item => item.googleEventId)
    );

    const uniqueGoogleEvents = googleEvents.filter(
      ge => !localGoogleEventIds.has(ge._id)
    );

    // 3. Merge and Filter for strict next 24 hours
    const allUpcoming = [...localInstances, ...uniqueGoogleEvents]
      .filter(item => {
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime || item.startTime);
        const isNotHoliday = !item.calendarName?.toLowerCase().includes('holiday');
        
        // Show if it starts within 24h OR is currently happening (ends after now)
        const isRelevantTime = (isAfter(startTime, now) && startTime <= next24Hours) || 
                               (isAfter(endTime, now) && startTime <= now);
                               
        return isRelevantTime && item.status !== 'completed' && isNotHoliday;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);

    return allUpcoming;
  }, [items, googleEvents]);

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 h-fit space-y-8 animate-in fade-in slide-in-from-right-6 duration-700 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Timeline</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next 24 hours</p>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-900/20">
          {upcomingItems.length}
        </div>
      </div>

      {upcomingItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <CalendarIcon size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {upcomingItems.map((item) => (
            <ScheduleItem key={item._id} item={item} />
          ))}
        </div>
      )}

      <button 
        onClick={() => dispatch(setView('agenda'))}
        className="group w-full py-5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-[1.5rem] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden relative"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Full Agenda</span>
        <Clock size={16} className="relative z-10 group-hover:rotate-12 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </div>
  );
};

export default SchedulePanel;
