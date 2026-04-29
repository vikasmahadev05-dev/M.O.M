import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Flag, 
  Calendar, 
  Tag as TagIcon, 
  Plus, 
  Repeat, 
  Type, 
  AlignLeft,
  ChevronDown,
  Trash2,
  Paperclip
} from 'lucide-react';
import { useSelector } from 'react-redux';

const TaskModal = ({ isOpen, onClose, onSave, initialTask = null }) => {
  const { list: categories } = useSelector(state => state.taskCategories);
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Personal',
    tags: [],
    subtasks: [],
    dueDate: '',
    recurrence: 'none',
    color: '#ffffff'
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTaskData({
        ...initialTask,
        dueDate: initialTask.dueDate ? initialTask.dueDate.split('T')[0] : ''
      });
    } else {
      setTaskData({
        title: '',
        description: '',
        priority: 'Medium',
        category: categories.length > 0 ? categories[0].name : 'Personal',
        tags: [],
        subtasks: [],
        dueDate: '',
        recurrence: 'none',
        color: '#ffffff'
      });
    }
  }, [initialTask, isOpen, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    onSave(taskData);
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setTaskData({
      ...taskData,
      subtasks: [...taskData.subtasks, { title: newSubtask, isCompleted: false }]
    });
    setNewSubtask('');
  };

  const addTag = () => {
    if (!newTag.trim() || taskData.tags.includes(newTag.trim())) return;
    setTaskData({
      ...taskData,
      tags: [...taskData.tags, newTag.trim()]
    });
    setNewTag('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-slate-900/20 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-8 pb-0 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {initialTask ? 'Refine Task' : 'New Objective'}
            </h2>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 no-scrollbar">
            {/* Title Section */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-400 rounded-full opacity-0 group-focus-within:opacity-100 transition-all" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="What needs to be done?"
                  className="w-full pl-4 text-3xl font-black text-slate-900 placeholder-slate-200 bg-transparent focus:outline-none tracking-tighter"
                  value={taskData.title}
                  onChange={e => setTaskData({...taskData, title: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Add some context or notes..."
                className="w-full text-sm text-slate-500 bg-transparent focus:outline-none resize-none no-scrollbar h-20 leading-relaxed"
                value={taskData.description}
                onChange={e => setTaskData({...taskData, description: e.target.value})}
              />
            </div>

            {/* Core Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority & Category */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Priority Level</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTaskData({...taskData, priority: p})}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          taskData.priority === p 
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-400/20' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-orange-400/20 outline-none appearance-none cursor-pointer"
                    value={taskData.category}
                    onChange={e => setTaskData({...taskData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && <option value="Personal">Personal</option>}
                  </select>
                </div>
              </div>

              {/* Date & Recurrence */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="date"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-orange-400/20 outline-none"
                      value={taskData.dueDate}
                      onChange={e => setTaskData({...taskData, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Repeat</label>
                  <div className="relative">
                    <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-orange-400/20 outline-none appearance-none"
                      value={taskData.recurrence}
                      onChange={e => setTaskData({...taskData, recurrence: e.target.value})}
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Checklist</label>
              <div className="space-y-3">
                {taskData.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl group">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="flex-1 text-sm font-bold text-slate-600">{sub.title}</span>
                    <button 
                      type="button"
                      onClick={() => setTaskData({
                        ...taskData,
                        subtasks: taskData.subtasks.filter((_, idx) => idx !== i)
                      })}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Add a step..."
                    className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder-slate-200 focus:ring-2 focus:ring-orange-400/20 outline-none"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                  />
                  <button 
                    type="button"
                    onClick={addSubtask}
                    className="p-3 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-slate-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tags & Color Section */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {taskData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {tag}
                      <button type="button" onClick={() => setTaskData({...taskData, tags: taskData.tags.filter(t => t !== tag)})}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text"
                  placeholder="Press Enter to add tag"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder-slate-200 focus:ring-2 focus:ring-orange-400/20 outline-none"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Theme</label>
                <div className="flex gap-3 p-2 bg-slate-50 rounded-2xl">
                  {['#ffffff', '#fefce8', '#ffedd5', '#ecfdf5', '#f0f9ff', '#f5f3ff'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTaskData({...taskData, color: c})}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${taskData.color === c ? 'border-slate-900 scale-110 shadow-lg' : 'border-white hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Modal Footer */}
          <div className="p-8 pt-4 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Shift + Enter to fast-save
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-4 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-slate-400/40 transition-all"
              >
                {initialTask ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;
