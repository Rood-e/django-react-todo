import { useState, useEffect, useRef } from "react";
import {
    PlusIcon, TrashIcon, CheckIcon,
    CalendarIcon, ChevronDownIcon,
    ArrowLeftIcon, StopIcon, PlayIcon,
    ClockIcon, CheckCircleIcon,
    CloudArrowDownIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
    { value: 'tostart', label: 'Da Iniziare', icon: StopIcon, color: 'text-slate-400', desc: 'Attività non ancora avviata' },
    { value: 'progress', label: 'In Corso', icon: PlayIcon, color: 'text-blue-500', desc: 'Lavoro attualmente attivo' },
    { value: 'pending', label: 'In Sospeso', icon: ClockIcon, color: 'text-amber-500', desc: 'In attesa di altri fattori' },
    { value: 'completed', label: 'Completata', icon: CheckCircleIcon, color: 'text-green-500', desc: 'Task portata a termine' }
];

function ChecklistEditor({ task, isNew, onSave, onDelete, onRestore, isSaving }) {
    const navigate = useNavigate();
    const statusMenuRef = useRef(null);

    const [title, setTitle] = useState(task?.title || "");
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState(task?.status || "tostart");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [items, setItems] = useState(
        task?.content ? JSON.parse(task.content) : [{ id: Date.now(), text: "", checked: false }]
    );

    const isArchived = task?.is_active === false;

    useEffect(() => {
        function handleClickOutside(event) {
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) setIsStatusOpen(false);
       }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleInternalSave = async () => {
        if (isArchived) return;

        const contentPayload = items.length > 0 ? JSON.stringify(items) : "[]";

        await onSave({
            title: title || "Senza titolo", // Evita titoli nulli
            content: contentPayload,
            due_date: dueDate || null,
            status: status
        });
    };

    const handleInternalDelete = async () => {
        setShowDeleteModal(false);
        await onDelete();
    };

    const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

    return (
        <div className="max-w-5xl mx-auto pb-20">
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
            <header className="flex items-center justify-between mb-10 py-6 sticky top-0 bg-transparent z-20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-400" />
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                    {/* Gestione stato task */}
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
                            }}
                        >
                            <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
            {dueDate ? new Date(dueDate).toLocaleDateString('it-IT') : "GG/MM/AAAA"}
        </span>
                            <input
                                type="date"
                                value={dueDate}
                                disabled={isArchived}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="absolute inset-0 opacity-0 disabled:cursor-not-allowed"
                            />
                        </div>
                        <span className="mt-1 ml-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
        Termine Scadenza
    </span>
                    </div>
                </div>

                <div className={'flex '}>
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

            </header>

            <div className="px-4">
                <input type="text" value={title} readOnly={isArchived} placeholder="Titolo della lista..."
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full text-4xl font-black bg-transparent border-none outline-none uppercase transition-all ${isArchived
                        ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:placeholder:text-slate-200 dark:focus:placeholder:text-slate-700'
                    }`}
                />
            </div>

            <div className="mt-12 space-y-4 px-4">
                {items.map((item) => (
                    <div key={item.id}
                        className={`group flex items-center gap-5 p-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-4xl 
                        transition-all ${isArchived ? 'opacity-70' : 'hover:shadow-lg'}`}>
                        {/* Checkbox Button */}
                        <button disabled={isArchived} onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all 
                            ${item.checked ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-100 dark:border-slate-800'} 
                            ${!isArchived && !item.checked ? 'hover:border-blue-500' : ''} ${isArchived ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            {item.checked && <CheckIcon className="w-6 h-6 text-white stroke-4" />}
                        </button>

                        {/* Item Text Input */}
                        <input type="text" value={item.text} readOnly={isArchived} placeholder="Aggiungi un elemento..."
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                            className={`flex-1 bg-transparent border-none outline-none font-bold text-xl ${isArchived ? 'cursor-default' : 'cursor-text'}
                            ${item.checked ? 'line-through text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-200'}`}/>

                        {/* Delete Button */}
                        {!isArchived && (
                            <button
                                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                className="opacity-0 group-hover:opacity-100 p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                ))}

                {!isArchived && (
                    <button
                        onClick={() => setItems([...items, { id: Date.now(), text: "", checked: false }])}
                        className="w-full py-8 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[3rem] flex items-center justify-center gap-4 text-slate-300 dark:text-slate-800 font-black uppercase tracking-[0.4em] text-xs hover:border-blue-500/30 hover:text-blue-500 transition-all cursor-pointer"
                    >
                        <PlusIcon className="w-8 h-8" /> Aggiungi nuova riga
                    </button>
                )}
            </div>
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

export default ChecklistEditor;