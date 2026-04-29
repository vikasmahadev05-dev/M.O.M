import React, { useState } from 'react';
import { 
  format, isToday, isTomorrow, isSameDay, isAfter, 
  startOfDay, addDays, endOfMonth, addMonths, isBefore 
} from 'date-fns';
import { Search, Calendar as CalendarIcon, Clock, ChevronRight, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgendaView = ({ items, onEventClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewLimit, setViewLimit] = useState(endOfMonth(new Date()));

  const now = startOfDay(new Date());

  const filteredItems = items.filter(item => {
    const itemDate = new Date(item.startTime);
    const itemEndDate = new Date(item.endTime || item.startTime);
    const isFutureOrToday = isAfter(itemDate, now) || isToday(itemDate) || (isAfter(itemEndDate, now) && isBefore(itemDate, now));
    const isWithinLimit = isBefore(itemDate, viewLimit) || isSameDay(itemDate, viewLimit);
    const isNotHoliday = !item.calendarName?.toLowerCase().includes('holiday');
    
    if (!isFutureOrToday || !isWithinLimit || !isNotHoliday) return false;

    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const handleLoadMore = () => {
    setViewLimit(prev => endOfMonth(addMonths(prev, 1)));
  };

  const groupedItems = filteredItems.reduce((acc, item) => {
    const dateStr = format(new Date(item.startTime), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort();

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Premium Search & Filter Architecture */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search your journey..."
            className="w-full pl-14 pr-6 py-4 bg-white/60 backdrop-blur-xl border border-white shadow-sm rounded-[2rem] text-sm font-bold text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['all', 'event', 'task', 'reminder'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${filterType === type 
                  ? 'bg-amber-100/50 text-amber-900 border border-amber-200/50 shadow-sm' 
                  : 'bg-white/40 text-slate-400 border border-white hover:bg-white/80'}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda Content Viewport */}
      <div className="relative">
        <div className="max-h-[650px] overflow-y-auto no-scrollbar scroll-smooth pr-2">
          <div className="space-y-12 pb-10">
            {sortedDates.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CalendarIcon className="text-slate-200" size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Horizon is Clear</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">No upcoming activities found</p>
              </motion.div>
            ) : (
              sortedDates.map((dateStr, dIdx) => {
                const date = new Date(dateStr);
                const items = groupedItems[dateStr];
                
                return (
                  <motion.div 
                    key={dateStr}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dIdx * 0.1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-6 sticky top-0 z-10 py-2">
                      <div className={`
                        w-14 h-14 flex flex-col items-center justify-center rounded-[1.25rem] shadow-sm transition-all
                        ${isToday(date) 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                          : 'bg-white border border-slate-100 text-slate-800'}
                      `}>
                        <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{format(date, 'EEE')}</span>
                        <span className="text-xl font-black leading-none">{format(date, 'd')}</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                          {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'MMMM yyyy')}
                        </h3>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-0.5">{format(date, 'EEEE, d MMMM')}</p>
                      </div>
                      <div className="flex-1 h-px bg-slate-100/50 ml-4" />
                    </div>

                    <div className="grid gap-4 pl-0 md:pl-20">
                      {items.map((item, iIdx) => (
                        <motion.div 
                          key={item._id}
                          whileHover={{ x: 10 }}
                          onClick={() => onEventClick(item)}
                          className="group relative flex items-center justify-between p-6 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white hover:border-amber-200/50 hover:bg-white hover:shadow-xl hover:shadow-amber-900/[0.02] cursor-pointer transition-all duration-500"
                        >
                          <div className="flex items-center gap-6">
                            <div 
                              className="w-1.5 h-10 rounded-full shadow-inner"
                              style={{ backgroundColor: item.colorTag || '#fbbf24' }}
                            />
                            <div>
                              <h4 className="text-base font-black text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">
                                {item.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  <Clock size={12} strokeWidth={3} className="text-slate-300" /> 
                                  {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
                                </span>
                                <span className={`
                                  px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest
                                  ${item.priority === 'high' ? 'bg-rose-50 text-rose-500' : item.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}
                                `}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
                            <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Aesthetic Load More Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-12"
            >
              <button 
                onClick={handleLoadMore}
                className="w-full group flex flex-col items-center gap-4 p-8 rounded-[3rem] border border-dashed border-slate-200 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-500">
                  <PlusCircle size={24} strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-amber-600 transition-colors">Expand Horizon</span>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Discover Next Month</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaView;
