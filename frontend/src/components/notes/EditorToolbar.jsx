import React from 'react';
import { 
    Bold, Italic, Heading1, Heading2, List, CheckSquare, Code, 
    Sparkles, ListChecks, BarChart2, Paperclip 
} from 'lucide-react';

const EditorToolbar = ({ editor, onAIAction, onAttach }) => {
    const fileInputRef = React.useRef(null);
    if (!editor) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAttach(file);
        }
    };

    const buttons = [
        { 
            icon: <Bold size={16} />, 
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold'),
            title: 'Bold'
        },
        { 
            icon: <Italic size={16} />, 
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic'),
            title: 'Italic'
        },
        { 
            icon: <Heading1 size={16} />, 
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 }),
            title: 'H1'
        },
        { 
            icon: <Heading2 size={16} />, 
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 }),
            title: 'H2'
        },
        { 
            icon: <List size={16} />, 
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList'),
            title: 'Bullet List'
        },
        { 
            icon: <span className="font-bold text-xs">1.</span>, 
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList'),
            title: 'Numbered List'
        },
        { 
            icon: <CheckSquare size={16} />, 
            action: () => editor.chain().focus().toggleTaskList().run(),
            isActive: editor.isActive('taskList'),
            title: 'Task List'
        },
        { 
            icon: <Code size={16} />, 
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock'),
            title: 'Code Block'
        },
    ];

    const aiActions = [
        {
            label: 'Analysis',
            icon: <BarChart2 size={14} />,
            action: () => onAIAction('analyze'),
            color: 'text-green-600'
        }
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white/80 backdrop-blur-md border-b border-gray-100 rounded-t-2xl sticky top-0 z-20">
            <div className="flex items-center gap-1 pr-2 border-r border-gray-100">
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        title={btn.title}
                        className={`p-2 rounded-lg transition-all ${
                            btn.isActive 
                                ? 'bg-indigo-100 text-indigo-600' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {btn.icon}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-gray-100 italic">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach File"
                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    <Paperclip size={16} />
                </button>

                {aiActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={action.action}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-50 hover:bg-white border border-gray-100 transition-all shadow-sm active:scale-95 ${action.color}`}
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EditorToolbar;
