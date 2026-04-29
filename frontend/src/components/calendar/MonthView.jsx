import React, { useState } from 'react';
import { format, isSameMonth, isSameDay, isToday, startOfMonth, startOfWeek, endOfWeek, endOfMonth, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MonthView = ({ date, items, onEventClick, onDayClick }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Goldish White Zen palette
  const pastelColors = [
    'bg-[#FFFFFF]', // Pure White
    'bg-[#FFFEF9]', // Ivory
    'bg-[#FFFDF0]', // Cream
    'bg-[#FFFBF2]', // Soft Gold
    'bg-[#FFF9EA]', // Champagne
    'bg-[#FEFCE8]', // Yellow-50
    'bg-[#FFFBEB]'  // Amber-50
  ];

  return (
    <div className="flex flex-col bg-transparent p-2 md:p-6 pb-20">
      {/* Month Header - Day Names */}
      <div className="grid grid-cols-7 mb-4 md:mb-6">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div 
        layout
        className="grid grid-cols-7 gap-1.5 md:gap-6 auto-rows-[60px] md:auto-rows-[120px]"
      >
        {calendarDays.map((day, idx) => {
          const dayItems = items.filter(item => 
            isSameDay(new Date(item.startTime), day) && 
            !(item.type === 'reminder' && item.status === 'completed')
          );
          const isCurrentMonth = isSameMonth(day, monthStart);
          const today = isToday(day);
          const isHovered = hoveredDate === day.toString();
          
          // Rotate through pastel colors based on day index
          const bgColor = isCurrentMonth ? pastelColors[idx % pastelColors.length] : 'bg-slate-50/10';
          
          return (
            <motion.div 
              key={day.toString()}
              onClick={() => onDayClick(day)}
              onHoverStart={() => setHoveredDate(day.toString())}
              onHoverEnd={() => setHoveredDate(null)}
              layout
              animate={{ 
                scale: isHovered ? 1.25 : (hoveredDate ? 0.9 : 1),
                zIndex: isHovered ? 50 : 1,
                opacity: !isCurrentMonth ? 0.15 : (hoveredDate && !isHovered ? 0.5 : 1),
                y: isHovered ? -8 : 0
              }}
              whileTap={{ scale: 1.25 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
              className={`
                relative p-1.5 md:p-4 rounded-2xl md:rounded-[2.5rem] border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-4 cursor-pointer
                ${bgColor} shadow-sm transition-shadow duration-300 ${isHovered ? 'shadow-2xl shadow-orange-200/40' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`
                  text-[10px] md:text-sm font-black w-6 h-6 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all
                  ${today 
                    ? 'bg-[#1e293b] text-white shadow-lg md:shadow-2xl scale-110' 
                    : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Aesthetic Dots for Events */}
              <div className="flex flex-wrap gap-1 md:gap-2 justify-center max-w-[90%]">
                {dayItems.slice(0, isHovered ? 8 : 3).map((item, i) => (
                  <motion.div 
                    key={item._id || i}
                    layout
                    className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full shadow-inner border border-white/20"
                    style={{ backgroundColor: item.colorTag || '#9333ea' }}
                  />
                ))}
                {!isHovered && dayItems.length > 3 && (
                  <div className="w-1 h-1 md:w-2.5 md:h-2.5 bg-white/50 rounded-full flex items-center justify-center">
                    <span className="text-[5px] md:text-[6px] text-slate-800 font-bold">+</span>
                  </div>
                )}
              </div>

              {/* Hover/Tap Details Indicator - Smart Info Reveal */}
              <AnimatePresence>
                {isHovered && dayItems.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: idx >= 28 ? -20 : 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: idx >= 28 ? -10 : 10, scale: 0.8 }}
                    className={`
                      absolute left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl z-[150] min-w-[140px] pointer-events-none
                      ${idx >= 28 ? '-top-2 md:-top-4 -translate-y-full' : '-bottom-2 md:-bottom-4 translate-y-full'}
                    `}
                  >
                    <div className="flex flex-col gap-1.5">
                      {dayItems.slice(0, 4).map((item, i) => (
                        <div key={item._id || i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.colorTag || '#9333ea' }} />
                          <span className="text-[9px] font-bold truncate max-w-[120px]">
                            {item.title}
                          </span>
                        </div>
                      ))}
                      {dayItems.length > 4 && (
                        <div className="pt-1 border-t border-white/10 text-[7px] font-black uppercase tracking-widest text-slate-400 text-center">
                          + {dayItems.length - 4} more actions
                        </div>
                      )}
                    </div>
                    {/* Tiny Arrow */}
                    <div className={`
                      absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 rotate-45
                      ${idx >= 28 ? '-bottom-1' : '-top-1'}
                    `} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default MonthView;
