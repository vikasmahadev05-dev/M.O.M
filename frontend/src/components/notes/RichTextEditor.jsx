import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlock from '@tiptap/extension-code-block';
import Paragraph from '@tiptap/extension-paragraph';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import { SmartDetection } from './extensions/SmartDetection';
import { NoteLink } from './extensions/NoteLink';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import LinkedNotesDisplay from './LinkedNotesDisplay';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { addTask } from '../../store/tasksSlice';
import { fixUrl } from '../../utils/urlHelper';

const RichTextEditor = ({ content, onChange, editorRef, attachments, onRemoveAttachment }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { items: allNotes } = useSelector(state => state.notes);

    // Recursively fix image URLs in TipTap JSON
    const processContent = (node) => {
        if (!node) return node;
        if (node.type === 'image' && node.attrs && node.attrs.src) {
            return {
                ...node,
                attrs: {
                    ...node.attrs,
                    src: fixUrl(node.attrs.src)
                }
            };
        }
        if (node.content && Array.isArray(node.content)) {
            return {
                ...node,
                content: node.content.map(processContent)
            };
        }
        return node;
    };

    // Determine if content is JSON or plain string (for migration)
    const initialContent = (() => {
        if (!content) return '';
        try {
            // Attempt to parse JSON
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            return processContent(parsed);
        } catch (e) {
            // If it's plain text, convert to a basic Paragraph structure for TipTap
            return content;
        }
    })();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: false,
                codeBlock: false,
                bulletList: false, // Manual config
                orderedList: false, // Manual config
                listItem: false,
                heading: false, // Manual config below
            }),
            ListItem,
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-disc ml-6 space-y-2',
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: 'list-decimal ml-6 space-y-2',
                },
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            SmartDetection,
            NoteLink.configure({
                suggestion: {
                    items: ({ query }) => {
                        return allNotes
                            .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
                            .slice(0, 5);
                    },
                },
            }),
            Paragraph.extend({
                addAttributes() {
                    return {
                        extracted: {
                            default: false,
                            keepOnSplit: false,
                            parseHTML: element => element.getAttribute('data-extracted') === 'true',
                            renderHTML: attributes => {
                                if (!attributes.extracted) return {};
                                return { 'data-extracted': 'true' };
                            }
                        },
                    };
                },
            }),
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-sm',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl border-4 border-white shadow-xl max-w-full h-auto my-8 mx-auto block cursor-pointer hover:scale-[1.02] transition-transform',
                },
            }),
            Dropcursor.configure({
                color: '#6366f1',
                width: 2,
            }),
            Gapcursor,
        ],
        content: content || '<p>Start typing your note here...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] max-w-none paper-texture p-4 md:p-10 rounded-b-2xl',
                style: 'font-size: clamp(14px, 2vw, 18px); line-height: 1.6;',
            },
        },
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            onChange(JSON.stringify(json));
        },
    });

    // Handle selection change (External Sync)
    useEffect(() => {
        if (!editor || !content) return;

        // CRITICAL: Only sync if the editor is NOT focused.
        // This prevents the feedback loop during typing.
        if (editor.isFocused) return;

        const currentContent = JSON.stringify(editor.getJSON());
        if (content !== currentContent) {
            try {
                const parsed = typeof content === 'string' ? JSON.parse(content) : content;
                editor.commands.setContent(processContent(parsed), false);
            } catch (e) {
                editor.commands.setContent(content, false);
            }
        }
    }, [content, editor]);

    // Expose editor through ref if needed for toolbar
    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }

        // Handle inline task conversion event
        const handleConvert = async (e) => {
            const { text, pos } = e.detail;
            try {
                // 1. Add task to database
                await dispatch(addTask({
                    title: text,
                    source: 'note',
                    priority: 'Medium',
                    category: 'Extracted'
                })).unwrap();

                // 2. Mark the paragraph as extracted in the editor
                // Use a more robust way to update the node
                editor.view.dispatch(
                    editor.state.tr.setNodeMarkup(pos, undefined, { 
                        ...editor.state.doc.nodeAt(pos).attrs,
                        extracted: true 
                    })
                );
                
                // 3. Simple Alert for feedback (Toast)
                console.log('✅ Task Saved Successfully');
            } catch (err) {
                console.error('Failed to convert task:', err);
            }
        };

        window.addEventListener('convert-to-task', handleConvert);
        return () => window.removeEventListener('convert-to-task', handleConvert);
    }, [editor, editorRef, dispatch]);

    if (!editor) {
        return <div className="p-10 text-center animate-pulse text-gray-400">Loading editor...</div>;
    }

    return (
        <div className="relative rich-text-editor-container">
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
