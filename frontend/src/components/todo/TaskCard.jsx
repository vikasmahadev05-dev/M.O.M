import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Flag, 
  Paperclip, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Clock,
  Repeat,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, onUpdate, onDelete, onToggle, onEdit, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === 'completed';
  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (title !== task.title) {
      onUpdate(task._id, { title });
    }
  };

  const priorityColors = {
    Low: 'text-blue-400 bg-blue-50',
    Medium: 'text-orange-400 bg-orange-50',
    High: 'text-red-400 bg-red-50',
    Urgent: 'text-rose-600 bg-rose-50 animate-pulse'
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    if (isCompleted) return 'text-slate-400';
    if (isPast(date) && !isToday(date)) return 'text-red-500 font-black';
    if (isToday(date)) return 'text-orange-500 font-black';
    return 'text-slate-400';
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative glass-card p-0 overflow-hidden border-l-4 transition-all duration-500 ${
        isCompleted ? 'border-l-slate-200 opacity-60' : 
        task.priority === 'High' ? 'border-l-red-400' :
        task.priority === 'Medium' ? 'border-l-orange-400' : 'border-l-blue-400'
      } hover:shadow-2xl hover:shadow-slate-200/50`}
      style={{ ...style, backgroundColor: isCompleted ? 'rgba(255,255,255,0.4)' : `${task.color}10` }}
    >
      <div className="p-4 md:p-6 flex items-start gap-3 md:gap-5">
        {/* Selection & Drag Handle */}
        <div className="flex flex-col items-center gap-3 mt-1 shrink-0">
          <button 
            {...attributes}
            {...listeners}
            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 transition-colors"
          >
            <GripVertical size={16} />
          </button>
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task._id)}
            className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 transition-all cursor-pointer"
          />
        </div>

        {/* Checkbox */}
        <button 
          onClick={() => onToggle(task._id)}
          className={`mt-1 w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCompleted 
              ? 'bg-slate-900 border-slate-900 text-white' 
              : 'border-slate-200 text-transparent hover:border-orange-400'
          }`}
        >
          <CheckCircle2 size={isCompleted ? 16 : 18} strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            {isEditing ? (
              <input 
                autoFocus
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none text-base md:text-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              />
            ) : (
              <h3 
                onClick={() => setIsEditing(true)}
                className={`font-bold text-slate-800 text-base md:text-lg leading-tight cursor-text transition-all duration-500 ${isCompleted ? 'line-through text-slate-400' : ''}`}
              >
                {task.title}
              </h3>
            )}

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 hover:bg-white rounded-xl text-slate-400 transition-all ${isExpanded ? 'rotate-180 text-orange-500' : ''}`}
              >
                <ChevronDown size={18} />
              </button>
              <button 
                onClick={() => onDelete(task._id)}
                className="p-2 hover:bg-red-50 rounded-xl text-red-300 hover:text-red-500 transition-all opacity-0 md:opacity-100 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {task.dueDate && (
              <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black ${getDueDateStatus()}`}>
                <Calendar size={12} strokeWidth={3} />
                {format(new Date(task.dueDate), 'MMM d, p')}
              </div>
            )}
            
            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority] || priorityColors.Medium}`}>
              {task.priority}
            </div>

            {task.recurrence !== 'none' && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-400 uppercase tracking-widest">
                <Repeat size={12} strokeWidth={3} />
                {task.recurrence}
              </div>
            )}
          </div>

          {/* Progress Bar for Subtasks */}
          {totalSubtasks > 0 && (
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Progress</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-green-400' : 'bg-orange-400'}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 bg-slate-50/30 p-5 pt-0 overflow-hidden"
          >
            <div className="pt-5 space-y-4">
              {task.description && (
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  {task.description}
                </p>
              )}

              {/* Subtasks List */}
              {task.subtasks?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Checklist</h4>
                  {task.subtasks.map((sub, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const newSubtasks = [...task.subtasks];
                          newSubtasks[i] = { ...newSubtasks[i], isCompleted: !newSubtasks[i].isCompleted };
                          onUpdate(task._id, { subtasks: newSubtasks });
                        }}
                        className={`w-4 h-4 rounded border transition-all ${sub.isCompleted ? 'bg-orange-400 border-orange-400 text-white' : 'border-slate-200'}`}
                      >
                        {sub.isCompleted && <CheckCircle2 size={12} strokeWidth={4} />}
                      </button>
                      <span className={`text-[11px] font-bold ${sub.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* History Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Activity History</h4>
                  <button 
                    onClick={async () => {
                      if (!task.logs) {
                        try {
                          const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')}/api/tasks/${task._id}/activity`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                          });
                          const logs = await response.json();
                          onUpdate(task._id, { logs });
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="text-[9px] font-black text-orange-400 uppercase tracking-widest hover:text-orange-600"
                  >
                    Load Timeline
                  </button>
                </div>
                <div className="space-y-3">
                  {task.logs?.map((log, i) => (
                    <div key={i} className="flex gap-3 text-[11px]">
                      <div className="w-1 h-1 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-600 font-bold">
                          Task <span className="text-orange-500">{log.actionType}</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;
