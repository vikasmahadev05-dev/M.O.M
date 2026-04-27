import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const TimeSlot = ({ hour, minute, date, onSlotClick }) => {
  const slotId = `slot-${format(date, 'yyyy-MM-dd')}-${hour}-${minute}`;
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { date, hour, minute }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`h-full transition-colors ${isOver ? 'bg-indigo-100/50' : 'hover:bg-indigo-50/30'}`}
      onClick={() => {
        const d = new Date(date);
        d.setHours(hour, minute);
        onSlotClick(d);
      }}
    />
  );
};

// Helper for format (internal to avoid extra imports if possible, or use date-fns)
const format = (date, pattern) => {
  if (pattern === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  return date.toString();
};

export default TimeSlot;
