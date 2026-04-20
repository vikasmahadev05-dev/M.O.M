import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Copy, Check, Sparkles } from 'lucide-react';

const AIResultPanel = ({ isOpen, onClose, title, content, type }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Use Portal to escape any parent overflow-hidden or z-index issues
    return ReactDOM.createPortal(
        <div className={`fixed inset-y-0 right-0 w-80 md:w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[99999] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                        <Sparkles size={18} />
                    </div>
                    <h3 className="font-bold text-indigo-950 text-lg">
                        {title}
                    </h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-indigo-100">
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                {type === 'analyze' && typeof content !== 'string' ? (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Check className="text-blue-500" size={16} />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500">Actionable Tasks</h4>
                            </div>
                            <ul className="space-y-3">
                                {content.tasks?.map((task, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <span className="text-blue-300 font-bold">{i + 1}.</span>
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-amber-500">📅</span>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500">Deadlines Detected</h4>
                            </div>
                            <ul className="space-y-3">
                                {content.deadlines?.map((dl, i) => (
                                    <li key={i} className="flex flex-col gap-1.5 text-sm bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 shadow-sm">
                                        <span className="font-bold text-amber-900 leading-tight">{dl.task}</span>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                                            <span className="p-1 px-2 bg-amber-100 rounded-md">Deadline: {dl.date}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-indigo max-w-none">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                            {content}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                <button 
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-indigo-600 border border-indigo-700 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Results'}
                </button>
            </div>
        </div>,
        document.body
    );
};

export default AIResultPanel;
