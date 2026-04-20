import React from 'react';
import AttachmentCard from './AttachmentCard';
import { motion, AnimatePresence } from 'framer-motion';

const AttachmentGallery = ({ attachments, onRemove, onOpen }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attachments</h3>
                <span className="text-[9px] bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-bold">
                    {attachments.length} {attachments.length === 1 ? 'File' : 'Files'}
                </span>
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4">
                <AnimatePresence>
                    {attachments.map((attachment) => (
                        <AttachmentCard 
                            key={attachment._id || attachment.url} 
                            attachment={attachment} 
                            onRemove={onRemove}
                            onOpen={onOpen}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AttachmentGallery;
