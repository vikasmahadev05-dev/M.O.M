import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, Plus, Trash2 } from 'lucide-react';
import { setCurrentFolder, addFolder, deleteFolder } from '../../store/foldersSlice';
import { fetchNotes } from '../../store/notesSlice';

const FolderItem = ({ folder, allFolders, depth = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    navigate('/notes');
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
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all ${
          isSelected ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-600'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <button 
          onClick={handleToggle}
          className={`p-0.5 rounded hover:bg-slate-200 transition-colors ${subfolders.length === 0 ? 'opacity-0 cursor-default' : ''}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <Folder size={16} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
        <span className="flex-1 truncate text-sm">{folder.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsAddingSub(true); }}
            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-500"
          >
            <Plus size={12} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded text-slate-300 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isAddingSub && (
        <form 
          onSubmit={handleAddSub} 
          className="flex items-center gap-2 py-1"
          style={{ paddingLeft: `${(depth + 1) * 12 + 28}px` }}
        >
          <input 
            autoFocus
            value={subFolderName}
            onChange={e => setSubFolderName(e.target.value)}
            onBlur={() => !subFolderName && setIsAddingSub(false)}
            placeholder="New subfolder..."
            className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-400"
          />
        </form>
      )}

      {isOpen && subfolders.length > 0 && (
        <div className="flex flex-col">
          {subfolders.map(sub => (
            <FolderItem key={sub._id} folder={sub} allFolders={allFolders} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: folders, currentFolderId } = useSelector(state => state.folders);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [rootName, setRootName] = useState('');

  const rootFolders = folders.filter(f => !f.parentId);

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
    navigate('/notes');
  };

  return (
    <div className="flex flex-col gap-1 mt-6">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Folders</span>
        <button 
          onClick={() => setIsAddingRoot(true)}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-500 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      <div 
        onClick={handleAllNotes}
        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
          !currentFolderId ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-600'
        }`}
      >
        <Folder size={16} className={!currentFolderId ? 'text-indigo-500' : 'text-slate-400'} />
        <span className="text-sm">All Notes</span>
      </div>

      {isAddingRoot && (
        <form onSubmit={handleAddRoot} className="px-2 py-1">
          <input 
            autoFocus
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            onBlur={() => !rootName && setIsAddingRoot(false)}
            placeholder="Folder name..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-400"
          />
        </form>
      )}

      <div className="flex flex-col">
        {rootFolders.map(folder => (
          <FolderItem key={folder._id} folder={folder} allFolders={folders} />
        ))}
      </div>
    </div>
  );
};

export default FolderTree;
