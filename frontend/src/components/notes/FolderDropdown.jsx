import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, ChevronDown, Folder, Plus, Trash2, FolderOpen, FolderClosed, FolderPlus } from 'lucide-react';
import { setCurrentFolder, addFolder, deleteFolder, fetchFolders } from '../../store/foldersSlice';
import { fetchNotes } from '../../store/notesSlice';

const FolderItem = ({ folder, allFolders, depth = 0, onSelect }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subFolderName, setSubFolderName] = useState('');
  
  const { currentFolderId } = useSelector(state => state.folders);
  const isSelected = currentFolderId === folder._id;
  
  const subfolders = allFolders.filter(f => f.parentId === folder._id);

  const handleSelect = (e) => {
    e.stopPropagation();
    dispatch(setCurrentFolder(folder._id));
    dispatch(fetchNotes({ folderId: folder._id }));
    if (onSelect) onSelect();
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAddSub = (e) => {
    e.preventDefault();
    if (subFolderName.trim()) {
      dispatch(addFolder({ name: subFolderName.trim(), parentId: folder._id }));
      setSubFolderName('');
      setIsAddingSub(false);
      setIsOpen(true);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete folder "${folder.name}" and all its contents?`)) {
      dispatch(deleteFolder(folder._id));
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        onClick={handleSelect}
        className={`group flex items-center gap-3 py-3 px-4 rounded-2xl cursor-pointer transition-all duration-300 mx-1 mb-0.5 ${
          isSelected 
            ? 'bg-indigo-50/60 text-indigo-700 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
        style={{ paddingLeft: `${depth * 20 + 16}px` }}
      >
        <button 
          onClick={handleToggle}
          className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all ${subfolders.length === 0 ? 'opacity-0 cursor-default' : ''}`}
        >
          {isOpen ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>
        
        <div className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100/50 group-hover:bg-white'}`}>
          {isSelected ? <FolderOpen size={16} strokeWidth={2.5} className="text-indigo-500" /> : <Folder size={16} strokeWidth={2.5} className="text-slate-400 group-hover:text-indigo-400" />}
        </div>

        <span className={`flex-1 truncate text-sm tracking-tight ${isSelected ? 'font-black' : 'font-bold opacity-80'}`}>
          {folder.name}
        </span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsAddingSub(true); }}
            className="p-1.5 hover:bg-indigo-500 hover:text-white rounded-lg transition-all text-indigo-400"
            title="Add Subfolder"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all text-slate-300 hover:text-red-500"
            title="Delete Folder"
          >
            <Trash2 size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isAddingSub && (
        <form 
          onSubmit={handleAddSub} 
          className="flex items-center gap-2 py-2 pr-4 animate-in slide-in-from-left-2 duration-300"
          style={{ paddingLeft: `${(depth + 1) * 20 + 32}px` }}
        >
          <div className="w-1 h-8 bg-indigo-100 rounded-full shrink-0" />
          <input 
            autoFocus
            value={subFolderName}
            onChange={e => setSubFolderName(e.target.value)}
            onBlur={() => !subFolderName && setIsAddingSub(false)}
            placeholder="Subfolder name..."
            className="flex-1 bg-white border-2 border-indigo-50 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-400 shadow-sm"
          />
        </form>
      )}

      {isOpen && subfolders.length > 0 && (
        <div className="flex flex-col mt-0.5">
          {subfolders.map(sub => (
            <FolderItem key={sub._id} folder={sub} allFolders={allFolders} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderDropdown = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [rootName, setRootName] = useState('');
  const dropdownRef = useRef(null);
  
  const { items: folders, currentFolderId } = useSelector(state => state.folders);
  const currentFolder = folders.find(f => f._id === currentFolderId);
  const rootFolders = folders.filter(f => !f.parentId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Fetch folders on mount
    dispatch(fetchFolders());

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleAddRoot = (e) => {
    e.preventDefault();
    if (rootName.trim()) {
      dispatch(addFolder({ name: rootName.trim() }));
      setRootName('');
      setIsAddingRoot(false);
    }
  };

  const handleAllNotes = () => {
    dispatch(setCurrentFolder(null));
    dispatch(fetchNotes({ folderId: null }));
    setIsOpen(false);
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <div className="flex items-center group/btn shadow-xl rounded-2xl border-2 border-white hover:border-indigo-100 transition-all duration-500 bg-white/80 backdrop-blur-xl shrink-0 cursor-pointer">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-2 sm:gap-3 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-l-2xl transition-all duration-500 border-r border-indigo-50 ${
            isOpen ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'
          }`}
        >
          {currentFolder ? <FolderOpen size={18} strokeWidth={2.5} /> : <FolderClosed size={18} strokeWidth={2.5} />}
          <span className="hidden sm:inline text-[12px] font-black uppercase tracking-[0.15em]">
            {currentFolder ? currentFolder.name : 'Folders'}
          </span>
          <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
            setIsAddingRoot(true);
          }}
          className="px-3 sm:px-4 py-3 sm:py-3.5 rounded-r-2xl text-slate-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all border-l border-white"
          title="New Folder"
        >
          <FolderPlus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[85vw] sm:w-80 bg-white rounded-[2.5rem] p-3 sm:p-4 z-[9999] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 premium-dropdown-shadow border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 mb-3">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
               <span className="text-[10px] uppercase font-black tracking-[0.25em] text-indigo-400">Organization</span>
            </div>
            <button 
              onClick={() => setIsAddingRoot(true)}
              className="p-2.5 rounded-xl transition-all hover:bg-indigo-500 hover:text-white text-indigo-400 shadow-sm hover:shadow-indigo-100"
              title="New Root Folder"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="px-1 pb-2">
            <div className="max-h-[60vh] sm:max-h-[450px] overflow-y-auto hide-scrollbar scroll-smooth pr-1">
              <div 
                onClick={handleAllNotes}
                className={`flex items-center gap-3 py-3 px-4 rounded-2xl cursor-pointer transition-all duration-300 mx-1 mb-2 ${
                  !currentFolderId 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${!currentFolderId ? 'bg-white shadow-sm' : 'bg-slate-100/50 group-hover:bg-white'}`}>
                  <Folder size={16} strokeWidth={2.5} className={!currentFolderId ? 'text-indigo-500' : 'text-slate-400'} />
                </div>
                <span className={`flex-1 text-sm tracking-tight ${!currentFolderId ? 'font-black' : 'font-bold opacity-80'}`}>
                  All Notes
                </span>
              </div>

              <div className="flex flex-col mt-1">
                {rootFolders.length > 0 ? (
                  rootFolders.map(folder => (
                    <FolderItem 
                      key={folder._id} 
                      folder={folder} 
                      allFolders={folders} 
                      onSelect={() => setIsOpen(false)} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center opacity-40">
                     <FolderPlus size={32} strokeWidth={1.5} className="mb-2 text-slate-300" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Folders Yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP LAYER MODAL FOR NEW FOLDER */}
      {isAddingRoot && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
            onClick={() => setIsAddingRoot(false)}
          />
          
          {/* Modal Chassis */}
          <div className="relative w-full max-w-[90vw] sm:max-w-sm bg-white/95 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 shadow-2xl border border-white">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-sm">
                <FolderPlus size={20} strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Folder</h2>
            </div>

            <form onSubmit={handleAddRoot} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-[0.1em] text-slate-400 ml-1">Name</label>
                <input 
                  autoFocus
                  value={rootName}
                  onChange={e => setRootName(e.target.value)}
                  placeholder="e.g. Work Projects..."
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3 sm:py-3.5 text-sm font-semibold outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-50 text-indigo-600 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 active:scale-95 transition-all"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddingRoot(false)}
                  className="flex-1 bg-slate-50 text-slate-400 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderDropdown;
