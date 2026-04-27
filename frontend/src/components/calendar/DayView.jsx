import React, { useEffect, useRef } from 'react';
import { format, isSameDay, getHours, getMinutes, startOfDay, addMinutes } from 'date-fns';
import EventCard from './EventCard';
import { getTimeSlotPosition, getEventDurationMinutes } from '../../utils/dateUtils';
import TimeSlot from './TimeSlot';

const DayView = ({ date, items, onEventClick, onSlotClick }) => {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayItems = items.filter(item => 
    isSameDay(new Date(item.startTime), date) && 
    !(item.type === 'reminder' && item.status === 'completed')
  );

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
        className="absolute left-0 right-0 z-30 border-t-2 border-red-500 pointer-events-none"
        style={{ top: `${top}px` }}
      >
        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Day Header */}
      <div className="flex items-center justify-center py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{format(date, 'EEEE')}</div>
          <div className="text-2xl font-black text-gray-800">{format(date, 'MMMM d, yyyy')}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[1440px] relative">
          {/* Time Labels */}
          <div className="w-16 border-r border-gray-50 bg-gray-50/30 sticky left-0 z-20">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] text-[10px] font-bold text-gray-400 text-right pr-2 pt-1">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Grid Slots */}
          <div className="flex-1 relative">
            {renderCurrentTimeLine()}
            
            {hours.map(hour => (
              <div key={hour} className="h-[60px] border-b border-gray-50 group">
                <div className="h-1/2 border-b border-dashed border-gray-50">
                  <TimeSlot hour={hour} minute={0} date={date} onSlotClick={onSlotClick} />
                </div>
                <div className="h-1/2">
                  <TimeSlot hour={hour} minute={30} date={date} onSlotClick={onSlotClick} />
                </div>
              </div>
            ))}

            {/* Events Overlay */}
            <div className="absolute inset-0">
              {dayItems.map((item, idx) => {
                const top = getTimeSlotPosition(item.startTime);
                const height = getEventDurationMinutes(item.startTime, item.endTime);
                
                // Calculate overlaps for side-by-side layout
                const overlaps = dayItems.filter(other => 
                  other._id !== item._id && 
                  new Date(other.startTime) < new Date(item.endTime) &&
                  new Date(other.endTime) > new Date(item.startTime)
                );
                
                const column = overlaps.filter(o => dayItems.indexOf(o) < idx).length;
                const totalColumns = overlaps.length + 1;
                const width = 100 / totalColumns;
                const left = column * width;

                return (
                  <div 
                    key={item._id}
                    className="absolute pointer-events-auto pr-1"
                    style={{ 
                      top: `${top}px`, 
                      height: `${height}px`,
                      left: `${left}%`,
                      width: `${width}%`,
                      minHeight: '20px'
                    }}
                  >
                    <EventCard item={item} onClick={onEventClick} />
                  </div>
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
