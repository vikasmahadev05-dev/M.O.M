import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Pin, 
  Trash2, 
  Copy, 
  Calendar, 
  CheckCircle2, 
  MoreVertical, 
  Sparkles,
  Clock,
  Link as LinkIcon,
  Folder,
  FolderPlus,
  ChevronDown as ChevronDownIcon,
  FolderOpen,
  X
} from 'lucide-react';
import { deleteNote, duplicateNote, updateNote, linkNotes, unlinkNotes } from '../../store/notesSlice';
import { formatDistanceToNow } from 'date-fns';
import { extractPlainText } from '../../utils/noteUtils';

const NoteCard = ({ note }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const { items: allNotes } = useSelector(state => state.notes);
  const { items: allFolders, currentFolderId } = useSelector(state => state.folders);
  const [isMoving, setIsMoving] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const {
    _id,
    title,
    content,
    tags,
    color,
    isPinned,
    priority,
    updatedAt,
    folderId,
    linkedEventId,
    links = []
  } = note;

  // Deterministic random theme based on ID if no specific tag matches
  const getTheme = () => {
    const isProject = tags.some(t => t.toLowerCase() === 'project');
    const isMovie = tags.some(t => t.toLowerCase() === 'movie');
    const isTask = tags.some(t => t.toLowerCase() === 'task');

    if (isProject) return 'theme-yellow';
    if (isMovie) return 'theme-blue';
    if (isTask) return 'theme-orange';

    // Random fallback
    const themes = ['theme-yellow', 'theme-blue', 'theme-pink', 'theme-orange', 'theme-green'];
    const index = _id ? _id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % themes.length : 0;
    return themes[index];
  };

  const cardTheme = getTheme();
  const pinBadgeColor = cardTheme === 'theme-yellow' ? 'bg-amber-400' : 
                        cardTheme === 'theme-blue' ? 'bg-blue-400' : 
                        cardTheme === 'theme-pink' ? 'bg-pink-400' :
                        cardTheme === 'theme-orange' ? 'bg-orange-400' : 'bg-green-400';

  // Robust text preview logic that handles both HTML and TipTap JSON
  const getPreview = (content) => {
    const plainText = extractPlainText(content);
    if (!plainText) return <p className="text-[#6B7280] font-semibold">No content...</p>;
    
    // Auto-detect tasks or dates for "Intelligence Markers"
    const hasTask = /do|buy|complete|finish|meeting|call/i.test(plainText);
    const hasDate = /today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(plainText);

    return (
      <div className="space-y-4">
        <p className="text-[13px] leading-[1.6] text-slate-500 line-clamp-3 font-semibold">
          {plainText.substring(0, 150)}
          {plainText.length > 150 && '...'}
        </p>
        <div className="flex flex-wrap gap-2">
            {hasTask && <div className="px-4 py-1.5 bg-[#FDE68A] text-[10px] font-black text-amber-900 uppercase tracking-widest rounded-xl shadow-sm">Task</div>}
            {hasDate && <div className="px-4 py-1.5 bg-[#BFDBFE] text-[10px] font-black text-blue-900 uppercase tracking-widest rounded-xl shadow-sm">Event</div>}
            {tags.slice(1).map(t => (
              <div key={t} className="px-4 py-1.5 bg-white/40 text-[10px] font-black text-slate-600 uppercase tracking-widest rounded-xl shadow-sm">{t}</div>
            ))}
        </div>
      </div>
    );
  };

  const handlePin = (e) => {
    e.stopPropagation();
    dispatch(updateNote({ id: _id, isPinned: !isPinned }));
  };

  const handleDeletePermanent = (e) => {
    e.stopPropagation();
    dispatch(deleteNote(_id));
    setShowDeleteOptions(false);
  };

  const handleRemoveFromFolder = (e) => {
    e.stopPropagation();
    dispatch(updateNote({ id: _id, folderId: null }));
    setShowDeleteOptions(false);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    dispatch(duplicateNote(note));
  };

  const handleMove = (e, folderId) => {
    e.stopPropagation();
    dispatch(updateNote({ id: _id, folderId }));
    setIsMoving(false);
  };

  const handleConnect = (targetId) => {
    dispatch(linkNotes({ noteId: _id, targetId, reason: linkReason }));
    setIsLinking(false);
    setSearchQuery('');
    setLinkReason('');
  };

  const handleUnlink = (targetId) => {
    dispatch(unlinkNotes({ noteId: _id, targetId }));
  };

  return (
    <div 
      onClick={() => navigate(`/notes/${_id}`)}
      className={`group relative transition-all duration-500 cursor-pointer border border-white/40 premium-card note-card-size ${cardTheme} p-9 flex flex-col`}
    >
      {/* 3-Layer Fold Highlight */}
      <div className="fold-highlight"></div>

      <div className="flex justify-between items-start mb-6">
        <h3 className="font-black text-[#1F2937] text-2xl leading-[1.2] pr-14 tracking-tight">
          {title || 'Untitled Note'}
        </h3>
        
        <div className="absolute top-8 right-8">
          <button 
            onClick={handlePin}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all shadow-md transform hover:scale-105 active:scale-95 ${isPinned ? `${pinBadgeColor} text-white shadow-lg` : 'bg-white/60 text-slate-300 hover:bg-white hover:text-slate-400'}`}
          >
            <Pin size={18} className={isPinned ? 'fill-white text-white' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-8 overflow-hidden">
        {getPreview(content)}
      </div>

      {/* Divider */}
      <div className="border-t border-dotted border-slate-300/40 my-6" />

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-2.5">
          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2.5 text-[11px] font-black text-[#6B7280] uppercase tracking-[0.15em] opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              {tags[0]}
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-[#6B7280] font-black uppercase tracking-widest opacity-40">
            <Clock size={12} strokeWidth={2.5} />
            {formatDistanceToNow(new Date(updatedAt))} ago
          </div>
          {linkedEventId && (
            <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">
              <Calendar size={12} strokeWidth={2.5} />
              Linked to Calendar
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
          {!currentFolderId && (
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoving(!isMoving);
                  setShowDeleteOptions(false);
                }} 
                className={`p-3 rounded-2xl transition-all shadow-md ${isMoving ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400 hover:text-indigo-600 hover:shadow-lg'}`}
              >
                <FolderPlus size={18} strokeWidth={2.5} />
              </button>
              
              {isMoving && (
                <div className="absolute bottom-full right-0 lg:right-[-40px] mb-4 w-60 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-[10px] uppercase font-black tracking-[0.25em] text-indigo-400 px-4 py-3 border-b border-indigo-50 mb-2">Move to Folder</p>
                  <div className="max-h-56 overflow-y-auto hide-scrollbar scroll-smooth pr-1">
                    {allFolders.map(f => (
                      <div 
                        key={f._id}
                        onClick={(e) => handleMove(e, f._id)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mb-1 ${folderId === f._id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
                      >
                        {folderId === f._id ? <FolderOpen size={16} strokeWidth={2.5} className="text-indigo-500" /> : <Folder size={16} strokeWidth={2.5} className="text-slate-300" />}
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLinking(!isLinking);
                setIsMoving(false);
                setShowDeleteOptions(false);
              }} 
              className={`p-3 rounded-2xl transition-all shadow-md ${isLinking ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400 hover:text-indigo-600 hover:shadow-lg'}`}
              title="Connect Notes"
            >
              <LinkIcon size={18} strokeWidth={2.5} />
            </button>

            {/* Note Linking Dialog - Responsive (Bottom Sheet on Mobile, Floating on Desktop) */}
            {isLinking && (
              <>
                {/* Mobile Backdrop */}
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[190] lg:hidden" onClick={() => setIsLinking(false)} />
                <div className="fixed inset-x-0 bottom-0 z-[200] bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 animate-in slide-in-from-bottom duration-500 lg:absolute lg:inset-auto lg:bottom-full lg:right-[-80px] lg:mb-4 lg:w-72 lg:rounded-[2rem] lg:shadow-2xl lg:border lg:border-slate-100 lg:p-4 lg:z-[100] lg:animate-in lg:fade-in lg:slide-in-from-bottom-2">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 lg:hidden" />
                  <p className="text-[10px] uppercase font-black tracking-[0.25em] text-indigo-400 px-2 py-2 border-b border-indigo-50 mb-4 text-center lg:mb-3">Manage Connections</p>
                  
                  {/* Existing Links Section */}
                  {links.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2 mb-2">Current Links</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto hide-scrollbar pr-1">
                        {links.map((link) => {
                          const linkedNote = allNotes.find(n => n._id === (link.targetId?._id || link.targetId || link));
                          if (!linkedNote) return null;
                          return (
                            <div key={linkedNote._id} className="flex items-center justify-between gap-2 px-3 py-2 bg-indigo-50/50 rounded-xl group/link">
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 truncate">{linkedNote.title}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnlink(linkedNote._id);
                                }}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                title="Remove Link"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-indigo-50 my-3" />
                    </div>
                  )}

                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2 mb-2">Connect New Note</p>
                  <input 
                    type="text" 
                    placeholder="Search notes..." 
                    className="w-full px-5 py-3 lg:px-4 lg:py-2 rounded-2xl lg:rounded-xl bg-slate-50 text-xs mb-2 outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <input 
                    type="text" 
                    placeholder="Reason (optional)" 
                    className="w-full px-5 py-3 lg:px-4 lg:py-2 rounded-2xl lg:rounded-xl bg-slate-50 text-xs mb-4 lg:mb-3 outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
                    value={linkReason}
                    onChange={(e) => setLinkReason(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="max-h-48 lg:max-h-40 overflow-y-auto hide-scrollbar scroll-smooth pr-1">
                    {allNotes
                      .filter(n => n._id !== _id && !links.some(l => (l.targetId?._id || l.targetId || l) === n._id) && n.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(n => (
                        <button 
                          key={n._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(n._id);
                          }}
                          className="w-full text-left px-5 py-4 lg:px-4 lg:py-3 hover:bg-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all mb-1 border border-transparent hover:border-indigo-100"
                        >
                          {n.title || 'Untitled Note'}
                        </button>
                      ))}
                    {allNotes.filter(n => n._id !== _id && !links.some(l => (l.targetId?._id || l.targetId || l) === n._id) && n.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <p className="text-center py-6 lg:py-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching notes</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={handleDuplicate} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-amber-600 hover:shadow-lg transition-all shadow-md">
            <Copy size={18} strokeWidth={2.5} />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteOptions(!showDeleteOptions);
                setIsLinking(false);
                setIsMoving(false);
              }}
              className={`p-3 rounded-2xl transition-all shadow-md ${showDeleteOptions ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500 hover:shadow-lg'}`}
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>

            {showDeleteOptions && (
              <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-[10px] uppercase font-black tracking-[0.25em] text-red-400 px-4 py-3 border-b border-red-50 mb-2 text-center">Note Options</p>
                
                {folderId && (
                  <button 
                    onClick={handleRemoveFromFolder}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all mb-1"
                  >
                    <Folder size={14} strokeWidth={2.5} className="text-slate-300" />
                    <span>Remove from Folder</span>
                  </button>
                )}
                
                <button 
                  onClick={handleDeletePermanent}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 rounded-2xl transition-all group/p"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={14} strokeWidth={2.5} className="text-red-300 group-hover/p:text-red-500" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest group-hover/p:text-red-600">Delete Permanently</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
