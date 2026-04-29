import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, addNote, setSearchQuery } from '../store/notesSlice';
import { addFolder, setCurrentFolder } from '../store/foldersSlice';
import NoteCard from '../components/notes/NoteCard';
import FolderDropdown from '../components/notes/FolderDropdown';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Sparkles,
  Filter,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotesOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notes, status: notesStatus, searchQuery } = useSelector(state => state.notes);
  const { items: allFolders, currentFolderId } = useSelector(state => state.folders);
  const [filter, setFilter] = useState('All');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Breadcrumb Logic
  const getBreadcrumb = () => {
    const path = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = allFolders.find(f => f._id === currentId);
      if (folder) {
        path.unshift({ name: folder.name, id: folder._id });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    path.unshift({ name: 'All Notes', id: null });
    return path;
  };

  const breadcrumb = getBreadcrumb();

  const handleBreadcrumbClick = (folderId) => {
    dispatch(setCurrentFolder(folderId));
    dispatch(fetchNotes({ folderId }));
  };

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotes());
    }
  }, [dispatch, user]);


  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await dispatch(addFolder({ name: newFolderName.trim() }));
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };


  const handleCreateNote = async () => {
    const result = await dispatch(addNote({
      title: 'New Note',
      content: '',
      color: 'bg-white',
      folderId: currentFolderId
    })).unwrap();
    navigate(`/notes/${result._id}`);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filter === 'All' || 
                       note.tags.some(t => t.toLowerCase() === filter.toLowerCase());
    const matchesFolder = !currentFolderId || note.folderId === currentFolderId;
    
    return matchesSearch && matchesTag && matchesFolder;
  });

  // Get unique tags from all notes - Case-insensitive and trimmed
  const dynamicTags = React.useMemo(() => {
    const tagMap = new Map();
    tagMap.set('all', 'All'); // Base case
    
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            const cleanTag = tag.trim();
            const lowerTag = cleanTag.toLowerCase();
            if (!tagMap.has(lowerTag)) {
              // Capitalize first letter for aesthetic display
              const displayTag = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1).toLowerCase();
              tagMap.set(lowerTag, displayTag);
            }
          }
        });
      }
    });
    return Array.from(tagMap.values());
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
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-sm hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-100/50"
          >
            <Plus size={20} strokeWidth={3} />
            New Note
          </button>
        </div>

        {/* Global Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-12 animate-in fade-in slide-in-from-left-4 duration-700 px-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <React.Fragment key={item.id || 'root'}>
                <button 
                  onClick={() => handleBreadcrumbClick(item.id)}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                    isLast ? 'text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full' : 'text-slate-400 hover:text-indigo-400'
                  }`}
                >
                  {item.name}
                </button>
                {!isLast && (
                  <ChevronRight size={12} className="text-slate-300" strokeWidth={3} />
                )}
              </React.Fragment>
            );
          })}
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

          <div className="flex flex-[3] items-center gap-3 w-full lg:w-auto hide-scrollbar">
            {/* NEW FOLDER DROPDOWN */}
            <FolderDropdown />

            <div className="w-px h-8 bg-slate-200/50 mx-2 hidden lg:block" />

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
