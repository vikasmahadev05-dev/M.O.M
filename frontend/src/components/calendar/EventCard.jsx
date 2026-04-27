import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckCircle2, AlertCircle, Bell, MapPin, Repeat } from 'lucide-react';
import { formatEventTime } from '../../utils/dateUtils';

const ResizeHandle = ({ position, id }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `${id}-resize-${position}`,
    data: { type: 'resize', position, parentId: id }
  });
  
  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 h-2 cursor-ns-resize z-50 hover:bg-white/30 transition-colors`}
    />
  );
};

const EventCard = ({ item, onClick, style: passedStyle, compact = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item._id,
    data: { type: 'move', ...item }
  });

  const dndStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const getIcon = () => {
    switch (item.type) {
      case 'task': return <CheckCircle2 size={compact ? 10 : 14} />;
      case 'reminder': return <Bell size={compact ? 10 : 14} />;
      default: return <Clock size={compact ? 10 : 14} />;
    }
  };

  const priorityColors = {
    high: 'border-l-rose-500',
    medium: 'border-l-amber-500',
    low: 'border-l-emerald-500'
  };

  const isCompleted = item.status === 'completed';

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      style={{ 
        ...passedStyle, 
        ...dndStyle, 
        backgroundColor: isCompleted ? '#f8fafc' : `${item.colorTag}15`, 
        borderColor: isCompleted ? '#e2e8f0' : `${item.colorTag}40`,
        opacity: isCompleted ? 0.7 : 1,
        boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
      }}
      className={`
        group relative flex flex-col overflow-hidden border-l-[4px] rounded-2xl p-2.5 cursor-pointer
        hover:shadow-xl hover:shadow-indigo-500/5 hover:z-20 transition-all duration-300 backdrop-blur-sm
        ${priorityColors[item.priority] || 'border-l-indigo-500'}
        ${compact ? 'text-[9px] leading-tight' : 'text-[11px]'}
        ${item.isInstance ? 'border-dashed' : ''}
      `}
    >
      <ResizeHandle position="top" id={item._id} />
      <ResizeHandle position="bottom" id={item._id} />
      
      <div className={`flex items-center gap-2 font-black text-slate-900 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
        <span style={{ color: isCompleted ? '#94a3b8' : item.colorTag }} className="shrink-0">{getIcon()}</span>
        <span className="truncate tracking-tight">{item.title}</span>
        
        <div className="flex items-center gap-1 ml-auto">
          {item.isGoogleEvent && (
            <div className="w-4 h-4 bg-white rounded-lg shadow-sm flex items-center justify-center p-0.5 shrink-0 border border-slate-100">
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-full h-full object-contain" />
            </div>
          )}
          {item.recurrence !== 'none' && <Repeat size={12} strokeWidth={3} className="text-slate-300" />}
        </div>
      </div>
      
      {!compact && (
        <div className="mt-2 flex flex-col gap-1 text-slate-500 font-bold">
          <div className="flex items-center gap-1.5 opacity-80 bg-white/40 w-fit px-2 py-0.5 rounded-lg border border-white/50">
            <Clock size={10} strokeWidth={3} className="text-slate-400" />
            <span className="tracking-widest uppercase text-[9px]">{formatEventTime(item.startTime)} - {formatEventTime(item.endTime)}</span>
          </div>
          {item.location && (
            <div className="flex items-center gap-1.5 text-indigo-500/70">
              <MapPin size={10} strokeWidth={3} />
              <span className="truncate tracking-tight">{item.location}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Status Indicator */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-emerald-500">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 size={10} strokeWidth={4} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
