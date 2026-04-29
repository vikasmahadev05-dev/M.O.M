import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  X,
  Palette
} from 'lucide-react';
import { 
  fetchTasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  toggleTask,
  reorderTasks,
  updateLocalOrder,
  batchDeleteTasks,
  batchUpdateTasks
} from '../store/tasksSlice';
import { fetchTaskCategories, addTaskCategory, deleteTaskCategory } from '../store/taskCategoriesSlice';
import { toast } from 'sonner';

// Dnd Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import TaskCard from '../components/todo/TaskCard';
import TaskModal from '../components/todo/TaskModal';
import BulkActionBar from '../components/todo/BulkActionBar';

const CategoryManager = ({ isOpen, onClose, categories, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#94a3b8');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-8 space-y-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Custom Categories</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Category name..."
              className="flex-1 px-6 py-4 bg-slate-100 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-slate-200 outline-none"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input 
              type="color"
              className="w-14 h-14 p-1 bg-slate-100 rounded-2xl border-none cursor-pointer"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              if (newName) {
                onAdd({ name: newName, color: newColor });
                setNewName('');
              }
            }}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Create Category
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
          {categories.map(cat => (
            <div key={cat._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
              </div>
              <button 
                onClick={() => onDelete(cat._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const TodoList = () => {
  const dispatch = useDispatch();
  const { list: tasks, loading } = useSelector(state => state.tasks);
  const { list: categories } = useSelector(state => state.taskCategories);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskCategories());
  }, [dispatch]);

  // Derived data
  const categoryStats = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});
    
    return categories.map(cat => ({
      ...cat,
      count: counts[cat.name] || 0
    }));
  }, [tasks, categories]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
      const matchesCategory = activeCategory === 'all' || 
                             (activeCategory === 'today' && task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()) ||
                             (activeCategory === 'upcoming' && task.dueDate && new Date(task.dueDate) > new Date()) ||
                             (activeCategory === 'overdue' && isOverdue) ||
                             task.category === activeCategory;
      return matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const pMap = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
        return pMap[a.priority] - pMap[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return (a.order || 0) - (b.order || 0);
    });
  }, [tasks, activeCategory, sortBy]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t._id === active.id);
      const newIndex = tasks.findIndex(t => t._id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      dispatch(updateLocalOrder(newOrder));
      const updates = newOrder.map((task, index) => ({ id: task._id, order: index }));
      dispatch(reorderTasks(updates));
      toast.success('Sequence updated');
    }
  };

  const handleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      dispatch(updateTask({ id: editingTask._id, taskData }));
      toast.success('Objective refined');
    } else {
      dispatch(addTask(taskData));
      toast.success('New Objective created');
    }
    setEditingTask(null);
  };

  const handleToggle = (id) => dispatch(toggleTask(id));
  const handleDelete = (id) => {
    if (window.confirm('Clear this objective?')) {
      dispatch(deleteTask(id));
      toast.error('Objective cleared');
    }
  };
  const handleUpdate = (id, data) => dispatch(updateTask({ id, taskData: data }));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-32 animate-in fade-in duration-1000 space-y-8 md:space-y-12">
      {/* Refined Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-100/50 rounded-3xl text-orange-600 border border-white">
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Objectives</h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] mt-3 px-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Minimalist Workflow
            </p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-4 px-10 py-6 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all group w-full md:w-auto"
        >
          <div className="p-1.5 bg-white/20 rounded-xl group-hover:rotate-90 transition-all duration-500">
            <Plus size={24} strokeWidth={3} />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">New Objective</span>
        </button>
      </div>

      {/* High-Fidelity Horizontal Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/40 backdrop-blur-3xl p-3 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 w-full md:w-auto pb-1 md:pb-0">
          <div className="flex p-1.5 bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm shrink-0">
            {['all', 'today', 'upcoming', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setActiveCategory(f)}
                className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === f 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-400/40' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="h-10 w-px bg-slate-200/50 mx-2 shrink-0" />

          <div className="flex gap-2 items-center">
            {categoryStats.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white shadow-sm ${
                  activeCategory === cat.name 
                    ? 'bg-white text-slate-900 ring-4 ring-slate-100' 
                    : 'bg-white/30 text-slate-400 hover:bg-white hover:text-slate-600'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                {cat.name}
                <span className="opacity-30 ml-1 font-bold">{cat.count}</span>
              </button>
            ))}
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-4 bg-slate-100/50 border border-white rounded-full text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              title="Manage Categories"
            >
              <Palette size={16} />
            </button>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block" />
        <div className="relative w-full md:w-auto">
          <ArrowUpDown className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={3} />
          <select 
            className="w-full md:w-44 pl-12 pr-8 py-5 bg-white border-none rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none appearance-none cursor-pointer hover:bg-white transition-all shadow-sm"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="order">Custom Flow</option>
            <option value="newest">Recent</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Deadlines</option>
          </select>
        </div>
      </div>

      {/* Main Content Feed */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <LayoutGrid size={18} className="text-slate-300" />
                <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Active Journey</h3>
              </div>
              <div className="h-px flex-1 bg-slate-100 mx-8" />
              <span className="text-[10px] font-black text-orange-500 bg-orange-50/50 border border-orange-100 px-5 py-2.5 rounded-full uppercase tracking-widest">
                {filteredTasks.length} Visible
              </span>
            </div>

            <div className="grid gap-6">
              <SortableContext items={filteredTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 w-full bg-white/40 rounded-[3rem] animate-pulse border border-white" />
                    ))
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <TaskCard 
                        key={task._id}
                        task={task}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                        onEdit={() => { setEditingTask(task); setIsModalOpen(true); }}
                        isSelected={selectedIds.includes(task._id)}
                        onSelect={handleSelect}
                      />
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-40 flex flex-col items-center justify-center space-y-10 bg-white/30 backdrop-blur-sm rounded-[5rem] border-2 border-dashed border-white/50 shadow-inner"
                    >
                      <div className="p-10 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50">
                        <Sparkles size={64} className="text-orange-200 animate-pulse" />
                      </div>
                      <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-2xl">Total Sanctuary</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SortableContext>
            </div>
          </section>
        </div>
      </DndContext>

      <CategoryManager 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAdd={(data) => dispatch(addTaskCategory(data))}
        onDelete={(id) => {
          if (window.confirm('Delete category? Tasks will remain in your list.')) {
            dispatch(deleteTaskCategory(id));
          }
        }}
      />

      <BulkActionBar 
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={() => {
          if (window.confirm(`Clear ${selectedIds.length} objectives?`)) {
            dispatch(batchDeleteTasks(selectedIds));
            setSelectedIds([]);
          }
        }}
        onStatusToggle={(status) => {
          dispatch(batchUpdateTasks({ ids: selectedIds, updates: { status } }));
          setSelectedIds([]);
        }}
      />

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
};

export default TodoList;
