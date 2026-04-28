import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, addNote, setSearchQuery, setActiveTag } from '../store/notesSlice';
import NoteCard from '../components/notes/NoteCard';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  LayoutGrid, 
  Filter,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotesOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notes, status: notesStatus, searchQuery, activeTag } = useSelector(state => state.notes);
  const [filter, setFilter] = useState('All');

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotes());
    }
  }, [dispatch, user]);


  const handleCreateNote = async () => {
    const result = await dispatch(addNote({
      title: 'New Note',
      content: '',
      color: 'bg-white'
    })).unwrap();
    navigate(`/notes/${result._id}`);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filter === 'All' || note.tags.includes(filter);
    return matchesSearch && matchesTag;
  });

  // Get unique tags from all notes
  const dynamicTags = React.useMemo(() => {
    const tags = new Set(['All']);
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [notes]);


  return (
    <div className="animate-in fade-in duration-500 pb-20">

      {/* Premium Header Container */}
      <header className="header-spacing pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#1F2937] tracking-tighter flex items-center gap-4">
              Notes <Sparkles className="text-amber-400 fill-amber-400" size={24} />
            </h1>
            <p className="text-[#6B7280] text-sm font-semibold">Capture your onus, connect your thoughts.</p>
          </div>
          
          <button 
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-3 text-white font-black hover:scale-105 transition-all active:scale-95 primary-btn-size new-note-btn"
          >
            <Plus size={20} strokeWidth={4} />
            <span>New Note</span>
          </button>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-[2] group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search through your mind..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-14 pr-6 border-none rounded-full focus:outline-none focus:ring-8 focus:ring-amber-100/30 transition-all placeholder:text-slate-300 font-bold search-glass search-bar-size"
            />
          </div>

          <div className="flex flex-[3] items-center gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
            {dynamicTags.map((cat) => {
              const isActive = filter === cat;
              let baseColors = 'bg-white text-slate-400 hover:bg-slate-50';
              let activeColors = '';
              
              if (cat === 'All') {
                baseColors = 'bg-[#FEF9C3] text-amber-700 hover:bg-[#FDE68A]';
                activeColors = 'bg-[#FDE68A] text-amber-900 shadow-lg shadow-amber-200/50 scale-110';
              } else if (cat === 'Project') {
                baseColors = 'bg-[#DCFCE7] text-green-700 hover:bg-[#BBF7D0]';
                activeColors = 'bg-[#BBF7D0] text-green-900 shadow-lg shadow-green-200/50 scale-110';
              } else if (cat === 'Movie') {
                baseColors = 'bg-[#DBEAFE] text-blue-700 hover:bg-[#BFDBFE]';
                activeColors = 'bg-[#BFDBFE] text-blue-900 shadow-lg shadow-blue-200/50 scale-110';
              }

              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-3 rounded-2xl text-[12px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${isActive ? activeColors : baseColors}`}
                >
                  {cat}
                </button>
              );
            })}

            <button className="p-4 bg-white/50 backdrop-blur-xl border-none rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all shrink-0">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Masonry Grid */}
      <div className="notes-grid-config">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <LayoutGrid className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-400 font-medium tracking-tight">No notes found matching your filter...</p>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={handleCreateNote}
        className="fixed bottom-24 right-6 md:hidden w-16 h-16 bg-indigo-500 text-white rounded-3xl shadow-2xl flex items-center justify-center z-[60] active:scale-90 transition-transform"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

export default NotesOverview;
