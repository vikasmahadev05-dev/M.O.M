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
  Folder
} from 'lucide-react';
import { deleteNote, duplicateNote, updateNote } from '../../store/notesSlice';
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

  // Determine card color based on tags or sequence
  const isProject = tags.some(t => t.toLowerCase() === 'project');
  const isMovie = tags.some(t => t.toLowerCase() === 'movie');
  const isTask = tags.some(t => t.toLowerCase() === 'task');
  
  const cardTheme = isProject ? 'theme-yellow' : isMovie ? 'theme-blue' : isTask ? 'theme-orange' : 'bg-white';
  const pinBadgeColor = isProject ? 'bg-amber-400' : isMovie ? 'bg-blue-400' : 'bg-orange-400';

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
      className={`group relative transition-all duration-500 cursor-pointer border border-white/40 premium-card note-card-size ${cardTheme}`}
    >
      {/* 3-Layer Fold Highlight */}
      <div className="fold-highlight"></div>
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-extrabold text-[#1F2937] text-xl leading-tight pr-12">
          {title || 'Untitled Note'}
        </h3>
        
        <div className="absolute top-6 right-6">
          <button 
            onClick={handlePin}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-md transform hover:scale-105 active:scale-95 ${isPinned ? `${pinBadgeColor} text-white shadow-lg` : 'bg-white/40 text-slate-300 hover:bg-white hover:text-slate-400'}`}
          >
            <Pin size={16} className={isPinned ? 'fill-white text-white' : ''} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        {getPreview(content)}
      </div>

      {/* Divider */}
      <div className="border-t border-dotted border-slate-300/40 my-6" />

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-3">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
              <Folder size={14} className="text-slate-300" />
              {tags[0]}
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280] font-bold uppercase tracking-wider">
            <Clock size={14} className="text-slate-300" />
            {formatDistanceToNow(new Date(updatedAt))} ago
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsLinking(true);
            }} 
            className="p-2.5 bg-white/60 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-md"
          >
            <LinkIcon size={16} />
          </button>
          <button onClick={handleDuplicate} className="p-2.5 bg-white/60 rounded-2xl text-slate-400 hover:text-amber-600 hover:bg-white transition-all shadow-md">
            <Copy size={16} />
          </button>
          <button onClick={handleDelete} className="p-2.5 bg-white/60 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-md">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
