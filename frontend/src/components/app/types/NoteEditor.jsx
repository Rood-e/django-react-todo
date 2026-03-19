import {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {
    ArrowLeftIcon, ChevronDownIcon, CheckCircleIcon, ClockIcon,
    PlayIcon, StopIcon, ChevronUpIcon, BoldIcon, ItalicIcon,
    HashtagIcon, ListBulletIcon, CloudArrowDownIcon,
    Bars3BottomLeftIcon, TrashIcon, CalendarIcon
} from "@heroicons/react/24/outline";
import DeletionModal from "../../aesthetic/DeletionModal.jsx";

/*
 * Editor per le Note basato su Tiptap.
 * Gestisce contenuti HTML complessi (H1, H2, liste, citazioni).
 */
function NoteEditor({ task, isNew, onSave, onDelete, onRestore, isSaving, categories }) {
    const navigate = useNavigate();
    const statusMenuRef = useRef(null);
    const dateMenuRef = useRef(null);
    const catMenuRef = useRef(null);

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState("pending");
    const [selectedCatIds, setSelectedCatIds] = useState([]);

    const [showToolbar, setShowToolbar] = useState(true);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isArchived = task?.is_active === false;

    // Inizializzazione dell'istanza dell'editor
    const editor = useEditor({
        editable: !isArchived, // Disabilita l'editing se la nota è nel cestino
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: true,
                orderedList: true,
            }),
        ],
        content: "", // Il contenuto viene iniettato successivamente dall'useEffect
        editorProps: {
            attributes: {
                // Classi Tailwind per lo styling del contenuto generato dall'editor
                class: 'outline-none prose prose-slate dark:prose-invert max-w-none text-xl min-h-[500px] leading-relaxed cursor-text p-10',
            },
        },
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) setIsStatusOpen(false);
            if (catMenuRef.current && !catMenuRef.current.contains(event.target)) setIsCatMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effetto per caricare i dati della task nell'editor e negli stati locali
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setStatus(task.status || "pending");
            setDueDate(task.due_date || "");
            setSelectedCatIds(task.categories ? task.categories.map(id => id.toString()) : []);
            if (editor && task.content !== editor.getHTML()) {
                editor.commands.setContent(task.content || "");
            }
        }
    }, [task, editor]);

    const STATUS_OPTIONS = [
        { value: 'tostart', label: 'Da Iniziare', icon: StopIcon, color: 'text-slate-400', desc: 'Attività non ancora avviata' },
        { value: 'progress', label: 'In Corso', icon: PlayIcon, color: 'text-blue-500', desc: 'Lavoro attualmente attivo' },
        { value: 'pending', label: 'In Sospeso', icon: ClockIcon, color: 'text-amber-500', desc: 'In attesa di altri fattori' },
        { value: 'completed', label: 'Completata', icon: CheckCircleIcon, color: 'text-green-500', desc: 'Task portata a termine' }
    ];

    const currentStatus = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

    const toggleCategory = (id) => {
        setSelectedCatIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleInternalSave = async () => {
        if (!editor || isArchived) return;
        await onSave({
            title,
            content: editor.getHTML(), // Estrazione del contenuto formattato come stringa HTML pronta per il database
            due_date: dueDate || null,
            status,
            categories: selectedCatIds
        });
    };

    const handleInternalDelete = async () => {
        setShowDeleteModal(false);
        await onDelete();
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            {/* Override CSS per Tiptap: Forza lo stile delle liste e dei titoli
                che altrimenti verrebbero resettati dai default di Tailwind */}
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

                        <div className="flex flex-col flex-1">
                            <input
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                disabled={isArchived}
                                placeholder="Titolo Documento..."
                                className="bg-transparent text-3xl font-black outline-none text-slate-900 dark:text-white w-full tracking-tighter"
                            />

                            {/* AREA CATEGORIE */}
                            <div className="flex items-center gap-2 mt-3 h-8" ref={catMenuRef}>
                                {!isArchived && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsCatMenuOpen(!isCatMenuOpen);
                                            }}
                                            className={`w-7 h-7 flex items-center justify-center rounded-full border-2 border-dashed transition-all cursor-pointer z-20
                                                ${isCatMenuOpen ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-500'}`}
                                        >
                                            <HashtagIcon className="w-3.5 h-3.5" />
                                        </button>

                                        {isCatMenuOpen && (
                                            <div className="absolute top-full left-0 mt-3 w-60 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-2xl z-100 py-2 animate-in fade-in slide-in-from-top-2">
                                                <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Seleziona Categorie</p>
                                                <div className="max-h-48 overflow-y-auto px-2 custom-scrollbar">
                                                    {Object.entries(categories).map(([id, cat]) => (
                                                        <button
                                                            key={id}
                                                            onClick={() => toggleCategory(id)}
                                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                                                <span className={selectedCatIds.includes(id.toString()) ? "text-blue-500" : "text-slate-600 dark:text-slate-400"}>{cat.name}</span>
                                                            </div>
                                                            {selectedCatIds.includes(id.toString()) && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedCatIds.map(id => {
                                    const cat = categories[id];
                                    if (!cat) return null;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => toggleCategory(id)}
                                            className="px-3 py-1 rounded-full text-[8px] font-black uppercase border-2 transition-all hover:brightness-110 active:scale-95"
                                            style={{ borderColor: cat.color, color: cat.color, backgroundColor: cat.color + '15' }}
                                        >
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6" ref={statusMenuRef}>
                        <div className="relative flex flex-col" ref={statusMenuRef}>
                            <button
                                disabled={isArchived}
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                className={`flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
                                ${isArchived
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:border-blue-500 cursor-pointer'
                                    }`}>
                                <currentStatus.icon className={`w-4 h-4 ${currentStatus.color}`} />
                                {currentStatus.label}
                                {!isArchived && <ChevronDownIcon className="w-3 h-3 text-slate-400" />}
                            </button>

                            <span className="mt-1 ml-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                Stato Attuale
                            </span>

                            {isStatusOpen && !isArchived && (
                                <div className="absolute top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setStatus(opt.value);
                                                setIsStatusOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b last:border-none border-slate-50 dark:border-slate-700/50 flex flex-col"
                                        >
                                            <div className="flex items-center gap-2">
                                                <opt.icon className={`w-4 h-4 ${opt.color}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-medium ml-6">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scadenza */}
                        <div className="flex flex-col group">
                            <div
                                className={`relative flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-all overflow-hidden
                                ${isArchived
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:border-blue-500 cursor-pointer'
                                }`}
                                onClick={(e) => {
                                    if (isArchived) return;
                                    e.currentTarget.querySelector('input').showPicker();
                                }}>
                                <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                    {dueDate ? new Date(dueDate).toLocaleDateString('it-IT') : "GG/MM/AAAA"}
                                </span>
                                <input type="date" value={dueDate} disabled={isArchived}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 disabled:cursor-not-allowed"/>
                            </div>
                            <span className="mt-1 ml-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                Termine Scadenza
                            </span>
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


            <DeletionModal  showModal={showDeleteModal} setShowModal={setShowDeleteModal}
                            icon={TrashIcon} action={handleInternalDelete} title={isArchived ? "Elimina Definitivamente" : "Sposta nel Cestino"}
                            description={isArchived ? "Questa azione è irreversibile. La nota verrà rimossa permanentemente."
                                : "La nota non sarà più visibile nella dashboard principale, ma potrai ripristinarla dal cestino."}/>
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