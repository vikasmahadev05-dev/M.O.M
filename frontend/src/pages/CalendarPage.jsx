import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, X, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarControls from '../components/calendar/CalendarControls';
import SchedulePanel from '../components/calendar/SchedulePanel';
import DayView from '../components/calendar/DayView';
import WeekView from '../components/calendar/WeekView';
import MonthView from '../components/calendar/MonthView';
import AgendaView from '../components/calendar/AgendaView';
import EventForm from '../components/calendar/EventForm';
import DeleteConfirmationModal from '../components/calendar/DeleteConfirmationModal';
import CalendarToast from '../components/calendar/CalendarToast';
import { 
  fetchCalendarItems, 
  createCalendarItem, 
  updateCalendarItem, 
  deleteCalendarItem,
  duplicateCalendarItem,
  setSelectedDate,
  setView,
  setFilters,
  clearFilters,
  checkGoogleStatus,
  disconnectGoogle,
  setGoogleConnected,
  fetchGoogleEvents
} from '../store/calendarSlice';
import { generateRecurrenceInstances } from '../utils/calendarUtils';
import { useSearchParams } from 'react-router-dom';

const FilterBar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.calendar);
  
  const categories = ['work', 'personal', 'custom'];
  const types = ['task', 'event', 'reminder'];
  const priorities = ['low', 'medium', 'high'];

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-2 rounded-2xl border border-gray-50 shadow-sm">
      <div className="relative group">
        <select 
          className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer outline-none hover:bg-slate-100 transition-all"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
      </div>

      <div className="relative group">
        <select 
          className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer outline-none hover:bg-slate-100 transition-all"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="all">All Priorities</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
      </div>

      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
        <input 
          type="text"
          placeholder="Search items..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-600 outline-none placeholder-slate-300"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {(filters.type !== 'all' || filters.priority !== 'all' || filters.search) && (
        <button 
          onClick={() => dispatch(clearFilters())}
          className="px-4 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest"
        >
          Clear
        </button>
      )}
    </div>
  );
};

import CalendarDnDContext from '../components/calendar/CalendarDnDContext';

const CalendarPage = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    googleEvents, 
    googleConnected, 
    googleSyncEnabled, 
    view, 
    selectedDate, 
    status, 
    filters 
  } = useSelector((state) => state.calendar);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  useEffect(() => {
    dispatch(checkGoogleStatus());
    
    if (searchParams.get('google') === 'connected') {
      searchParams.delete('google');
      setSearchParams(searchParams);
    }
    
    dispatch(fetchCalendarItems(filters));
    
    const refreshGoogle = () => {
      if (googleConnected && googleSyncEnabled) {
        dispatch(fetchGoogleEvents());
      }
    };

    refreshGoogle();

    // Continuous background sync (every 30 seconds)
    const syncInterval = setInterval(refreshGoogle, 30000);

    // Real-time feel: Refresh when user comes back to the tab
    window.addEventListener('focus', refreshGoogle);
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', refreshGoogle);
    };
  }, [dispatch, filters, googleConnected, googleSyncEnabled, searchParams]);

  // Expand recurring items for display and deduplicate
  const displayItems = useMemo(() => {
    const viewStart = new Date(selectedDate);
    viewStart.setDate(1);
    const viewEnd = new Date(viewStart);
    viewEnd.setMonth(viewEnd.getMonth() + 1);
    
    const localInstances = generateRecurrenceInstances(items, viewStart, viewEnd);
    
    // Deduplicate: Don't show a Google event if it's already in our local DB
    const localGoogleEventIds = new Set(
      localInstances
        .filter(item => item.googleEventId)
        .map(item => item.googleEventId)
    );

    const uniqueGoogleEvents = googleEvents.filter(
      ge => !localGoogleEventIds.has(ge._id) // _id in googleEvents is the Google event ID
    );
    
    return [...localInstances, ...uniqueGoogleEvents];
  }, [items, googleEvents, selectedDate]);

  const handleEventClick = (item) => {
    // If it's a recurring instance, we might want to edit the parent
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSlotClick = (date) => {
    setSelectedItem({
      startTime: date instanceof Date ? date.toISOString() : new Date(date).toISOString(),
      endTime: new Date(new Date(date).getTime() + 3600000).toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = (formData) => {
    if (formData._id && !formData.isInstance) {
      dispatch(updateCalendarItem({ id: formData._id, ...formData }))
        .then(() => {
          dispatch(fetchCalendarItems(filters));
          if (googleConnected) dispatch(fetchGoogleEvents());
        });
    } else {
      // If it was a recurring instance, we could handle "this vs all" here
      // For now, always create new if no ID or just update original
      const action = formData._id ? 
        updateCalendarItem({ id: formData._id.split('_')[0], ...formData }) : 
        createCalendarItem(formData);
        
      dispatch(action).then(() => {
        dispatch(fetchCalendarItems(filters));
        if (googleConnected) dispatch(fetchGoogleEvents());
      });
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    if (!id) return;
    
    // Virtual IDs look like: parentId_timestamp
    const idStr = String(id);
    const parts = idStr.split('_');
    const parentId = parts[0];
    const instanceTimestamp = parts[1];
    
    // Find the source item in either local items or google events
    let item = items.find(i => i._id === parentId) || 
               googleEvents.find(i => i._id === parentId);

    // Fallback: If not found by ID, maybe it's a search for the virtual ID itself
    if (!item) {
      item = items.find(i => i._id === idStr) || 
             googleEvents.find(i => i._id === idStr);
    }

    if (item) {
      setItemToDelete({ ...item, instanceTimestamp });
      setIsDeleteModalOpen(true);
    } else {
      console.warn('Could not find item to delete:', id);
      // Even if not found in list, try to open modal with ID at least
      setItemToDelete({ _id: parentId, instanceTimestamp });
      setIsDeleteModalOpen(true);
    }
  };

  const [toast, setToast] = useState({ open: false, message: '' });

  const handleConfirmDelete = (scope) => {
    if (itemToDelete) {
      const date = itemToDelete.instanceTimestamp ? new Date(parseInt(itemToDelete.instanceTimestamp)).toISOString() : null;
      dispatch(deleteCalendarItem({ 
        id: itemToDelete._id, 
        scope,
        date // Pass which instance to delete
      })).then(() => {
        dispatch(fetchCalendarItems(filters));
        if (googleConnected) dispatch(fetchGoogleEvents());
      });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setIsModalOpen(false);
      setToast({ open: true, message: 'Item deleted' });
    }
  };

  const handleUndo = () => {
    dispatch(undoDelete());
  };

  const handleDuplicate = (id) => {
    const realId = typeof id === 'string' ? id.split('_')[0] : id;
    dispatch(duplicateCalendarItem(realId));
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const renderView = () => {
    const props = {
      date: new Date(selectedDate),
      items: displayItems,
      onEventClick: handleEventClick,
      onSlotClick: handleSlotClick,
      onDayClick: (date) => {
        dispatch(setSelectedDate(date.toISOString()));
        dispatch(setView('day'));
      }
    };

    return (
      <CalendarDnDContext items={displayItems}>
        {(() => {
          switch (view) {
            case 'day': return <DayView {...props} />;
            case 'week': return <WeekView {...props} />;
            case 'agenda': return <AgendaView {...props} />;
            default: return <MonthView {...props} />;
          }
        })()}
      </CalendarDnDContext>
    );
  };

  return (
    <div className="flex flex-col min-h-full pb-10">
      <CalendarHeader onAddClick={() => {
        setSelectedItem(null);
        setIsModalOpen(true);
      }} />

      <CalendarControls />
      
      <FilterBar />

      <div className="flex flex-col lg:flex-row gap-6 mb-10 h-full">
        <div className="flex-1 min-w-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
          {status === 'loading' ? (
            <div className="h-[400px] md:h-[650px] bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 flex items-center justify-center shadow-xl shadow-slate-200/50">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-500/20 rounded-full" />
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
                <div className="space-y-1 text-center px-4">
                  <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">Architecting Schedule</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Optimizing your flow...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`
              bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl shadow-slate-200/50 
              transition-all duration-500 overflow-hidden
              ${view === 'month' ? 'min-h-[400px] md:min-h-[650px]' : 'min-h-0 md:min-h-[500px]'}
            `}>
              {renderView()}
            </div>
          )}
        </div>

        {/* Schedule Panel - Responsive Drawer on Mobile, Sidebar on Desktop */}
        <div className={`
          fixed inset-0 z-[200] lg:static lg:w-[300px] lg:shrink-0 lg:z-auto transition-all duration-500
          ${view === 'agenda' ? 'hidden' : (isTimelineOpen ? 'visible' : 'invisible lg:visible')}
        `}>
          {/* Backdrop for mobile */}
          <div 
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-500 ${isTimelineOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsTimelineOpen(false)}
          />
          
          <div className={`
            absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-xl rounded-t-[3rem] p-4 bottom-sheet-up lg:static lg:bg-transparent lg:p-0 lg:rounded-none lg:animate-none
            ${isTimelineOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            transition-transform duration-500 shadow-2xl lg:shadow-none
          `}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 lg:hidden" />
            <div className="max-h-[80vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
              <SchedulePanel />
            </div>
          </div>
        </div>
      </div>

      <EventForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicate}
        initialData={selectedItem}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isRecurring={itemToDelete?.recurrence !== 'none'}
      />

      <CalendarToast 
        isOpen={toast.open}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
        onUndo={handleUndo}
      />

      {/* Floating Action Button Group */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-4 z-[150] lg:hidden">
        {/* Timeline Toggle (Mobile Only) */}
        <button 
          onClick={() => setIsTimelineOpen(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all animate-in slide-in-from-bottom duration-700"
        >
          <Clock size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default CalendarPage;
