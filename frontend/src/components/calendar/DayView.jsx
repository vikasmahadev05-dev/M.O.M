import React, { useEffect, useRef } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import EventCard from './EventCard';
import { getTimeSlotPosition, getEventDurationMinutes } from '../../utils/dateUtils';
import TimeSlot from './TimeSlot';
import { motion } from 'framer-motion';

const DayView = ({ date, items, onEventClick, onSlotClick }) => {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayItems = items.filter(item => 
    isSameDay(new Date(item.startTime), date) && 
    !(item.type === 'reminder' && item.status === 'completed')
  );

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

  const bgColor = isToday(date) ? 'bg-[#FFFEF0]' : pastelColors[date.getDay() % pastelColors.length];

  useEffect(() => {
    // Scroll to current time or 8am
    const now = new Date();
    const targetHour = isSameDay(now, date) ? now.getHours() : 8;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = targetHour * 60 - 100;
    }
  }, [date]);

  const renderCurrentTimeLine = () => {
    if (!isSameDay(new Date(), date)) return null;
    const now = new Date();
    const top = now.getHours() * 60 + now.getMinutes();
    return (
      <div 
        className="absolute left-0 right-0 z-30 border-t-2 border-orange-500/50 pointer-events-none"
        style={{ top: `${top}px` }}
      >
        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-200" />
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[600px] ${bgColor} rounded-[3rem] border border-black/5 overflow-hidden shadow-xl shadow-slate-200/20`}>
      {/* Day Header */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
          {format(date, 'EEEE')}
        </span>
        <h2 className="text-2xl font-black text-slate-800">
          {format(date, 'MMMM d, yyyy')}
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[1440px] relative">
          {/* Time Labels */}
          <div className="w-20 border-r border-black/5 bg-white/20 sticky left-0 z-20 backdrop-blur-sm">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] text-[10px] font-black text-slate-400 text-right pr-4 pt-1 uppercase tracking-tighter">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Grid Slots */}
          <div className="flex-1 relative bg-white/10">
            {renderCurrentTimeLine()}
            
            {hours.map(hour => (
              <div key={hour} className="h-[60px] border-b border-black/[0.03] group">
                <div className="h-1/2 border-b border-dashed border-black/[0.02]">
                  <TimeSlot hour={hour} minute={0} date={date} onSlotClick={onSlotClick} />
                </div>
                <div className="h-1/2">
                  <TimeSlot hour={hour} minute={30} date={date} onSlotClick={onSlotClick} />
                </div>
              </div>
            ))}

            {/* Events Overlay */}
            <div className="absolute inset-0 p-1">
              {dayItems.map((item, idx) => {
                const top = getTimeSlotPosition(item.startTime);
                const height = Math.max(getEventDurationMinutes(item.startTime, item.endTime), 30);
                
                const overlaps = dayItems.filter(other => 
                  other._id !== item._id && 
                  new Date(other.startTime) < new Date(item.endTime) &&
                  new Date(other.endTime) > new Date(item.startTime)
                );
                
                const column = overlaps.filter(o => dayItems.indexOf(o) < idx).length;
                const totalColumns = overlaps.length + 1;
                const width = 98 / totalColumns;
                const left = column * width;

                return (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute pointer-events-auto pr-2"
                    style={{ 
                      top: `${top}px`, 
                      height: `${height}px`,
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                  >
                    <EventCard item={item} onClick={onEventClick} compact={height < 60} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
