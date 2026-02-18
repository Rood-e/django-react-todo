import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
    ArrowLeftIcon, ChevronDownIcon, CheckCircleIcon, ClockIcon,
    PlayIcon, StopIcon, ChevronUpIcon, BoldIcon, ItalicIcon,
    HashtagIcon, ListBulletIcon, CloudArrowDownIcon,
    Bars3BottomLeftIcon
} from "@heroicons/react/24/outline";

function NoteEditor({ task, isNew, onSave, onDelete, onRestore, isSaving }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("pending");
    const [showToolbar, setShowToolbar] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Correzione riferimento is_active (backend usa snake_case)
    const isArchived = task?.is_active === false;

    const editor = useEditor({
        editable: !isArchived, // Disabilita editing se archiviata
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: true,
                orderedList: true,
            }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-slate dark:prose-invert max-w-none text-xl min-h-[500px] leading-relaxed cursor-text p-10',
            },
        },
    });

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setStatus(task.status || "pending");
            if (editor && task.content !== editor.getHTML()) {
                editor.commands.setContent(task.content || "");
            }
        }
    }, [task, editor]);

    const STATUS_OPTIONS = [
        { value: 'tostart', label: 'Da Iniziare', icon: StopIcon, color: 'text-slate-400' },
        { value: 'progress', label: 'In Corso', icon: PlayIcon, color: 'text-blue-500' },
        { value: 'pending', label: 'In Sospeso', icon: ClockIcon, color: 'text-amber-500' },
        { value: 'completed', label: 'Completata', icon: CheckCircleIcon, color: 'text-green-500' }
    ];

    const currentStatus = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

    const handleInternalSave = async () => {
        if (!editor || isArchived) return;
        await onSave({ title, content: editor.getHTML(), status });
    };

    const handleInternalDelete = async () => {
        setShowDeleteModal(false);
        await onDelete();
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <style>{`
                .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5em !important; }
                .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5em !important; }
                .ProseMirror h1 { font-size: 2.5rem !important; font-weight: 800 !important; margin-bottom: 1rem !important; }
                .ProseMirror h2 { font-size: 1.8rem !important; font-weight: 700 !important; margin-bottom: 0.8rem !important; }
                .ProseMirror blockquote { border-left: 4px solid #3b82f6 !important; padding-left: 1rem !important; font-style: italic !important; }
                .ProseMirror pre { background: #1e293b !important; color: #e2e8f0 !important; padding: 1.5rem !important; border-radius: 1rem !important; font-family: monospace !important; margin: 1rem 0 !important; }
                .dark .ProseMirror pre { background: #0f172a !important; border: 1px solid #1e293b !important; }
            `}</style>

            {/* BANNER CESTINO */}
            {isArchived && (
                <div className="flex-none bg-amber-100 dark:bg-amber-500/20 border-b border-amber-100 dark:border-amber-900/30 p-4 flex justify-center items-center gap-8 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                        <TrashIcon className="w-5 h-5 text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Nota nel Cestino</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onRestore} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            Ripristina
                        </button>
                        <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            Elimina Definitivamente
                        </button>
                    </div>
                </div>
            )}

            <header className={`flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-50 transition-opacity ${isArchived ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between px-10 py-6">
                    <div className="flex items-center gap-8 flex-1">
                        <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 cursor-pointer">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            disabled={isArchived}
                            placeholder="Titolo Documento..."
                            className="bg-transparent text-3xl font-black outline-none text-slate-900 dark:text-white w-full tracking-tighter disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                disabled={isArchived}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-52 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest dark:text-white">
                                    <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
                                    {currentStatus.label}
                                </div>
                                <ChevronDownIcon className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-1 z-60">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button key={opt.value} onClick={() => { setStatus(opt.value); setIsDropdownOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-left cursor-pointer">
                                            <opt.icon className={`w-4 h-4 ${opt.color}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-300">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isNew && !isArchived && (
                            <button onClick={() => setShowDeleteModal(true)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer">
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        )}

                        {!isArchived && (
                            <button onClick={handleInternalSave} className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer">
                                {isSaving ? "..." : <><CloudArrowDownIcon className="w-5 h-5"/> Salva</>}
                            </button>
                        )}
                    </div>
                </div>

                {showToolbar && !isArchived && (
                    <div className="flex items-center justify-between px-10 py-3 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <ToolButton icon={BoldIcon} label="B" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
                            <ToolButton icon={ItalicIcon} label="I" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
                            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${editor.isActive('underline') ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-700'}`}><u>U</u></button>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                            <ToolButton icon={HashtagIcon} label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} />
                            <ToolButton icon={HashtagIcon} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                            <ToolButton icon={ListBulletIcon} label="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
                            <ToolButton icon={Bars3BottomLeftIcon} label="Citazione" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
                        </div>
                        <button onClick={() => setShowToolbar(false)} className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"><ChevronUpIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </header>

            <main className={`flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar ${isArchived ? 'pointer-events-none select-none' : ''}`}>
                <div className="max-w-5xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </main>

            {/* MODALE CONFERMA ELIMINAZIONE */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
                                <TrashIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                                {isArchived ? "Elimina Definitivamente" : "Sposta nel Cestino"}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                {isArchived
                                    ? "Questa azione è irreversibile. La nota verrà rimossa permanentemente."
                                    : "La nota non sarà più visibile nella dashboard principale, ma potrai ripristinarla dal cestino."}
                            </p>
                            <div className="flex flex-col w-full gap-3">
                                <button onClick={handleInternalDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 cursor-pointer">
                                    Conferma
                                </button>
                                <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all cursor-pointer">
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolButton({ icon: Icon, label, onClick, active }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${active ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'border-transparent hover:bg-white dark:hover:bg-slate-700 text-slate-400'}`}>
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
        </button>
    );
}

export default NoteEditor;