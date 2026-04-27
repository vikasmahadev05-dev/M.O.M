import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, X, RotateCcw } from 'lucide-react';

const NotificationToast = ({ reminder, onSnooze, onDismiss }) => {
  if (!reminder) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[1000] w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Bell size={24} />
          </div>
          <button onClick={onDismiss} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Upcoming Event</p>
          <h3 className="text-lg font-black text-slate-800 leading-tight">
            {reminder.eventId?.title || "Reminder"}
          </h3>
          <p className="text-xs font-bold text-slate-400">
            Starts in {reminder.offsetValue} {reminder.offsetUnit}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSnooze(5)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <RotateCcw size={12} />
            Snooze 5m
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 15, ease: "linear" }}
        className="h-1 bg-indigo-200"
      />
    </motion.div>
  );
};

export default NotificationToast;
