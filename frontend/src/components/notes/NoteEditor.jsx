import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNoteLocally, updateNote, setSaveStatus } from '../../store/notesSlice';

const NoteEditor = () => {
  const dispatch = useDispatch();
  const { currentNoteId, items } = useSelector(state => state.notes);
  const currentNote = items.find(n => n._id === currentNoteId);

  const [localContent, setLocalContent] = useState('');
  
  // Sync local state when selected note changes
  useEffect(() => {
    if (currentNote) {
      setLocalContent(currentNote.content || '');
    } else {
      setLocalContent('');
    }
  }, [currentNoteId]); // Only when ID changes, otherwise we interrupt typing on sorting updates

  // Simple debounce logic
  useEffect(() => {
    if (!currentNoteId || currentNote?.content === localContent) return;

      dispatch(setSaveStatus('saving'));
      const timeoutId = setTimeout(() => {
        
        let newTitle = currentNote?.title;
        // Auto-generate title from first line if title is exactly "Untitled Note" or empty
        if ((!currentNote?.title || currentNote?.title === 'Untitled Note') && localContent.trim().length > 0) {
            const firstLine = localContent.split('\n')[0].substring(0, 40).trim();
            if (firstLine) newTitle = firstLine;
        }

        dispatch(updateNoteLocally({ id: currentNoteId, content: localContent, title: newTitle }));
        dispatch(updateNote({ id: currentNoteId, content: localContent, title: newTitle }));
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
  }, [localContent, currentNoteId, dispatch]);

  const handleChange = (e) => {
    setLocalContent(e.target.value);
  };

  if (!currentNoteId || !currentNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--bg-primary)]/30 rounded-b-3xl">
        <div className="w-24 h-24 mb-6 opacity-20 paper-texture rounded-xl border border-[var(--border)] shadow-sm transform -rotate-6"></div>
        <p className="text-lg">Select a note or create a new one to start writing</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 relative transition-colors duration-500 rounded-b-3xl overflow-hidden ${currentNote.color || 'bg-[var(--bg-secondary)]'}`}>
        
      {/* Background styling layers */}
      <div className="absolute inset-0 paper-texture pointer-events-none mix-blend-multiply opacity-50"></div>
      <div className="absolute inset-0 notebook-page pointer-events-none opacity-[0.15]"></div>

      <textarea
        className="relative z-10 w-full h-full p-6 pt-8 bg-transparent outline-none resize-none hide-scrollbar text-lg text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 leading-[32px]"
        placeholder="Start typing..."
        value={localContent}
        onChange={handleChange}
        spellCheck="false"
      />
    </div>
  );
};

export default NoteEditor;
