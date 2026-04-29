import React, { useState } from 'react';
import { format, isSameDay, startOfWeek, addDays, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const WeekView = ({ date, items, onEventClick, onDayClick }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
    <div className="flex flex-col bg-transparent p-4 pb-4">
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <motion.div 
          layout
          className="flex gap-4 md:gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-7 h-[280px] md:h-[420px] items-stretch py-4 px-4"
        >
          {weekDays.map((day, idx) => {
            const dayItems = items.filter(item => 
              isSameDay(new Date(item.startTime), day) && 
              !(item.type === 'reminder' && item.status === 'completed')
            );
            const today = isToday(day);
            const isHovered = hoveredIdx === idx;
            const bgColor = pastelColors[idx % pastelColors.length];
            
            return (
              <motion.div 
                key={day.toString()}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
                onClick={() => onDayClick(day)}
                layout
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                  zIndex: isHovered ? 50 : 1,
                  y: isHovered ? -4 : 0,
                  boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.05)" : "0 4px 10px rgba(0,0,0,0.02)"
                }}
                whileTap={{ scale: 1.05 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 25 
                }}
                className={`
                  w-[140px] md:w-auto relative p-3 md:p-4 rounded-[2.5rem] border border-black/[0.03] flex flex-col items-center gap-3 cursor-pointer
                  ${bgColor} transition-colors duration-300
                `}
              >
                {/* Day Header */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    {format(day, 'EEE')}
                  </span>
                  <span className={`
                    text-base md:text-xl font-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all
                    ${today 
                      ? 'bg-[#1e293b] text-white shadow-lg' 
                      : 'text-slate-800'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Aesthetic Event Info Reveal */}
                <div className="flex-1 w-full flex flex-col items-center justify-center gap-2 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div 
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full space-y-1.5"
                      >
                        {dayItems.slice(0, 3).map((item, i) => (
                          <motion.div 
                            key={item._id || i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-2 bg-white/40 backdrop-blur-sm p-1 rounded-xl border border-white/50"
                          >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.colorTag || '#9333ea' }} />
                            <span className="text-[8px] font-bold text-slate-700 truncate leading-tight">
                              {item.title}
                            </span>
                          </motion.div>
                        ))}
                        {dayItems.length > 3 && (
                          <p className="text-[7px] font-black text-slate-400 text-center uppercase tracking-widest">
                            + {dayItems.length - 3}
                          </p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="dots"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-wrap gap-1.5 justify-center py-2"
                      >
                        {dayItems.slice(0, 6).map((item, i) => (
                          <div 
                            key={item._id || i}
                            className="w-1.5 h-1.5 rounded-full shadow-inner border border-white/30"
                            style={{ backgroundColor: item.colorTag || '#9333ea' }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Indicator */}
                <div className="pt-2 border-t border-black/[0.03] w-full flex justify-center">
                  <span className="text-[8px] font-black text-slate-400/60 uppercase tracking-widest">
                    {format(day, 'MMM')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default WeekView;
