import { useState, useEffect } from "react";
import api from "../../../api.js";
import { useNavigate } from "react-router-dom";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
    ArrowLeftIcon, ChevronDownIcon, CheckCircleIcon, ClockIcon,
    PlayIcon, StopIcon, ChevronUpIcon, BoldIcon, ItalicIcon,
    HashtagIcon, ListBulletIcon, CloudArrowDownIcon,
    Bars3BottomLeftIcon
} from "@heroicons/react/24/outline";

function NoteEditor({ task, isNew }) {
    console.log("Dati Task ricevuti:", task);
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("pending");
    const [isSaving, setIsSaving] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const editor = useEditor({
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

    // SINCRONIZZAZIONE DATI: Aggiorna l'editor e gli stati quando 'task' cambia
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

    const currentStatus = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[2];

    const handleSave = async () => {
        if (!editor) return;
        setIsSaving(true);
        try {
            const payload = { title, content: editor.getHTML(), status, type: 'note' };

            if (isNew) {
                const res = await api.post("tasks/", payload);
                navigate(`/app/task/${res.data.id}`, { replace: true });
            } else {
                await api.put(`tasks/${task.id}/`, payload);
            }
        } finally {
            setIsSaving(false);
        }
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

            <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-50">
                <div className="flex items-center justify-between px-10 py-6">
                    <div className="flex items-center gap-8 flex-1">
                        <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 cursor-pointer transition-colors">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titolo Documento..."
                            className="bg-transparent text-3xl font-black outline-none text-slate-900 dark:text-white w-full tracking-tighter"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between w-52 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest dark:text-white">
                                    <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
                                    {currentStatus.label}
                                </div>
                                <ChevronDownIcon className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-1 z-60">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button key={opt.value} onClick={() => { setStatus(opt.value); setIsDropdownOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left cursor-pointer">
                                            <opt.icon className={`w-4 h-4 ${opt.color}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-300">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleSave} className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer">
                            {isSaving ? "..." : <><CloudArrowDownIcon className="w-5 h-5"/> Salva</>}
                        </button>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showToolbar ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                        <button onClick={() => setShowToolbar(false)} className="p-2 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"><ChevronUpIcon className="w-4 h-4" /></button>
                    </div>
                </div>

                {!showToolbar && (
                    <div className="flex justify-center">
                        <button onClick={() => setShowToolbar(true)} className="px-10 py-1 bg-slate-100 dark:bg-slate-800 rounded-b-xl text-[8px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-[0.3em] cursor-pointer transition-all border-x border-b border-slate-200 dark:border-slate-700 hover:py-2">
                            Apri Menù Strumenti
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                <div className="max-w-5xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </main>
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