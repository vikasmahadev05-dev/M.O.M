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

  const getHeaderText = () => {
    if (view === 'month') return format(date, 'MMMM yyyy');
    if (view === 'week') {
      return `Week of ${format(date, 'MMM d')}`;
    }
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] p-1 flex shadow-lg shadow-slate-200/50 w-full sm:w-auto">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button 
              key={v} 
              onClick={() => dispatch(setView(v))}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === v ? 'bg-slate-900 text-white shadow-xl shadow-slate-400/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {v}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] p-1 shadow-lg shadow-slate-200/50 w-full sm:w-auto justify-between sm:justify-start">
          <button 
            onClick={() => handleNavigate('prev')}
            className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
          <button 
            onClick={() => dispatch(setSelectedDate(new Date().toISOString()))}
            className="px-6 py-2.5 text-[10px] font-black text-slate-800 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => handleNavigate('next')}
            className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight pl-2">
          {getHeaderText()}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
        <div className="relative group flex-1 xl:flex-none">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} strokeWidth={3} />
          <input 
            type="text" 
            placeholder="Search your schedule..." 
            className="w-full xl:w-72 pl-14 pr-6 py-4 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] text-sm font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all shadow-lg shadow-slate-200/50"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {!googleConnected ? (
            <button 
              onClick={handleGoogleSync}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:scale-105 shadow-lg shadow-slate-200/50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 object-contain grayscale group-hover:grayscale-0 opacity-50" />
              Connect Google
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-indigo-50/80 backdrop-blur-md border border-white rounded-[1.5rem] p-1.5 shadow-lg shadow-indigo-100">
              <button 
                onClick={handleGoogleSync}
                title="Refresh Google Events"
                className="p-2.5 bg-white rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 object-contain" />
              </button>
              
              <div className="h-6 w-[1px] bg-indigo-200/50 mx-1" />
              
              <button 
                onClick={handleToggleSync}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  googleSyncEnabled 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                    : 'bg-white text-indigo-400 hover:bg-indigo-50'
                }`}
              >
                {googleSyncEnabled && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
                {googleSyncEnabled ? 'Live Sync' : 'Sync OFF'}
              </button>

              <button 
                onClick={() => dispatch(disconnectGoogle())}
                className="p-2.5 text-indigo-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                title="Disconnect Google"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
          )}
          
          <button className="p-4 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600 shadow-lg shadow-slate-200/50">
            <Filter size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;
