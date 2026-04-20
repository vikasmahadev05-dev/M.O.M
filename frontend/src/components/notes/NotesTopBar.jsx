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
    <div className="flex flex-col gap-3 w-full bg-white/80 backdrop-blur-xl border-b border-[var(--border)] px-4 py-3 relative z-50 shadow-sm rounded-t-3xl">

      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-4">

        <button onClick={onToggleSidebar} className="p-2 lg:hidden hover:bg-gray-100 rounded-xl">
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">

          {/* FOLDER DROPDOWN */}
          <div className="relative" ref={folderDropdownRef}>
            <button 
              onClick={() => { setIsFolderDropdownOpen(!isFolderDropdownOpen); setIsNoteDropdownOpen(false); }} 
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FolderOpen size={16} className="text-[var(--accent)]" />
              <span className="font-medium text-sm">{currentFolder ? currentFolder.name : 'All Notes'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isFolderDropdownOpen && (
              <div className="absolute top-full left-0 w-72 bg-white shadow-xl rounded-xl z-[9999] mt-2 p-2">

                <div onClick={() => handleSelectFolder(null)} className="p-2 hover:bg-gray-100 rounded">
                  All Notes
                </div>

                {folders.map(folder => (
                  <div key={folder._id} onClick={() => handleSelectFolder(folder._id)} className="p-2 hover:bg-gray-100 rounded">
                    {folder.name}
                  </div>
                ))}

                <form onSubmit={handleCreateFolder} className="flex gap-2 mt-2">
                  <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="flex-1 border p-1 rounded" />
                  <button>Add</button>
                </form>

              </div>
            )}
          </div>

          {/* NOTE DROPDOWN */}
          <div className="relative" ref={noteDropdownRef}>
            <button 
              onClick={() => { setIsNoteDropdownOpen(!isNoteDropdownOpen); setIsFolderDropdownOpen(false); }} 
              className="px-4 py-2 border border-[var(--border)] rounded-xl bg-white hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <FileText size={16} className="text-[var(--accent)]" />
              <span className="font-semibold text-sm">{currentNote ? currentNote.title : "Select Note"}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isNoteDropdownOpen && (
              <div className="absolute top-full left-0 w-80 bg-white shadow-xl rounded-xl z-[9999] mt-2 max-h-60 overflow-y-auto">
                {notes.map(note => (
                  <div key={note._id} onClick={() => handleSelectNote(note._id)} className="p-2 hover:bg-gray-100">
                    {note.title}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border rounded-full px-4 py-2"
        />

      </div>

      {/* TAGS */}
      <div className="flex gap-2 overflow-x-auto">
        {tags.map(tag => (
          <button key={tag._id} onClick={() => handleTagClick(tag.name)} className="px-3 py-1 rounded-full border">
            {tag.name}
          </button>
        ))}

        <form onSubmit={handleCreateTag} className="flex gap-1">
          <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="border px-2" />
          <button>Add</button>
        </form>
      </div>

    </div>
  );
};

export default NotesTopBar;