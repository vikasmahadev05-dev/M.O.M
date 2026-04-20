import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, setCurrentNote } from '../store/notesSlice';
import { fetchFolders } from '../store/foldersSlice';
import { fetchTags } from '../store/tagsSlice';
import NotesTopBar from '../components/notes/NotesTopBar';
import NoteToolbar from '../components/notes/NoteToolbar';
import NoteEditor from '../components/notes/NoteEditor';
import { X, Tag, FileText, Folder } from 'lucide-react';

const Notes = () => {
  const dispatch = useDispatch();
  const { items: notes, status: notesStatus, currentNoteId, activeTag } = useSelector(state => state.notes);
  const { currentFolderId } = useSelector(state => state.folders);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (notesStatus === 'idle') {
      dispatch(fetchNotes());
      dispatch(fetchFolders());
      dispatch(fetchTags());
    }
  }, [notesStatus, dispatch]);

  useEffect(() => {
      if (notesStatus === 'succeeded' && !currentNoteId && notes.length > 0) {
          dispatch(setCurrentNote(notes[0]._id));
      }
  }, [notesStatus, notes.length, currentNoteId, dispatch]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[600px] w-full max-w-6xl mx-auto md:px-4 animate-in fade-in duration-500 relative">
      
      {/* 
        Main Application Container 
        Using a soft glassmorphism card for the entire notes app
      */}
      <div className="flex-1 flex flex-col relative bg-white/40 backdrop-blur-2xl md:rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full overflow-visible">
        
        {/* TOP BAR NAVIGATION (Switcher, Search, Tags) */}
        <NotesTopBar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="flex-1 flex flex-col bg-white overflow-visible relative z-10">
            {/* Note Editor Action Toolbar (Elevated z-index) */}
            <div className="relative z-30">
                <NoteToolbar />
            </div>
            
            {/* Actual Editor Area (Lower z-index) */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <NoteEditor />
            </div>
        </div>
        
        {/* OPTIONAL MOBILE SLIDE PANEL (Triggered from Top Bar) */}
        {/* Backdrop */}
        {sidebarOpen && (
           <div 
             className="absolute inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden rounded-[2rem]"
             onClick={() => setSidebarOpen(false)}
           />
        )}
        
        {/* Panel */}
        <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl border-r border-[var(--border)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden rounded-l-[2rem] flex flex-col`}>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-primary)] rounded-full">
                    <X size={20} />
                </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 flex items-center gap-2"><Tag size={16}/> Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {/* Tags will be fed dynamically from TopBar soon */}
                        <span className="text-xs text-[var(--text-muted)] italic">Tags moved to Top Bar</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 flex items-center gap-2"><FileText size={16}/> Recent Notes</h3>
                    <div className="space-y-2">
                        {notes.slice(0,5).map(note => (
                            <div key={note._id} onClick={() => { dispatch(setCurrentNote(note._id)); setSidebarOpen(false); }} className={`p-3 rounded-xl cursor-pointer text-sm truncate ${currentNoteId === note._id ? 'bg-[var(--pastel-blue)] text-[var(--accent)] font-medium' : 'hover:bg-[var(--bg-primary)] text-[var(--text-main)]'}`}>
                                {note.title || 'Untitled'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Notes;
