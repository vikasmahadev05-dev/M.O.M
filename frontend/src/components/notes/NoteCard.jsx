import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
  Link as LinkIcon
} from 'lucide-react';
import { deleteNote, duplicateNote, updateNote, linkNotes, unlinkNotes } from '../../store/notesSlice';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { extractPlainText } from '../../utils/noteUtils';

const NoteCard = ({ note }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const { items: allNotes } = useSelector(state => state.notes);

  const {
    _id,
    title,
    content,
    tags,
    color,
    isPinned,
    priority,
    updatedAt,
    links = []
  } = note;

  // Utility to check if a note is ALREADY linked to this card
  const isLinked = (targetId) => {
    return links.some(l => (l.targetId?._id === targetId || l.targetId === targetId || l === targetId));
  };

  const handleLinkAction = (targetId, alreadyLinked) => {
    if (alreadyLinked) {
      if (window.confirm('Unlink these notes?')) {
        dispatch(unlinkNotes({ noteId: _id, targetId }));
      }
    } else {
      dispatch(linkNotes({ noteId: _id, targetId, reason: linkReason }));
    }
    setIsLinking(false);
    setSearchQuery('');
    setLinkReason('');
  };

  // Robust text preview logic that handles both HTML and TipTap JSON
  const getPreview = (content) => {
    const plainText = extractPlainText(content);
    if (!plainText) return 'No content...';
    
    // Auto-detect tasks or dates for "Intelligence Markers"
    const hasTask = /do|buy|complete|finish|meeting|call/i.test(plainText);
    const hasDate = /today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(plainText);

    return (
      <div className="space-y-3">
        <p className="text-[13px] leading-[1.6] text-slate-500 line-clamp-3 font-medium">
          {plainText.substring(0, 150)}
          {plainText.length > 150 && '...'}
        </p>
        <div className="flex gap-2">
            {hasTask && <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-[8px] font-black text-amber-600 uppercase tracking-widest rounded-full border border-amber-100">Task</div>}
            {hasDate && <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[8px] font-black text-blue-600 uppercase tracking-widest rounded-full border border-blue-100">Event</div>}
        </div>
      </div>
    );
  };

  const handlePin = (e) => {
    e.stopPropagation();
    dispatch(updateNote({ id: _id, isPinned: !isPinned }));
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      dispatch(deleteNote(_id));
    }
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    dispatch(duplicateNote(note));
  };

  return (
    <div 
      onClick={() => navigate(`/notes/${_id}`)}
      className={`group relative break-inside-avoid mb-6 p-5 rounded-[1.8rem] transition-all duration-300 cursor-pointer border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 ${color || 'bg-white'}`}
    >
      {/* AI Analysis Tooltip */}
      {showAI && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-indigo-100 p-3 rounded-2xl shadow-xl z-50 w-48 animate-in fade-in zoom-in slide-in-from-bottom-2 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Analysis</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            This note focuses on <span className="font-bold text-slate-700">{tags[0] || 'general activities'}</span>. Suggesting a follow-up reminder for tomorrow.
          </p>
        </div>
      )}

      {/* Quick Link Popover */}
      {isLinking && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute inset-x-4 top-4 bg-white/95 backdrop-blur-xl border border-indigo-100 p-5 rounded-[2.2rem] shadow-2xl z-[60] animate-in fade-in zoom-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <LinkIcon size={12} /> Relationship Forge
            </span>
            <button onClick={() => setIsLinking(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
          </div>
          
          <div className="space-y-3 mb-4">
            <input 
              autoFocus
              type="text"
              placeholder="Find target note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            />
            {searchQuery && (
              <input 
                type="text"
                placeholder="Connection reason (e.g. Related to, Next step)..."
                value={linkReason}
                onChange={(e) => setLinkReason(e.target.value)}
                className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-[10px] outline-none focus:ring-2 focus:ring-indigo-200 transition-all font-bold placeholder:text-indigo-300"
              />
            )}
          </div>

          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {allNotes
              .filter(n => n._id !== _id && n.title?.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 5)
              .map(match => {
                const linked = isLinked(match._id);
                return (
                  <button
                    key={match._id}
                    onClick={() => handleLinkAction(match._id, linked)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group/item ${
                      linked ? 'hover:bg-red-50 text-red-400' : 'hover:bg-indigo-50 text-slate-600'
                    }`}
                  >
                    <span className="text-[11px] font-bold truncate pr-2">{match.title}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border transition-colors ${
                      linked 
                        ? 'border-red-100 bg-red-100/50 text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white' 
                        : 'border-indigo-100 bg-indigo-50 text-indigo-400'
                    }`}>
                      {linked ? 'Unlink' : 'Connect'}
                    </span>
                  </button>
                );
              })
            }
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight pr-8">
          {title || 'Untitled Note'}
        </h3>
        
        <div className="flex gap-1 absolute top-4 right-4">
          <button 
            onClick={handlePin}
            className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-100'}`}
          >
            <Pin size={14} className={isPinned ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        {getPreview(content)}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-white/60 text-[9px] font-bold text-slate-500 uppercase tracking-tighter rounded-lg border border-white/40">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium">
          <Clock size={10} />
          {formatDistanceToNow(new Date(updatedAt))} ago
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onMouseEnter={() => setShowAI(true)}
            onMouseLeave={() => setShowAI(false)}
            className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Sparkles size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsLinking(true);
            }} 
            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Quick Link"
          >
            <LinkIcon size={14} />
          </button>
          <button onClick={handleDuplicate} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
            <Copy size={14} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
