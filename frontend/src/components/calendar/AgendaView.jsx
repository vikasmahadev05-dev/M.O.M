import React, { useState } from 'react';
import { format, isToday, isTomorrow, isSameDay, isAfter, startOfDay, addDays } from 'date-fns';
import { Search, Filter, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';

const AgendaView = ({ items, onEventClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const groups = [
    { label: 'Today', filter: (d) => isToday(d) },
    { label: 'Tomorrow', filter: (d) => isTomorrow(d) },
    { label: 'Upcoming', filter: (d) => isAfter(startOfDay(d), startOfDay(addDays(new Date(), 1))) },
    { label: 'Past', filter: (d) => !isAfter(startOfDay(d), startOfDay(new Date())) && !isToday(d) }
  ];

  // Group items by date for the list
  const groupedItems = filteredItems.reduce((acc, item) => {
    const dateStr = format(new Date(item.startTime), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort();

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search agenda..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'event', 'task', 'reminder'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all
                ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda List */}
      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No items found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const date = new Date(dateStr);
            const items = groupedItems[dateStr];
            
            return (
              <div key={dateStr} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 flex flex-col items-center justify-center rounded-2xl shadow-sm
                    ${isToday(date) ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 text-gray-800'}
                  `}>
                    <span className="text-[10px] font-black uppercase opacity-70">{format(date, 'EEE')}</span>
                    <span className="text-lg font-black leading-none">{format(date, 'd')}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-800">
                      {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'MMMM yyyy')}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(date, 'EEEE, d MMMM')}</p>
                  </div>
                </div>

                <div className="grid gap-3 pl-16">
                  {items.map(item => (
                    <div 
                      key={item._id}
                      onClick={() => onEventClick(item)}
                      className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-2 h-10 rounded-full"
                          style={{ backgroundColor: item.colorTag }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <Clock size={12} /> {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
                            </span>
                            <span className={`
                              px-2 py-0.5 rounded-full text-[9px] font-black uppercase
                              ${item.priority === 'high' ? 'bg-red-50 text-red-500' : item.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}
                            `}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgendaView;
