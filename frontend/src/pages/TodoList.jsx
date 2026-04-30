import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  X,
  Palette,
  Layers,
  ChevronDown,
  Trash2
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
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Collections</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Name..."
              className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-slate-200 outline-none"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input 
              type="color"
              className="w-14 h-14 p-1 bg-slate-50 rounded-2xl border-none cursor-pointer"
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
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Create New
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
          {categories.map(cat => (
            <div key={cat._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
              </div>
              <button 
                onClick={() => onDelete(cat._id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskCategories());
  }, [dispatch]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
      const matchesCategory = activeCategory === 'all' || 
                             (activeCategory === 'today' && task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()) ||
                             (activeCategory === 'upcoming' && task.dueDate && new Date(task.dueDate) > new Date()) ||
                             (activeCategory === 'overdue' && isOverdue) ||
                             (task.category && task.category.toLowerCase() === activeCategory.toLowerCase());
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

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask._id, taskData })).unwrap();
        toast.success('Objective refined');
      } else {
        await dispatch(addTask(taskData)).unwrap();
        toast.success('New Objective created');
      }
      setEditingTask(null);
      setIsModalOpen(false);
      dispatch(fetchTasks());
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(`Save failed: ${error || 'Unknown error'}`);
    }
  };

  const handleToggle = (id) => dispatch(toggleTask(id));
  const handleDelete = (id) => {
    if (window.confirm('Delete this objective?')) {
      dispatch(deleteTask(id));
      toast.error('Objective cleared');
    }
  };
  const handleUpdate = (id, data) => dispatch(updateTask({ id, taskData: data }));

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-40 space-y-8 md:space-y-12 animate-in fade-in duration-1000">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 md:pt-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Objectives</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => dispatch(fetchTasks())}
              className="flex-1 md:flex-none p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all group"
              title="Refresh Database"
            >
              <ArrowUpDown size={18} className="mx-auto group-hover:rotate-180 transition-transform duration-500" />
            </button>
            
            {/* Desktop Add Button */}
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="hidden md:flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-slate-200"
            >
              <Plus size={18} strokeWidth={3} />
              Add New
            </button>
          </div>
        </header>

        {/* Mobile FAB */}
        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-8 right-6 z-[900] w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white border border-slate-100 p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex bg-slate-50 p-1 rounded-full overflow-x-auto no-scrollbar shrink-0">
            {['all', 'today', 'upcoming'].map(f => (
              <button
                key={f}
                onClick={() => setActiveCategory(f)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-100 hidden md:block" />

          <div className="relative flex-1 w-full md:w-auto">
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex items-center justify-between px-6 py-3 bg-white hover:bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center gap-3">
                <Layers size={14} className="text-slate-400" />
                <span>{categories.find(c => c.name === activeCategory)?.name || 'Collections'}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setActiveCategory('all'); setIsCategoryDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500"
                    >
                      All Collections
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => { setActiveCategory(cat.name); setIsCategoryDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                        <span className="opacity-30">{tasks.filter(t => t.category === cat.name).length}</span>
                      </button>
                    ))}
                    <div className="h-px bg-slate-50 my-2" />
                    <button 
                      onClick={() => { setIsCategoryModalOpen(true); setIsCategoryDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-500"
                    >
                      <Palette size={14} />
                      Customize
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-100 hidden md:block" />

          <div className="relative shrink-0 w-full md:w-auto">
            <ArrowUpDown className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="pl-12 pr-8 py-3 bg-white border-none rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none appearance-none cursor-pointer w-full"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="order">Custom</option>
              <option value="newest">Recent</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Objectives Feed</h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">
                {filteredTasks.length} Visible
              </span>
            </div>

            <div className="grid gap-4">
              <SortableContext items={filteredTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 w-full bg-slate-50 rounded-3xl animate-pulse" />
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
                    <div className="py-20 flex flex-col items-center justify-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                      <Sparkles size={40} className="text-slate-200" />
                      <div className="text-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Horizon is clear in this view</p>
                        {activeCategory !== 'all' && (
                          <button 
                            onClick={() => setActiveCategory('all')}
                            className="mt-4 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
                          >
                            Show all objectives instead?
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </SortableContext>
            </div>
          </div>
        </DndContext>

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
      </div>

      <CategoryManager 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAdd={(data) => dispatch(addTaskCategory(data))}
        onDelete={(id) => {
          if (window.confirm('Delete collection?')) {
            dispatch(deleteTaskCategory(id));
          }
        }}
      />

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultCategory={activeCategory}
      />
    </>
  );
};

export default TodoList;
