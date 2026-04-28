import { useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { triggerHaptic } from '../utils/haptic';
import { triggerReminder, snoozeReminder, dismissReminder } from '../services/reminderService';
import { deleteCalendarItem } from '../store/calendarSlice';
import { useDispatch, useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

import { playSound, stopSound } from '../utils/sound';

const useReminderChecker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifiedReminders = useRef(new Set());

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const showNotification = (reminder) => {
      // Deduplication Logic: Prevent multiple toasts for the same reminder ID
      if (notifiedReminders.current.has(reminder._id)) {
        console.log('Duplicate notification blocked for:', reminder._id);
        return;
      }

      notifiedReminders.current.add(reminder._id);
      
      // Cleanup: Remove from set after 1 minute to keep memory clean 
      // (though reminder IDs are usually unique anyway)
      setTimeout(() => notifiedReminders.current.delete(reminder._id), 60000);

      playSound('alarm');
      triggerHaptic('alert'); // [200, 100, 200] pattern

      toast.custom((t) => (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 w-80 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Reminder</p>
            <h3 className="text-lg font-black text-slate-800 leading-tight">
              {reminder.eventId?.title || "Upcoming Event"}
            </h3>
            <p className="text-xs font-bold text-slate-400">
              Starts in {reminder.offsetValue} {reminder.offsetUnit}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                stopSound('alarm');
                await snoozeReminder(reminder._id, 5, user?.token);
                toast.dismiss(t);
              }}
              className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Snooze 5m
            </button>
            <button
              onClick={async () => {
                stopSound('alarm');
                await dismissReminder(reminder._id, user?.token);
                // Remove from upcoming/calendar if it's a dedicated reminder type
                if (reminder.eventId?.type === 'reminder') {
                  dispatch(deleteCalendarItem({ id: reminder.eventId._id, scope: 'occurrence' }));
                }
                toast.dismiss(t);
              }}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 20000, onDismiss: () => stopSound('alarm'), onAutoClose: () => stopSound('alarm') });
    };

    // 1. Real-time Socket Listener
    socket.on('reminder:triggered', (reminder) => {
      showNotification(reminder);
    });

    // 2. Interval Polling (Fallback/Sync on Load)
    const checkReminders = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${API_URL}/reminders/pending`, config);
        const pendingReminders = res.data;
        const now = new Date();
        
        const due = pendingReminders.find(r => new Date(r.triggerTime) <= now);
        if (due) {
          await triggerReminder(due._id, user?.token);
          showNotification(due);
        }
      } catch (error) {
        console.error("Reminder Check Error:", error);
      }
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders();

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [dispatch, user]);

  return {};
};

export default useReminderChecker;
