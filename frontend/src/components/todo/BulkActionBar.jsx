import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  CheckCircle2, 
  X, 
  Flag, 
  MoveHorizontal 
} from 'lucide-react';

const BulkActionBar = ({ selectedCount, onClear, onDelete, onStatusToggle, onPriorityChange, onCategoryChange }) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4"
      >
        <div className="bg-slate-900 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl shadow-slate-900/40 border border-white/10">
          <div className="flex items-center gap-4 px-4">
            <button onClick={onClear} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={18} />
            </button>
            <span className="text-sm font-black uppercase tracking-widest">
              {selectedCount} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <button 
              onClick={() => onStatusToggle('completed')}
              className="p-3 hover:bg-white/10 rounded-xl transition-all text-emerald-400"
              title="Mark Completed"
            >
              <CheckCircle2 size={20} />
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-2" />

            <button 
              onClick={onDelete}
              className="p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-400"
              title="Delete All"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActionBar;
