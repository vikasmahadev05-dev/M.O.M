import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowUpRight, X, Anchor, ArrowRightLeft } from 'lucide-react';
import { extractPlainText } from '../../utils/noteUtils';

const LinkedNotesDisplay = ({ noteId }) => {
  const [links, setLinks] = useState({ outgoing: [], backlinks: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notes/${noteId}/linked`);
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isValidId = /^[0-9a-fA-F]{24}$/.test(noteId);
    if (!noteId || !isValidId) {
      setLoading(false);
      return;
    }
    fetchLinks();
  }, [noteId]);

  const handleUnlink = async (e, targetId) => {
    e.stopPropagation();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notes/unlink`, { noteId, targetId });
      fetchLinks(); // Refresh
    } catch (err) {
      console.error('Unlink failed:', err);
    }
  };

  if (loading) return <div className="animate-pulse text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] pt-10">Syncing Neurons...</div>;
  if (links.outgoing.length === 0 && links.backlinks.length === 0) return null;

  return (
    <div className="space-y-12 py-12 border-t border-slate-100 mt-20">
      
      {/* Section 1: Outgoing Connections */}
      {links.outgoing.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100/50">
              <Link2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Connected Ideas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                Outgoing Connections <ArrowUpRight size={10} />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.outgoing.map((note) => (
              <NoteLinkCard key={note._id} note={note} type="outgoing" onNavigate={navigate} onUnlink={handleUnlink} />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Backlinks */}
      {links.backlinks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl shadow-sm border border-rose-100/50">
              <Anchor size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Discovered Context</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                Incoming Backlinks <ArrowRightLeft size={10} />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.backlinks.map((note) => (
              <NoteLinkCard key={note._id} note={note} type="backlink" onNavigate={navigate} onUnlink={handleUnlink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NoteLinkCard = ({ note, type, onNavigate, onUnlink }) => {
  const plainPreview = extractPlainText(note.content);

  return (
    <div 
      onClick={() => onNavigate(`/notes/${note._id}`)}
      className="group relative bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1.5 duration-300"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${type === 'outgoing' ? 'bg-indigo-400' : 'bg-rose-400'}`} />
      
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
          {note.title}
        </h4>
        <div className="flex gap-2">
          <button 
            onClick={(e) => onUnlink(e, note._id)}
            className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-50"
          >
            <X size={14} />
          </button>
          <div className="p-1.5 bg-slate-50 rounded-xl text-slate-300 group-hover:text-indigo-400 transition-colors">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
      
      <p className="text-[12px] text-slate-500 line-clamp-3 leading-relaxed font-medium mt-1">
        {plainPreview || 'Explore this silent connection...'}
      </p>
  
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
            type === 'outgoing' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100/50' : 'bg-rose-50 text-rose-500 border border-rose-100/50'
          }`}>
            {type === 'outgoing' ? 'Connected' : 'Cited In'}
          </span>
          {note.reason && (
            <div className="h-3 w-[1px] bg-slate-200 mx-1" />
          )}
          {note.reason && (
            <span className="text-[8px] italic font-bold text-slate-400 tracking-tight">
              {note.reason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedNotesDisplay;

