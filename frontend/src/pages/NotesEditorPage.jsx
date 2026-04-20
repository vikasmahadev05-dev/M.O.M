import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setCurrentNote, updateNote, fetchNotes } from '../store/notesSlice';
import NoteEditor from '../components/notes/NoteEditor';
import { ChevronLeft, Share2, MoreHorizontal, Sparkles } from 'lucide-react';

const NotesEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isAddingTag, setIsAddingTag] = React.useState(false);
    const [tagInput, setTagInput] = React.useState('');
    const { items: notes, status: notesStatus } = useSelector(state => state.notes);
    const currentNote = notes.find(n => n._id === id);
    const [title, setTitle] = React.useState(currentNote?.title || '');

    useEffect(() => {
        // If notes aren't loaded yet (e.g. on refresh), fetch them
        if (notesStatus === 'idle') {
            dispatch(fetchNotes());
        }
        
        if (id) {
            dispatch(setCurrentNote(id));
        }
    }, [id, dispatch, notesStatus]);

    // Sync local title when note changes (e.g. initial load or switch)
    useEffect(() => {
        if (currentNote?.title !== undefined && !isAddingTag) {
            setTitle(currentNote.title);
        }
    }, [currentNote?._id]);

    // Debounced Title Save
    useEffect(() => {
        if (!id || title === currentNote?.title) return;
        const timer = setTimeout(() => {
            dispatch(updateNote({ id, title }));
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, id, dispatch]);

    const handleAddTag = () => {
        const cleanTag = tagInput.trim();
        if (!cleanTag) {
            setIsAddingTag(false);
            return;
        }

        const existingTags = currentNote?.tags || [];
        if (!existingTags.includes(cleanTag)) {
            dispatch(updateNote({ id, tags: [...existingTags, cleanTag] }));
        }
        
        setTagInput('');
        setIsAddingTag(false);
    };

    return (
        <div className="flex flex-col animate-in slide-in-from-right-4 duration-500">
            {/* Editor Detail Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-xl border-b border-white/60 md:rounded-t-[2.5rem]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/notes')}
                        className="p-2 hover:bg-white/60 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-black text-slate-800 tracking-tight w-full max-w-[300px] focus:ring-0 p-0"
                            placeholder="Untitled Note"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <Sparkles size={10} className="text-indigo-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2">Editing Mode</span>
                            
                            {/* Tags Section */}
                            {currentNote?.tags?.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-tighter rounded-md flex items-center gap-1 group">
                                    {tag}
                                    <button 
                                        onClick={() => {
                                            const newTags = currentNote.tags.filter(t => t !== tag);
                                            dispatch(updateNote({ id, tags: newTags }));
                                        }}
                                        className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}

                            {isAddingTag ? (
                                <input 
                                    autoFocus
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    onBlur={() => {
                                        if (!tagInput) setIsAddingTag(false);
                                        else handleAddTag();
                                    }}
                                    className="px-2 py-0.5 bg-white border border-indigo-100 text-[8px] font-black text-slate-600 uppercase tracking-tighter rounded-md outline-none focus:ring-2 focus:ring-indigo-50 w-20"
                                    placeholder="TYPE TAG..."
                                />
                            ) : (
                                <button 
                                    onClick={() => setIsAddingTag(true)}
                                    className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black text-indigo-500 uppercase tracking-widest hover:bg-white rounded-md transition-all border border-transparent hover:border-indigo-50"
                                >
                                    + Add Tag
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-400 hover:bg-white/60 rounded-xl transition-all">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:bg-white/60 rounded-xl transition-all">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </header>

            {/* Main Editor Component */}
            <div className="flex-1 bg-white md:rounded-b-[2.5rem] border-x border-b border-white/60 shadow-2xl shadow-slate-100/50">
                <NoteEditor />
            </div>
        </div>
    );
};

export default NotesEditorPage;
