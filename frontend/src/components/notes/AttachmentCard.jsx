import React from 'react';
import { FileText, Download, Trash2, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const AttachmentCard = ({ attachment, onRemove, onOpen }) => {
    const isImage = attachment.fileType === 'image';
    
    // Size formatter
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative w-48 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
        >
            {/* Preview Box */}
            <div className="h-28 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {isImage ? (
                    <img 
                        src={attachment.url} 
                        alt={attachment.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                            <FileText size={24} />
                        </div>
                    </div>
                )}
                
                {/* Hover Actions (Aura Style) */}
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button 
                        onClick={() => onOpen(attachment)}
                        className="p-2 bg-white rounded-full text-slate-800 hover:bg-indigo-500 hover:text-white transition-colors"
                        title="Open"
                    >
                        {isImage ? <Eye size={16} /> : <ExternalLink size={16} />}
                    </button>
                    <a 
                        href={attachment.url} 
                        download={attachment.name}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white rounded-full text-slate-800 hover:bg-indigo-500 hover:text-white transition-colors"
                        title="Download"
                    >
                        <Download size={16} />
                    </a>
                    <button 
                        onClick={() => onRemove(attachment._id)}
                        className="p-2 bg-white rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 bg-white">
                <p className="text-[11px] font-bold text-slate-700 truncate mb-0.5 line-clamp-1">{attachment.name}</p>
                <p className="text-[9px] font-medium text-slate-400 flex items-center justify-between">
                    <span>{attachment.fileType.toUpperCase()}</span>
                    <span>{formatSize(attachment.size)}</span>
                </p>
            </div>
        </motion.div>
    );
};

export default AttachmentCard;
