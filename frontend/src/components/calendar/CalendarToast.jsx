import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, X } from 'lucide-react';

const CalendarToast = ({ message, isOpen, onClose, onUndo }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="text-sm font-bold tracking-tight">{message}</span>
          </div>
          
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            {onUndo && (
              <button
                onClick={() => { onUndo(); onClose(); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <RotateCcw size={12} />
                Undo
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarToast;
