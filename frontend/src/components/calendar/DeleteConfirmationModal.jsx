import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isRecurring }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-full">
            <Trash2 size={32} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">Delete Item?</h2>
            <p className="text-sm font-bold text-slate-400 leading-relaxed">
              Are you sure you want to delete this? This action cannot be easily undone.
            </p>
          </div>

          {isRecurring && (
            <div className="w-full p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-left">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Recurring Event</p>
                <p className="text-[10px] text-amber-500 font-bold">This is part of a series. How would you like to delete it?</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 flex flex-col gap-3">
          {isRecurring ? (
            <>
              <button
                onClick={() => onConfirm('occurrence')}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Delete this instance only
              </button>
              <button
                onClick={() => onConfirm('all')}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
              >
                Delete entire series
              </button>
            </>
          ) : (
            <button
              onClick={() => onConfirm('occurrence')}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
            >
              Confirm Delete
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
