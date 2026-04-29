import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, setCurrentNote, setSearchQuery, setActiveTag } from '../../store/notesSlice';
import { fetchFolders, addFolder, setCurrentFolder } from '../../store/foldersSlice';
import { fetchTags, addTag } from '../../store/tagsSlice';
import { Search, Menu, ChevronDown, Plus, Folder, Tag, FileText, FolderOpen, Pin } from 'lucide-react';

const NotesTopBar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();

  const { items: notes, currentNoteId, searchQuery, activeTag } = useSelector(state => state.notes);
  const { items: folders, currentFolderId } = useSelector(state => state.folders);
  const { items: tags } = useSelector(state => state.tags);

  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false);
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const [isAddFolderMode, setIsAddFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isAddTagMode, setIsAddTagMode] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const noteDropdownRef = useRef(null);
  const folderDropdownRef = useRef(null);
  const addTagRef = useRef(null);

  const currentNote = notes.find(n => n._id === currentNoteId);
  const currentFolder = folders.find(f => f._id === currentFolderId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteDropdownRef.current && !noteDropdownRef.current.contains(event.target)) setIsNoteDropdownOpen(false);
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target)) setIsFolderDropdownOpen(false);
      if (addTagRef.current && !addTagRef.current.contains(event.target)) setIsAddTagMode(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
    dispatch(fetchNotes({ search: e.target.value, tag: activeTag, folderId: currentFolderId }));
  };

  const handleTagClick = (tagName) => {
    const newTag = activeTag === tagName ? '' : tagName;
    dispatch(setActiveTag(newTag));
    dispatch(fetchNotes({ search: searchQuery, tag: newTag, folderId: currentFolderId }));
  };

  const handleSelectNote = (id) => {
    dispatch(setCurrentNote(id));
    setIsNoteDropdownOpen(false);
  };

  const handleSelectFolder = (id) => {
    dispatch(setCurrentFolder(id));
    dispatch(fetchNotes({ search: searchQuery, tag: activeTag, folderId: id }));
    setIsFolderDropdownOpen(false);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      dispatch(addFolder({ name: newFolderName.trim() }));
      setNewFolderName('');
      setIsAddFolderMode(false);
    }
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (newTagName.trim()) {
      dispatch(addTag(newTagName.trim()));
      setNewTagName('');
      setIsAddTagMode(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-white/80 backdrop-blur-xl border-b border-[var(--border)] px-4 py-4 relative z-50 shadow-sm rounded-t-3xl">
      {/* TOP ROW: Search, Folders, Notes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onToggleSidebar} className="p-2.5 lg:hidden bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={20} />
          </button>
          
          <div className="flex-1 md:flex-none flex items-center gap-2">
            {/* FOLDER DROPDOWN */}
            <div className="relative flex-1 md:flex-none" ref={folderDropdownRef}>
              <button 
                onClick={() => { setIsFolderDropdownOpen(!isFolderDropdownOpen); setIsNoteDropdownOpen(false); }} 
                className="w-full flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 bg-slate-50 md:bg-transparent rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-[var(--accent)]" />
                  <span className="font-bold text-[11px] uppercase tracking-widest text-slate-700">{currentFolder ? currentFolder.name : 'All Notes'}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isFolderDropdownOpen && (
                <div className="fixed inset-x-0 bottom-0 z-[200] bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 md:absolute md:inset-auto md:top-full md:left-0 md:w-72 md:shadow-xl md:rounded-2xl md:mt-2 md:p-3 md:animate-in md:fade-in md:slide-in-from-top-2">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden" />
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-4 px-2">Select Folder</p>
                  <div className="max-h-64 overflow-y-auto hide-scrollbar">
                    <button onClick={() => handleSelectFolder(null)} className="w-full text-left px-4 py-3.5 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-all mb-1">
                      All Notes
                    </button>
                    {folders.map(folder => (
                      <button key={folder._id} onClick={() => handleSelectFolder(folder._id)} className="w-full text-left px-4 py-3.5 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-all mb-1">
                        {folder.name}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleCreateFolder} className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    <input 
                      value={newFolderName} 
                      onChange={(e) => setNewFolderName(e.target.value)} 
                      placeholder="New folder..."
                      className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100" 
                    />
                    <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                      <Plus size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* NOTE DROPDOWN */}
            <div className="relative flex-1 md:flex-none" ref={noteDropdownRef}>
              <button 
                onClick={() => { setIsNoteDropdownOpen(!isNoteDropdownOpen); setIsFolderDropdownOpen(false); }} 
                className="w-full flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 bg-slate-50 md:bg-transparent rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  <span className="font-bold text-[11px] uppercase tracking-widest text-slate-700 truncate max-w-[80px] md:max-w-none">{currentNote ? currentNote.title : "Select Note"}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isNoteDropdownOpen && (
                <div className="fixed inset-x-0 bottom-0 z-[200] bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 md:absolute md:inset-auto md:top-full md:left-0 md:w-80 md:shadow-xl md:rounded-2xl md:mt-2 md:p-3 md:animate-in md:fade-in md:slide-in-from-top-2">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden" />
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-4 px-2">Jump to Note</p>
                  <div className="max-h-64 overflow-y-auto hide-scrollbar">
                    {notes.map(note => (
                      <button key={note._id} onClick={() => handleSelectNote(note._id)} className="w-full text-left px-4 py-3.5 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-all mb-1">
                        {note.title || 'Untitled Note'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your mind..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-medium"
          />
        </div>
      </div>

      {/* BOTTOM ROW: TAGS (Horizontal Scroll) */}
      <div className="flex items-center gap-2 pt-1">
        <div className="horizontal-scroll flex items-center gap-2 flex-1 pb-1">
          <button 
            onClick={() => handleTagClick('')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${!activeTag ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button 
              key={tag._id} 
              onClick={() => handleTagClick(tag.name)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTag === tag.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              #{tag.name}
            </button>
          ))}
        </div>

        <div className="h-6 w-[1px] bg-slate-100 mx-1 shrink-0" />

        <div ref={addTagRef} className="shrink-0">
          {!isAddTagMode ? (
            <button 
              onClick={() => setIsAddTagMode(true)}
              className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          ) : (
            <form onSubmit={handleCreateTag} className="flex gap-1 animate-in slide-in-from-right-4 duration-300">
              <input 
                autoFocus
                value={newTagName} 
                onChange={(e) => setNewTagName(e.target.value)} 
                className="w-24 bg-indigo-50 px-3 py-1.5 rounded-lg text-[10px] font-bold outline-none ring-1 ring-indigo-200"
                placeholder="New tag..."
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesTopBar;