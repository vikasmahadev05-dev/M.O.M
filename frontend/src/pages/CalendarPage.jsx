import React from 'react';
import { Plus, Bell } from 'lucide-react';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarControls from '../components/calendar/CalendarControls';
import CalendarGrid from '../components/calendar/CalendarGrid';
import SchedulePanel from '../components/calendar/SchedulePanel';

const CalendarPage = () => {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <CalendarHeader />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-10">
        {/* Left Column: Calendar (3/4 on desktop) */}
        <div className="xl:col-span-3 space-y-6">
          <CalendarControls />
          <CalendarGrid />
        </div>

        {/* Right Column: Schedule (1/4 on desktop) */}
        <div className="xl:col-span-1">
          <SchedulePanel />
        </div>
      </div>

      {/* Bottom Floating Actions (as seen in image) */}
      <div className="sticky bottom-4 md:static md:mt-auto flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-4 duration-700">
        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 transition-all font-bold text-sm">
          <Plus size={20} />
          <span>Add Task</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--pastel-purple)] text-purple-600 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-all font-bold text-sm">
          <Bell size={20} />
          <span>Set Reminder</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarPage;
