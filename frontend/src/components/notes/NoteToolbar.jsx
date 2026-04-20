import React, { useState } from 'react';
import { Plus, Trash2, Copy, Pin, CheckCircle2, Loader2, CloudOff, ChevronDown, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addNote, deleteNote, updateNoteLocally, updateNote, setCurrentNote } from '../../store/notesSlice';
import { addTag } from '../../store/tagsSlice';

const NoteToolbar = () => {
  const dispatch = useDispatch();
  const { currentNoteId, items, saveStatus } = useSelector(state => state.notes);
  
  const currentNote = items.find(n => n._id === currentNoteId);

  const handleCreate = () => {
    dispatch(addNote({ title: '', content: '' }));
  };

  const handleDelete = () => {
    if (currentNoteId) {
      if (window.confirm("Are you sure you want to delete this note?")) {
          dispatch(deleteNote(currentNoteId));
      }
    }
  };

  const handleDuplicate = () => {
    if (currentNote) {
      dispatch(addNote({ title: `${currentNote.title} (Copy)`, content: currentNote.content, color: currentNote.color }));
    }
  };

  const handlePinToggle = () => {
    if (currentNote) {
      const updatedPin = !currentNote.isPinned;
      dispatch(updateNoteLocally({ id: currentNoteId, isPinned: updatedPin }));
      dispatch(updateNote({ id: currentNoteId, isPinned: updatedPin }));
    }
  };

  const handleTitleChange = (e) => {
    if (currentNoteId) {
        dispatch(updateNoteLocally({ id: currentNoteId, title: e.target.value }));
        // Relying on debounced save from editor, or add separate debouncing here
    }
  };
  const handleTitleBlur = (e) => {
      if(currentNoteId) {
          dispatch(updateNote({ id: currentNoteId, title: e.target.value }));
      }
  }

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [folderInput, setFolderInput] = useState('');

  // Close local dropdowns if clicking outside
  const moveRef = React.useRef(null);
  const tagRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
        if(moveRef.current && !moveRef.current.contains(e.target)) setIsMoveOpen(false);
        if(tagRef.current && !tagRef.current.contains(e.target)) setIsTagOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { items: allFolders } = useSelector(state => state.folders);
  const { items: allTags } = useSelector(state => state.tags);

  const handleToggleNoteTag = (tagName) => {
      if(!currentNote) return;
      const currentTags = currentNote.tags || [];
      let newTags;
      if (currentTags.includes(tagName)) {
          newTags = currentTags.filter(t => t !== tagName);
      } else {
          newTags = [...currentTags, tagName];
      }
      
      dispatch(updateNoteLocally({ id: currentNoteId, tags: newTags }));
      dispatch(updateNote({ id: currentNoteId, tags: newTags }));
  }

  const handleCreateAndAssignTag = (e) => {
      e.preventDefault();
      const newTagName = tagInput.trim();
      if (!newTagName || !currentNote) return;
      
      // Add tag to global store first
      dispatch(addTag(newTagName)).then((res) => {
          if(res.payload && res.payload.name) {
              const actualTagName = res.payload.name;
              
              // Now assign it to the note if not already assigned
              const currentTags = currentNote.tags || [];
              if (!currentTags.includes(actualTagName)) {
                  const newTags = [...currentTags, actualTagName];
                  dispatch(updateNoteLocally({ id: currentNoteId, tags: newTags }));
                  dispatch(updateNote({ id: currentNoteId, tags: newTags }));
              }
          }
      });
      
      setTagInput('');
  }

  const handleMoveNote = (folderId) => {
      if(!currentNote) return;
      dispatch(updateNoteLocally({ id: currentNoteId, folderId }));
      dispatch(updateNote({ id: currentNoteId, folderId }));
      setIsMoveOpen(false);
  }

  const handleCreateAndAssignFolder = (e) => {
      e.preventDefault();
      const newFolderName = folderInput.trim();
      if (!newFolderName || !currentNote) return;

      dispatch(addFolder({ name: newFolderName })).then((res) => {
         if(res.payload && res.payload._id) {
             handleMoveNote(res.payload._id);
         }
      });
      setFolderInput('');
  }

  // Filter tags based on search input
  const filteredTags = allTags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()));
  const exactMatchExists = allTags.some(t => t.name.replace('#', '').toLowerCase() === tagInput.replace('#', '').toLowerCase());

  // Filter folders based on search input
  const filteredFolders = allFolders.filter(f => f.name.toLowerCase().includes(folderInput.toLowerCase()));
  const exactFolderExists = allFolders.some(f => f.name.toLowerCase() === folderInput.toLowerCase());

  return (
    <div className="flex flex-col border-b border-[var(--border)] bg-gray-50/50 backdrop-blur-md z-10 transition-opacity duration-300">
      
      {/* Top Main Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-3">
        {/* Left side: Title Input */}
        <div className="flex-1 min-w-0 pr-4 w-full mb-3 md:mb-0">
            <input 
            type="text" 
            placeholder={currentNote ? "Note Title" : "Select a note to begin"}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-[var(--text-muted)] text-[var(--text-main)] overflow-ellipsis font-outfit"
            value={currentNote?.title || ''}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            readOnly={!currentNoteId}
            />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 shrink-0">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium mr-2 text-[var(--text-muted)] bg-white/50 border border-[var(--border)] px-3 py-1.5 rounded-full shadow-sm min-w-[75px] justify-center">
                {currentNoteId ? (
                    <>
                        {saveStatus === 'saving' && <><Loader2 size={14} className="animate-spin text-blue-500" /> Saving</>}
                        {saveStatus === 'saved' && <><CheckCircle2 size={14} className="text-emerald-500" /> Saved</>}
                        {saveStatus === 'error' && <><CloudOff size={14} className="text-red-500" /> Error</>}
                    </>
                ) : (
                    <span className="opacity-50">—</span>
                )}
            </div>

            <div className="flex bg-white/60 p-1 rounded-2xl border border-[var(--border)] shadow-sm">
                <button 
                onClick={handlePinToggle}
                className={`p-2 rounded-xl transition-all duration-200 ${currentNote?.isPinned ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-main)]'} ${!currentNoteId && 'opacity-30 cursor-not-allowed'}`}
                disabled={!currentNoteId}
                title="Pin Note"
                >
                <Pin size={18} fill={currentNote?.isPinned ? "currentColor" : "none"} />
                </button>

                <button 
                onClick={handleDuplicate}
                className="p-2 bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-main)] rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!currentNoteId}
                title="Duplicate Note"
                >
                <Copy size={18} />
                </button>

                <button 
                onClick={handleDelete}
                className="p-2 bg-transparent text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!currentNoteId}
                title="Delete Note"
                >
                <Trash2 size={18} />
                </button>
            </div>

            <button 
            onClick={handleCreate}
            className="ml-2 flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white hover:bg-indigo-600 rounded-2xl transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">New</span>
            </button>
        </div>
      </div>

      {/* Bottom Sub-Toolbar (Meta tags/folders) */}
      {currentNote && (
        <div className="px-6 py-2 bg-white/90 border-b border-[var(--border)] flex flex-wrap items-center gap-3 relative overflow-visible">
            
            {/* Move to Folder */}
            <div className="relative overflow-visible" ref={moveRef}>
                 <button onClick={() => { setIsMoveOpen(!isMoveOpen); setIsTagOpen(false); setFolderInput(''); }} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] bg-white border border-[var(--border)] px-2.5 py-1 rounded-lg shadow-sm">
                     📁 {currentNote.folderId ? allFolders.find(f => f._id === currentNote.folderId)?.name || 'Unknown' : 'No Folder'} <ChevronDown size={12}/>
                 </button>
                 {isMoveOpen && (
                     <div className="absolute top-full left-0 w-60 bg-white border border-[var(--border)] shadow-xl rounded-xl z-[9999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                         
                         {/* Search / Create Folder Input */}
                         <div className="p-2 border-b border-[var(--border)] bg-[var(--bg-primary)]/50">
                             <form onSubmit={handleCreateAndAssignFolder}>
                                 <input 
                                     autoFocus
                                     type="text"
                                     placeholder="Search or new folder..."
                                     value={folderInput}
                                     onChange={e => setFolderInput(e.target.value)}
                                     className="w-full text-xs bg-white border border-[var(--border)] rounded-md px-2 py-1.5 outline-none focus:border-[var(--accent)]"
                                 />
                             </form>
                         </div>

                         <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                             <div 
                                onClick={() => handleMoveNote(null)} 
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${!currentNote.folderId ? 'text-[var(--accent)] bg-[var(--pastel-blue)]/50 font-bold border-l-4 border-[var(--accent)]' : 'text-[var(--text-main)] hover:bg-[var(--bg-primary)] hover:pl-5'}`}
                             >
                                No Folder
                             </div>
                             
                             {/* Create New Prompt */}
                             {folderInput.trim() && !exactFolderExists && (
                                 <div onClick={handleCreateAndAssignFolder} className="px-3 py-2 text-xs cursor-pointer hover:bg-[var(--pastel-blue)] text-[var(--accent)] flex items-center gap-2 font-medium border-y border-[var(--border)]">
                                     <Plus size={12} /> Create folder "{folderInput}"
                                 </div>
                             )}

                             {filteredFolders.map(f => (
                                 <div 
                                    key={f._id} 
                                    onClick={() => handleMoveNote(f._id)} 
                                    className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-all ${currentNote.folderId === f._id ? 'text-[var(--accent)] bg-[var(--pastel-blue)]/50 font-bold border-l-4 border-[var(--accent)]' : 'text-[var(--text-main)] hover:bg-[var(--bg-primary)] hover:pl-5'}`}
                                 >
                                     <span className="truncate pr-2">{f.name}</span>
                                     {currentNote.folderId === f._id && <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0"/>}
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
            </div>

            <div className="w-px h-4 bg-[var(--border)]"></div>

            {/* Note's Current Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {(currentNote.tags || []).map(tag => (
                   <span key={tag} className="flex items-center gap-1 bg-[var(--pastel-blue)] border border-[var(--accent)]/30 text-[var(--accent)] px-2 py-0.5 rounded-md text-xs font-medium shadow-sm">
                       {tag} <X size={10} className="cursor-pointer hover:opacity-70" onClick={() => handleToggleNoteTag(tag)}/>
                   </span>
                ))}
            </div>

            {/* Add Tag to Note Dropdown */}
            <div className="relative overflow-visible" ref={tagRef}>
                <button onClick={() => { setIsTagOpen(!isTagOpen); setIsMoveOpen(false); setTagInput(''); }} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors border border-dashed border-gray-300 hover:border-[var(--accent)] px-2 py-0.5 rounded-md bg-white">
                    <Plus size={12}/> tag
                </button>
                {isTagOpen && (
                    <div className="absolute top-full left-0 w-60 bg-white border border-[var(--border)] shadow-xl rounded-xl z-[9999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                         
                         {/* Search / Create Input */}
                         <div className="p-2 border-b border-[var(--border)] bg-[var(--bg-primary)]/50">
                             <form onSubmit={handleCreateAndAssignTag}>
                                 <input 
                                     autoFocus
                                     type="text"
                                     placeholder="Search or create tag..."
                                     value={tagInput}
                                     onChange={e => setTagInput(e.target.value.replace(/[^a-zA-Z0-9#]/g, ''))}
                                     className="w-full text-xs bg-white border border-[var(--border)] rounded-md px-2 py-1.5 outline-none focus:border-[var(--accent)]"
                                 />
                             </form>
                         </div>

                         <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                             {/* Create New Prompt */}
                             {tagInput.trim() && !exactMatchExists && (
                                 <div onClick={handleCreateAndAssignTag} className="px-3 py-2 text-xs cursor-pointer hover:bg-[var(--pastel-blue)] text-[var(--accent)] flex items-center gap-2 font-medium border-b border-[var(--border)]">
                                     <Plus size={12} /> Create "{tagInput.startsWith('#') ? tagInput : `#${tagInput}`}"
                                 </div>
                             )}

                             {filteredTags.length === 0 && !tagInput.trim() && (
                                 <div className="px-3 py-3 text-xs text-gray-400 text-center">No tags exist globally.</div>
                             )}

                             {filteredTags.map(t => {
                                 const isAssigned = (currentNote.tags || []).includes(t.name);
                                 return (
                                     <div 
                                        key={t._id} 
                                        onClick={() => handleToggleNoteTag(t.name)} 
                                        className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-all ${isAssigned ? 'text-[var(--accent)] bg-[var(--pastel-blue)]/50 font-bold border-l-4 border-[var(--accent)]' : 'text-[var(--text-main)] hover:bg-[var(--bg-primary)] hover:pl-5'}`}
                                    >
                                         <span className="truncate pr-2">{t.name}</span>
                                         {isAssigned && <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0"/>}
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                )}
            </div>

        </div>
      )}

    </div>
  );
};

export default NoteToolbar;
