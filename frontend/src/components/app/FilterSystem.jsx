import { useState, useEffect, useRef } from "react";
import {
    ArrowsUpDownIcon, CheckIcon, AdjustmentsHorizontalIcon,
    TagIcon, CalendarIcon, Squares2X2Icon, ChevronDownIcon, PencilIcon, TrashIcon
} from "@heroicons/react/24/outline";
import api from "../../api.js";

// Modifica la riga dei parametri della funzione
function FilterSystem({ tasks, onFilterChange, showModal, setShowModal, categories, setCategories, onEdit }) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [timeframe, setTimeframe] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [openMenuId,setOpenMenuId] = useState(null);
    const sortRef = useRef(null);

    const statusLabels = {
        'tostart': 'Da Iniziare',
        'progress': 'In Corso',
        'pending': 'In Sospeso',
        'completed': 'Completate'
    };

    const typeLabels = {
        'note': 'Note',
        'list': 'Checklist'
    };

    const sortLabels = {
        'newest': 'Più Recenti',
        'oldest': 'Meno Recenti',
        'due_date': 'Scadenza'
    };

    useEffect(() => {
        const handleClick = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false); };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        let result = [...tasks];
        if (selectedStatuses.length > 0) result = result.filter(t => selectedStatuses.includes(t.status));
        if (selectedTypes.length > 0) result = result.filter(t => selectedTypes.includes(t.type));
        if (selectedCategories.length > 0) {
            result = result.filter(t => {
                // Se il task non ha categorie, lo escludiamo
                if (!t.categories || !Array.isArray(t.categories)) return false;

                // Trasformiamo gli ID del task in stringhe per il confronto con selectedCategories
                return t.categories.some(catId =>
                    selectedCategories.includes(catId.toString())
                );
            });
        }

        if (timeframe !== 'all') {
            const now = new Date(); now.setHours(0,0,0,0);
            result = result.filter(t => {
                if (!t.due_date) return false;
                const d = new Date(t.due_date); d.setHours(0,0,0,0);
                if (timeframe === 'today') return d.getTime() === now.getTime();
                if (timeframe === 'overdue') return d < now;
                if (timeframe === 'week') {
                    const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
                    return d >= now && d <= nextWeek;
                }
                return true;
            });
        }

        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'due_date') {
                if (!a.due_date) return 1; if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return 0;
        });

        onFilterChange(result);
    }, [selectedStatuses, selectedTypes, selectedCategories, timeframe, sortBy, tasks]);

    const toggle = (val, state, set) => set(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);

    const internalCategoryDelete = async (id) => {
        try {
            await api.delete(`categories/${id}/`);

            setCategories(prev => {
                const newCats = { ...prev };
                delete newCats[id];
                return newCats;
            });
        } catch (error) {
            console.error("Errore eliminazione:", error.response?.data || error.message);
        }
    };

    return (
        <div className="w-full mb-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 
                            ${isAdvancedOpen ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-lg' : 
                                'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                            Filtri Avanzati
                        </button>
                        {/* Categorie */}
                        <button
                            onClick={() => setShowModal(true)}
                            className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 
                                ${showModal? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-lg'
                                : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                            <TagIcon className="w-4 h-4" />
                            Nuova Categoria
                        </button>
                    </div>


                    {(selectedStatuses.length > 0 || selectedTypes.length > 0 || timeframe !== 'all' || selectedCategories.length > 0) && (
                        <button
                            onClick={() => {
                                setSelectedStatuses([]);
                                setSelectedTypes([]);
                                setTimeframe('all');
                                setSelectedCategories([]); // Aggiungi questo
                            }}
                            className="cursor-pointer text-[10px] font-black uppercase text-red-500 px-3 py-2 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-105 active:scale-95"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-all hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowsUpDownIcon className="w-4 h-4" />
                        Ordina
                    </button>
                    {isSortOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                            {Object.keys(sortLabels).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => {setSortBy(opt); setIsSortOpen(false);}}
                                    className={`w-full px-4 py-3 text-left text-[10px] font-black uppercase flex items-center justify-between transition-colors
                                        ${sortBy === opt ? 'bg-slate-50 dark:bg-slate-800 text-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                >
                                    {sortLabels[opt]}
                                    {sortBy === opt && <CheckIcon className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isAdvancedOpen && (
                <div className="relative left-0 p-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in zoom-in duration-200">
                    {/* STATO */}
                    <div className="space-y-4">
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><TagIcon className="w-3 h-3"/> Stato Task</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(statusLabels).map(s => (
                                <button
                                    key={s}
                                    onClick={() => toggle(s, selectedStatuses, setSelectedStatuses)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border-2 transition-all 
                                        ${selectedStatuses.includes(s)
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-900'}`}
                                >
                                    {statusLabels[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TIPO */}
                    <div className="space-y-4">
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><Squares2X2Icon className="w-3 h-3"/> Tipologia</p>
                        <div className="flex gap-2">
                            {Object.keys(typeLabels).map(t => (
                                <button
                                    key={t}
                                    onClick={() => toggle(t, selectedTypes, setSelectedTypes)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border-2 transition-all 
                                        ${selectedTypes.includes(t)
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-purple-400 hover:text-purple-500 dark:hover:border-purple-900'}`}
                                >
                                    {typeLabels[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SCADENZA */}
                    <div className="space-y-4">
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"><CalendarIcon className="w-3 h-3"/> Scadenza</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'Tutto' },
                                { id: 'today', label: 'Oggi' },
                                { id: 'week', label: 'Settimana' },
                                { id: 'overdue', label: 'Scaduti' }
                            ].map(tf => (
                                <button
                                    key={tf.id}
                                    onClick={() => setTimeframe(tf.id)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border-2 transition-all 
                                        ${timeframe === tf.id
                                        ? (tf.id === 'all' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-orange-500 border-orange-500 text-white')
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-orange-400 hover:text-orange-500'}`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sezione Categorie nel Pannello Avanzato */}
                    <div className="col-span-1 md:col-span-3 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <TagIcon className="w-3 h-3"/> Categorie
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(categories).map(([id, cat]) => {
                                const isSelected = selectedCategories.includes(id);

                                return (
                                    <div key={id}
                                        className="relative group flex items-center"
                                        onMouseLeave={() => setOpenMenuId(null)}>
                                        <div style={{
                                                borderColor: cat.color,
                                                backgroundColor: isSelected ? cat.color + "35" : '',
                                                color: cat.color,
                                            }}
                                            className={`px-3 py-1.5 rounded-lg font-black border-2 transition-all flex items-center gap-2 
                                                    ${!isSelected ? 'border-slate-200 dark:border-slate-800 text-slate-400' : ''}`}>
                                            <button className="text-[9px] uppercase hover:brightness-125"
                                                    onClick={() => toggle(id, selectedCategories, setSelectedCategories)}>
                                                {cat.name}
                                            </button>

                                            <div className="relative">
                                                <ChevronDownIcon
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === id ? null : id);
                                                    }}
                                                    strokeWidth={5}
                                                    className="w-2.5 hidden group-hover:block hover:brightness-150 cursor-pointer transition-all"
                                                />

                                                {openMenuId === id && (
                                                    <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-xl z-[60] py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation(); onEdit(id);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-[9px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                                        >
                                                            <PencilIcon className="w-3 h-3"/> Modifica
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); internalCategoryDelete(id); }}
                                                            className="w-full px-3 py-2 text-left text-[9px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                                                        >
                                                            <TrashIcon className="w-3 h-3"/> Elimina
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilterSystem;