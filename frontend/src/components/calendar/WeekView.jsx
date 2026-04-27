import React from 'react';
import { format, isSameDay, startOfWeek, addDays, isToday } from 'date-fns';
import EventCard from './EventCard';
import { getTimeSlotPosition, getEventDurationMinutes } from '../../utils/dateUtils';
import TimeSlot from './TimeSlot';

const WeekView = ({ date, items, onEventClick, onSlotClick }) => {
  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Week Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <div className="w-16 border-r border-gray-50" />
        {weekDays.map(day => (
          <div key={day.toString()} className="flex-1 py-3 text-center border-r border-gray-50 last:border-r-0">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday(day) ? 'text-indigo-600' : 'text-gray-400'}`}>
              {format(day, 'EEE')}
            </div>
            <div className={`text-xl font-black mt-0.5 ${isToday(day) ? 'text-indigo-600' : 'text-gray-800'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[1440px] relative">
          {/* Time Labels */}
          <div className="w-16 border-r border-gray-50 bg-gray-50/30 sticky left-0 z-20">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] text-[10px] font-bold text-gray-400 text-right pr-2 pt-1">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 flex relative">
            {weekDays.map(day => {
              const dayItems = items.filter(item => 
                isSameDay(new Date(item.startTime), day) && 
                !(item.type === 'reminder' && item.status === 'completed')
              );
              
              return (
                <div key={day.toString()} className="flex-1 border-r border-gray-50 last:border-r-0 relative group">
                  {/* Grid Lines */}
                  {hours.map(hour => (
                    <div key={hour} className="h-[60px] border-b border-gray-50/50">
                      <div className="h-1/2 border-b border-dashed border-gray-50/30">
                        <TimeSlot hour={hour} minute={0} date={day} onSlotClick={onSlotClick} />
                      </div>
                      <div className="h-1/2">
                        <TimeSlot hour={hour} minute={30} date={day} onSlotClick={onSlotClick} />
                      </div>
                    </div>
                  ))}

                  {/* Current Time Line (only on today's column) */}
                  {isToday(day) && (
                    <div 
                      className="absolute left-0 right-0 z-10 border-t-2 border-red-500 pointer-events-none"
                      style={{ top: `${getTimeSlotPosition(new Date())}px` }}
                    />
                  )}

                  {/* Events */}
                  {dayItems.map((item, idx) => {
                    const top = getTimeSlotPosition(item.startTime);
                    const height = getEventDurationMinutes(item.startTime, item.endTime);
                    
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
                        className="absolute z-10 pr-0.5"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          left: `${left}%`,
                          width: `${width}%`,
                          minHeight: '20px'
                        }}
                      >
                        <EventCard item={item} onClick={onEventClick} compact={height < 40} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
