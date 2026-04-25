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
    <div className="min-h-screen animate-in fade-in duration-500 pb-20 px-4 md:px-8">

      {/* Premium Header Container */}
      <header className="mb-8 md:mb-12 pt-6 md:pt-10">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Notes <Sparkles className="text-indigo-400" size={24} />
            </h1>
            <p className="text-slate-400 text-sm font-medium">Capture your onus, connect your thoughts.</p>
          </div>
          
          <button 
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 text-white rounded-[1.4rem] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>New Note</span>
          </button>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search through your mind..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm focus:outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            {dynamicTags.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === cat 
                  ? 'bg-indigo-500 text-white shadow-md' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}

            <button className="p-3 bg-white border border-slate-50 rounded-2xl text-slate-400 hover:bg-slate-50 shadow-sm ml-2">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
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
