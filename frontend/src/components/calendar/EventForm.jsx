import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Calendar, Clock, Tag, Flag, Repeat, Trash2, 
  MapPin, Paperclip, AlertTriangle, Copy, ArrowRightLeft,
  ChevronDown, Check
} from 'lucide-react';
import { format, addHours, addMinutes, parseISO } from 'date-fns';
import { suggestTags, detectConflicts, calculateDuration } from '../../utils/calendarUtils';
import { useSelector } from 'react-redux';
import ReminderSelector from './ReminderSelector';

const EventForm = ({ isOpen, onClose, onSave, onDelete, onDuplicate, initialData }) => {
  const { items: allItems } = useSelector(state => state.calendar);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    allDay: false,
    priority: 'medium',
    colorTag: '#6366f1',
    category: 'none',
    location: '',
    tags: [],
    recurrence: 'none',
    status: 'pending',
    reminders: []
  });

  const [conflicts, setConflicts] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData, // Keep defaults for missing fields
        ...initialData,
        type: initialData.type || 'event', // Google events are 'event' by default
        startTime: initialData.startTime ? format(new Date(initialData.startTime), "yyyy-MM-dd'T'HH:mm") : formData.startTime,
        endTime: initialData.endTime ? format(new Date(initialData.endTime), "yyyy-MM-dd'T'HH:mm") : formData.endTime,
        tags: initialData.tags || [],
        reminders: initialData.reminders || [],
        recurrence: initialData.recurrence || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        recurrenceDays: initialData.recurrenceDays || [],
      });
    } else {
      // Reset for new item
      setFormData({
        ...formData,
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [initialData]);

  // Conflict Detection & Tag Suggestions
  useEffect(() => {
    if (formData.title && !initialData) {
      const suggested = suggestTags(formData.title);
      if (suggested.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: Array.from(new Set([...prev.tags, ...suggested]))
        }));
      }
    }
    
    const overlapping = detectConflicts(
      { ...formData, startTime: new Date(formData.startTime).toISOString(), endTime: new Date(formData.endTime).toISOString() },
      allItems
    );
    setConflicts(overlapping);
  }, [formData.startTime, formData.endTime, formData.title, allItems]);

  const handleStartTimeChange = (newStart) => {
    const start = new Date(newStart);
    const end = addMinutes(start, formData.duration || 60);
    setFormData(prev => ({
      ...prev,
      startTime: newStart,
      endTime: format(end, "yyyy-MM-dd'T'HH:mm")
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleConvert = (newType) => {
    setFormData({ ...formData, type: newType });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const dataToSave = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      duration: calculateDuration(formData.startTime, formData.endTime)
    };

    if (formData.recurrence !== 'none' && initialData) {
      // Default to 'all' for now as per plan, or we could add a selector
      onSave({ ...dataToSave, scope: 'all' });
    } else {
      onSave(dataToSave);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.ctrlKey && e.key === 'Enter') handleSubmit(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${formData.type === 'task' ? 'bg-indigo-50 text-indigo-600' : formData.type === 'event' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {initialData?._id ? 'Edit' : 'Create'} {(formData.type || 'item').charAt(0).toUpperCase() + (formData.type || 'item').slice(1)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {initialData?._id ? `Last updated: ${format(new Date(initialData.updatedAt || Date.now()), 'MMM d, HH:mm')}` : 'New productivity item'}
                </p>
                {formData.calendarName && (
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                    formData.calendarName.toLowerCase().includes('holiday') ? 'bg-rose-100 text-rose-600' : 
                    formData.calendarName.toLowerCase().includes('birthday') ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {formData.calendarName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDuplicate(formData._id)} 
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
              title="Duplicate"
            >
              <Copy size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* Main Info */}
          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              required
              className="w-full text-3xl font-black text-slate-800 placeholder-slate-200 border-none focus:ring-0 p-0 outline-none"
              placeholder="What's on your mind?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <div className="flex flex-wrap gap-2">
              {['task', 'event', 'reminder'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleConvert(t)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.type === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={14} /> Schedule
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={formData.startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Conflict Warning */}
                {conflicts.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-rose-600 uppercase">Scheduling Conflict</p>
                      <p className="text-[10px] text-rose-500 font-bold">Overlaps with: {conflicts[0].title}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority & Recurrence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recurrence</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Custom Recurrence UI */}
              {formData.recurrence !== 'none' && (
                <div className="p-4 bg-slate-50 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Every</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      value={formData.recurrenceInterval || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 1 : parseInt(e.target.value);
                        setFormData({ ...formData, recurrenceInterval: val });
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-500 lowercase">{formData.recurrence}(s)</span>
                  </div>
                  
                  {formData.recurrence === 'weekly' && (
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = formData.recurrenceDays || [];
                            const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                            setFormData({ ...formData, recurrenceDays: newDays });
                          }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                            (formData.recurrenceDays || []).includes(day) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reminders */}
              <ReminderSelector 
                reminders={formData.reminders || []} 
                onChange={(reminders) => setFormData({ ...formData, reminders })}
              />

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin size={14} /> Location
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none placeholder-slate-300"
                  placeholder="Where is this happening?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                <textarea
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none min-h-[160px] resize-none placeholder-slate-300"
                  placeholder="Add context or details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Tag size={14} /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase">
                      {tag}
                      <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none placeholder-slate-300"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {initialData?._id && (
              <button
                type="button"
                onClick={() => onDelete(initialData._id)}
                className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            {formData.type === 'task' && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: formData.status === 'completed' ? 'pending' : 'completed' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                  formData.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                }`}
              >
                <Check size={16} />
                {formData.status === 'completed' ? 'Done' : 'Mark Done'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
            >
              Save Changes
              <ArrowRightLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
