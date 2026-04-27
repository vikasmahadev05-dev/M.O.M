import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import RichTextEditor from './RichTextEditor';
import EditorToolbar from './EditorToolbar';
import AIResultPanel from './AIResultPanel';
import AttachmentGallery from './AttachmentGallery';
import LinkedNotesDisplay from './LinkedNotesDisplay';
import { updateNoteLocally, updateNote, setSaveStatus, uploadAttachment, removeAttachment } from '../../store/notesSlice';
import { Paperclip, Mic, Image as ImageIcon, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { fixUrl } from '../../utils/urlHelper';

import Tesseract from 'tesseract.js';


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

  // Voice & OCR State
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false); // Persistent ref for event handlers
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrWordCount, setOcrWordCount] = useState(0);
  const [ocrFilePreview, setOcrFilePreview] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition && !recognition.current) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += result + ' ';
          } else {
            currentInterim += result;
          }
        }
        
        setInterimTranscript(currentInterim);

        if (finalTranscript && editorRef.current) {
          // IMPORTANT: Insert content without forcing focus on mobile 
          // to prevent keyboard from popping up and killing the mic session.
          editorRef.current.commands.insertContent(finalTranscript);
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.current.onend = () => {
        // Restart if we are still supposed to be listening (common on mobile)
        if (isListeningRef.current) {
          try {
            recognition.current.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }
      };
    }
  }, [SpeechRecognition]);

  const toggleVoice = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      recognition.current.stop();
      setInterimTranscript('');
    } else {
      // Clear before starting
      setInterimTranscript('');
      isListeningRef.current = true;
      setIsListening(true);
      
      try {
        recognition.current.start();
      } catch (e) {
        console.error('Start error:', e);
        // If already started, just ensure state is sync
      }
    }
  };


  const handleOCR = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    setIsOcrLoading(true);
    setOcrProgress(0);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setOcrFilePreview(e.target.result);
    reader.readAsDataURL(file);

    let worker = null;
    try {
        // Use createWorker for more robust lifecycle on mobile
        worker = await Tesseract.createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });

        const { data: { text } } = await worker.recognize(file);

        if (text && editorRef.current) {
          editorRef.current.chain().focus().insertContent(`\n${text}\n`).run();
          
          const words = text.trim().split(/\s+/).length;
          setOcrWordCount(words);
          setOcrSuccess(true);
          
          console.log('✅ Text Extracted Successfully');
        } else if (!text) {
          alert('No text detected in this image.');
        }
    } catch (err) {
        console.error('OCR Error:', err);
        alert('Failed to extract text. This might be due to low memory on your device.');
    } finally {
        if (worker) {
          await worker.terminate();
        }
        setIsOcrLoading(false);
        setOcrProgress(0);
        setTimeout(() => {
            setOcrSuccess(false);
            setOcrFilePreview(null);
        }, 3000);
    }
  };



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
              editorRef.current.chain().focus().setImage({ src: fixUrl(newAttachment.url) }).run();
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
            onVoiceToggle={toggleVoice}
            isListening={isListening}
            onOCR={handleOCR}
            isOcrLoading={isOcrLoading}
            ocrProgress={ocrProgress}
          />

          
          <div className="p-4 md:p-10 pb-24">

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
                onOpen={(att) => window.open(fixUrl(att.url), '_blank')}
              />

              {/* Linked Notes (Connections) */}
              <div className="mt-12 pt-10 border-t border-slate-100/50">
                  <LinkedNotesDisplay noteId={currentNoteId} />
              </div>
          </div>
      </div>

      {/* Voice Overlay (Ultra-Premium Spectral Aesthetic) */}
      <AnimatePresence>
          {isListening && (
              <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none"
              >
                  {/* Outer Glow Layer */}
                  <div className="absolute inset-0 bg-[var(--accent)] blur-[80px] opacity-20 animate-pulse-slow"></div>

                  <div className="glass-card bg-slate-900/80 text-white px-6 md:px-10 py-5 md:py-6 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-center gap-4 md:gap-8 backdrop-blur-3xl border border-white/10 w-[90vw] max-w-[420px] relative overflow-hidden">

                      {/* Internal Spectral Gradient */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400 opacity-80"></div>
                      
                      <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center relative z-10 shadow-lg shadow-indigo-500/20">
                              <Mic className="text-white animate-pulse" size={26} />
                          </div>
                          {/* Pulsing Aura Rings */}
                          {[1, 2].map(i => (
                              <motion.div 
                                  key={i}
                                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.7 }}
                                  className="absolute inset-0 bg-indigo-500 rounded-2xl"
                              />
                          ))}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Live Consciousness</p>
                          </div>
                          <div className="h-6 overflow-hidden">
                              <AnimatePresence mode='wait'>
                                  <motion.p 
                                      key={interimTranscript || 'waiting'}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-[15px] font-bold text-white/90 italic line-clamp-1 leading-tight"
                                  >
                                      {interimTranscript || 'Speak your mind, I\'m here...'}
                                  </motion.p>
                              </AnimatePresence>
                          </div>
                      </div>

                      {/* Visualizer bars */}
                      <div className="flex items-end gap-1.5 h-8">
                          {[1, 2, 3, 4, 5].map(i => (
                              <motion.div 
                                  key={i}
                                  animate={{ height: isListening ? [8, 28, 12, 24, 8] : 8 }}
                                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }}
                                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-sky-400 rounded-full opacity-60 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                              />
                          ))}
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* OCR Overlay (Matrix-Zen Aesthetic) */}
      <AnimatePresence>
          {(isOcrLoading || ocrSuccess) && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: '-50%', y: -30 }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: '-50%', y: -20 }}
                  className="fixed top-28 left-1/2 z-[100] w-[380px] pointer-events-none"
              >
                  {/* Premium Backdrop Glow */}
                  <div className={`absolute inset-0 blur-[60px] opacity-30 transition-colors duration-700 ${
                      ocrSuccess ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}></div>

                  <div className={`glass-card p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl backdrop-blur-3xl border transition-all duration-700 relative overflow-hidden w-[90vw] max-w-[400px] ${
                      ocrSuccess ? 'bg-emerald-950/90 border-emerald-400/30' : 'bg-slate-950/90 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]'
                  }`}>

                      
                      <div className="flex gap-7 relative z-10">
                          {/* Image Thumbnail with Scanning Tech */}
                          <div className="w-24 h-28 bg-slate-900 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl flex-shrink-0">
                              {ocrFilePreview && (
                                  <img src={ocrFilePreview} className={`w-full h-full object-cover transition-all duration-700 ${ocrSuccess ? 'opacity-100 scale-105' : 'opacity-40 grayscale-[0.5]'}`} alt="Scanning" />
                              )}
                              
                              {!ocrSuccess && (
                                  <>
                                      <motion.div 
                                          animate={{ top: ['0%', '100%'] }}
                                          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                                          className="absolute left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_20px_#38bdf8] z-20"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent"></div>
                                  </>
                              )}

                              {ocrSuccess && (
                                  <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm"
                                  >
                                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-2xl">
                                          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }}>
                                              <Sparkles size={28} />
                                          </motion.div>
                                      </div>
                                  </motion.div>
                              )}
                          </div>

                          <div className="flex-1 flex flex-col justify-center">
                              <div className="flex justify-between items-start mb-3">
                                  <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors ${ocrSuccess ? 'text-emerald-400' : 'text-sky-300'}`}>
                                      {ocrSuccess ? 'Deep Scan Sync' : 'Neural Core'}
                                  </h4>
                                  {ocrSuccess && (
                                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-black italic bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                                          SYCHRONIZED
                                      </motion.span>
                                  )}
                              </div>
                              
                              <p className="text-xs text-white/60 font-bold mb-4 italic tracking-tight">
                                  {ocrSuccess ? `Harvested ${ocrWordCount} new thoughts.` : 'Deciphering pixel sequence...'}
                              </p>
                              
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3 p-[1px]">
                                  <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: ocrSuccess ? '100%' : `${ocrProgress}%` }}
                                      className={`h-full rounded-full transition-all duration-700 ${ocrSuccess ? 'bg-white shadow-[0_0_15px_#fff]' : 'bg-sky-400 shadow-[0_0_15px_#38bdf8]'}`}
                                  />
                              </div>
                              
                              <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase">
                                  <span className={ocrSuccess ? 'text-emerald-400' : 'text-sky-300/60'}>
                                      {ocrSuccess ? 'Intelligence Saved' : `${ocrProgress}% Harvested`}
                                  </span>
                                  {!ocrSuccess && <RefreshCw size={12} className="animate-spin text-sky-400" />}
                              </div>
                          </div>
                      </div>
                      
                      {ocrSuccess && (
                          <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="mt-6 pt-5 border-t border-white/5 text-[10px] font-bold text-white/50 italic flex items-center gap-3"
                          >
                              <div className="flex gap-1">
                                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                              </div>
                              Your digital memory has been expanded.
                          </motion.div>
                      )}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>




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
