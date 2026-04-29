import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setView, setSelectedDate, setGoogleConnected, toggleGoogleSync, fetchGoogleEvents, disconnectGoogle } from '../../store/calendarSlice';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

const CalendarControls = () => {
  const dispatch = useDispatch();
  const { view, selectedDate, googleConnected, googleSyncEnabled } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);
  const date = new Date(selectedDate);

  const handleGoogleSync = async () => {
    if (googleConnected) {
      dispatch(fetchGoogleEvents());
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      };
      const res = await axios.get(`${API_URL}/google/connect-url`, config);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Failed to get Google OAuth URL:', err);
    }
  };

  const handleToggleSync = () => {
    dispatch(toggleGoogleSync(!googleSyncEnabled));
  };

  const handleNavigate = (direction) => {
    let newDate;
    if (view === 'month') {
      newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
    } else if (view === 'week') {
      newDate = direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
    } else {
      newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    }
    dispatch(setSelectedDate(newDate.toISOString()));
  };

  const getHeaderDate = () => {
    return {
      day: format(date, 'd'),
      month: format(date, 'MMMM'),
      year: format(date, 'yyyy')
    };
  };

  const { day, month, year } = getHeaderDate();

  return (
    <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
      {/* Tier 1: Hero Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="flex items-end gap-4 md:gap-6">
          {/* Large Architectural Day Number */}
          <div className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter">
            {day}
          </div>
          
          {/* Month & Year Stack */}
          <div className="flex flex-col pb-0.5 md:pb-1">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 mb-1 leading-none">
              {year}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {month}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Sync Architecture - Compact on Mobile */}
          {!googleConnected ? (
            <button 
              onClick={handleGoogleSync}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-5 md:px-6 py-3.5 md:py-4 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] md:rounded-[2rem] transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 hover:text-orange-600 hover:bg-white shadow-lg shadow-slate-200/50 group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              <span className="hidden sm:inline">Connect Google</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start gap-2 bg-orange-50/60 backdrop-blur-md border border-white rounded-[1.5rem] md:rounded-[2rem] p-1 md:p-1.5 shadow-xl shadow-orange-100/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleGoogleSync}
                  className="p-2 md:p-2.5 bg-white rounded-xl md:rounded-2xl shadow-sm hover:scale-110 transition-all"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 md:w-4 h-3.5 md:h-4 object-contain" />
                </button>
                <div className="h-5 md:h-6 w-px bg-orange-200/30 mx-0.5 md:mx-1" />
                <button 
                  onClick={handleToggleSync}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                    googleSyncEnabled 
                      ? 'bg-[#FED7AA] text-orange-900/70 shadow-sm' 
                      : 'bg-white text-orange-400'
                  }`}
                >
                  {googleSyncEnabled && (
                    <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 md:h-2 w-1.5 md:w-2 bg-white"></span>
                    </span>
                  )}
                  {googleSyncEnabled ? 'Live' : 'Offline'}
                </button>
              </div>
              <button 
                onClick={() => dispatch(disconnectGoogle())}
                className="p-2 md:p-2.5 text-orange-200 hover:text-rose-500 hover:bg-white rounded-xl md:rounded-2xl transition-all"
              >
                <X size={16} md:size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tier 2: Navigation & View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 px-2">
        <div className="flex items-center gap-2 md:gap-4 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] md:rounded-[1.75rem] p-1 md:p-1.5 shadow-xl shadow-slate-200/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button 
              key={v} 
              onClick={() => dispatch(setView(v))}
              className={`flex-1 sm:flex-none whitespace-nowrap px-4 md:px-7 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${view === v ? 'bg-slate-900 text-white shadow-2xl shadow-slate-400/40' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] md:rounded-[1.75rem] p-1 md:p-1.5 shadow-xl shadow-slate-200/50 w-full sm:w-auto justify-between">
          <button 
            onClick={() => handleNavigate('prev')}
            className="p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl text-slate-400 hover:text-orange-500 transition-all"
          >
            <ChevronLeft size={18} md:size={20} strokeWidth={3} />
          </button>
          <button 
            onClick={() => dispatch(setSelectedDate(new Date().toISOString()))}
            className="flex-1 sm:flex-none px-6 md:px-8 py-2 md:py-2.5 text-[8px] md:text-[10px] font-black text-slate-800 uppercase tracking-widest hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => handleNavigate('next')}
            className="p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl text-slate-400 hover:text-orange-500 transition-all"
          >
            <ChevronRight size={18} md:size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;
