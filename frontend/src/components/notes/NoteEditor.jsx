import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';
import EditorToolbar from './EditorToolbar';
import AIResultPanel from './AIResultPanel';
import AttachmentGallery from './AttachmentGallery';
import LinkedNotesDisplay from './LinkedNotesDisplay';
import { updateNoteLocally, updateNote, setSaveStatus, uploadAttachment, removeAttachment } from '../../store/notesSlice';
import { Paperclip } from 'lucide-react';

const NoteEditor = () => {
  const dispatch = useDispatch();
  const { currentNoteId, items } = useSelector(state => state.notes);
  const currentNote = items.find(n => n._id === currentNoteId);

  const [localContent, setLocalContent] = useState('');
  const lastSyncedNoteId = useRef(null);
  const editorRef = useRef(null);

  // AI Panel State
  const [aiPanel, setAiPanel] = useState({
      isOpen: false,
      title: '',
      content: '',
      type: 'text'
  });

  // Sync local state ONLY when switching notes (wait for currentNote to be loaded)
  useEffect(() => {
    if (currentNote && currentNoteId !== lastSyncedNoteId.current) {
      setLocalContent(currentNote?.content || '');
      lastSyncedNoteId.current = currentNoteId;
    }
  }, [currentNoteId, currentNote]); // Add currentNote to deps, but guard with ID check

  // Debounced save logic
  useEffect(() => {
    // CRITICAL GUARD: Never save if the note isn't loaded yet
    // This prevents the initial empty localContent from overwriting the DB on refresh
    if (!currentNoteId || !currentNote || currentNote?.content === localContent) return;

      dispatch(setSaveStatus('saving'));
      const timeoutId = setTimeout(() => {
        let newTitle = currentNote?.title;
        // Auto-generate title from first line of text if possible
        if ((!currentNote?.title || currentNote?.title === 'Untitled Note') && localContent.trim().length > 0) {
            try {
                // For TipTap JSON, we'd need to extract text from the first paragraph
                const parsed = JSON.parse(localContent);
                const firstText = parsed.content?.find(c => c.type === 'paragraph')?.content?.[0]?.text;
                if (firstText) newTitle = firstText.substring(0, 40).trim();
            } catch (e) {
                // Fallback for plain text
                const firstLine = localContent.split('\n')[0].substring(0, 40).trim();
                if (firstLine) newTitle = firstLine;
            }
        }

        dispatch(updateNoteLocally({ id: currentNoteId, content: localContent, title: newTitle }));
        dispatch(updateNote({ id: currentNoteId, content: localContent, title: newTitle }));
      }, 1000);

      return () => clearTimeout(timeoutId);
  }, [localContent, currentNoteId, dispatch, currentNote?.content, currentNote?.title]);

  const handleAIAction = async (type) => {
      if (!editorRef.current) return;
      
      const plainText = editorRef.current.getText();
      if (!plainText.trim()) return;

      setAiPanel({
          isOpen: true,
          title: `AI is thinking...`,
          content: 'Processing your note with Gemini 1.5 Flash...',
          type: 'text'
      });

      try {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/${type}`, { content: plainText });
          
          let title = '';
          let content = '';

          switch(type) {
              case 'summarize':
                  title = '✨ Summary';
                  content = response.data.summary;
                  break;
              case 'tasks':
                  title = '✅ Extracted Tasks';
                  content = response.data.tasks;
                  break;
              case 'analyze':
                  title = '📊 Deep Analysis';
                  content = response.data;
                  break;
              default:
                  break;
          }

          setAiPanel({ isOpen: true, title, content, type });
      } catch (error) {
          console.error('AI Error:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Sorry, AI could not process this note. Please check your connection.';
          setAiPanel({
              isOpen: true,
              title: 'Processing Error',
              content: errorMessage,
              type: 'text'
          });
      }
  };

  const handleAttach = async (file) => {
      if (!currentNoteId) return;
      try {
          const result = await dispatch(uploadAttachment({ noteId: currentNoteId, file })).unwrap();
          
          // Image? Insert it directly into the TipTap editor flow
          if (file.type.startsWith('image/') && editorRef.current) {
              const newAttachment = result.note.attachments[result.note.attachments.length - 1];
              editorRef.current.chain().focus().setImage({ src: newAttachment.url }).run();
          }

          console.log('✅ File Attached Successfully');
      } catch (err) {
          console.error('Upload failed:', err);
      }
  };

  const handleRemoveAttachment = async (attachmentId) => {
      if (!currentNoteId) return;
      try {
          await dispatch(removeAttachment({ noteId: currentNoteId, attachmentId })).unwrap();
          console.log('✅ Attachment Removed Successfully');
      } catch (err) {
          console.error('Removal failed:', err);
      }
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
    <div className={`flex-1 flex flex-col relative transition-colors duration-500 rounded-b-3xl ${currentNote.color || 'bg-[var(--bg-secondary)]'}`}>
        
      {/* Background styling layers */}
      <div className="absolute inset-0 paper-texture pointer-events-none mix-blend-multiply opacity-50"></div>
      <div className="absolute inset-0 notebook-page pointer-events-none opacity-[0.15]"></div>

      {/* Editor & Toolbar */}
      <div className="flex-1 flex flex-col relative z-10">
          <EditorToolbar 
            editor={editorRef.current} 
            onAIAction={handleAIAction} 
            onAttach={handleAttach}
          />
          
          <div className="p-10 pb-24">
              <RichTextEditor 
                content={localContent} 
                onChange={setLocalContent} 
                editorRef={editorRef}
                attachments={currentNote.attachments}
                onRemoveAttachment={handleRemoveAttachment}
              />

              <AttachmentGallery 
                attachments={currentNote.attachments} 
                onRemove={handleRemoveAttachment}
                onOpen={(att) => window.open(att.url, '_blank')}
              />

              {/* Linked Notes (Connections) */}
              <div className="mt-12 pt-10 border-t border-slate-100/50">
                  <LinkedNotesDisplay noteId={currentNoteId} />
              </div>
          </div>
      </div>

      {/* AI Sidebar Panel */}
      <AIResultPanel 
          isOpen={aiPanel.isOpen} 
          onClose={() => setAiPanel(prev => ({ ...prev, isOpen: false }))}
          title={aiPanel.title}
          content={aiPanel.content}
          type={aiPanel.type}
      />
    </div>
  );
};

export default NoteEditor;
