import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api.js";

import { InformationCircleIcon, PencilSquareIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

// Sotto-componenti
import NoteEditor from "./types/NoteEditor.jsx";
import ChecklistEditor from "./types/ChecklistEditor.jsx";

function TypeCard({ title, desc, icon: Icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-64 p-8 rounded-[3rem] transition-all duration-300 group flex flex-col items-center text-center
                bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500
                hover:-translate-y-2
                
                /* Ombra Light Mode (Nera/Grigia) */
                shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                
                /* Ombra Dark Mode (Azzurro/Glow) */
                dark:shadow-[0_20px_50px_rgba(59,130,246,0.1)] 
                dark:hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)]`}
        >
            <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                {desc}
            </p>
        </button>
    );
}

function TaskDetail() {
    const { id } = useParams();
    const isNew = id === 'new';

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        if (!isNew) {
            const fetchTask = async () => {
                try {
                    const res = await api.get(`tasks/${id}/`);
                    setTask(res.data);
                } catch (err) {
                    console.error("Task non trovata");
                } finally {
                    setLoading(false);
                }
            };
            fetchTask();
        }
    }, [id, isNew]);

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (isNew && !selectedType) {
        return (
            /* h-[calc(100vh-160px)] calcola l'altezza disponibile togliendo header/padding per centrare perfettamente */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
                    Seleziona tipologia
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                    <TypeCard
                        title="Nota"
                        desc="Testo libero e appunti"
                        icon={PencilSquareIcon}
                        onClick={() => setSelectedType('note')}
                    />
                    <TypeCard
                        title="Lista"
                        desc="Checklist e spesa"
                        icon={ShoppingCartIcon}
                        onClick={() => setSelectedType('list')}
                    />
                </div>

                {/* Banner info con stile dark migliorato */}
                <div className="mt-12 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 shrink-0" />
                        <span>Per scadenze e appuntamenti, usa la sezione Calendario.</span>
                    </p>
                </div>
            </div>
        );
    }

    const type = isNew ? selectedType : task?.type;

    return (
        /* Centratura anche per gli editor se sono brevi */
        <div className={'-mt-4'}>
            {type === 'note' && <NoteEditor task={task} isNew={isNew} />}
            {type === 'list' && <ChecklistEditor task={task} isNew={isNew} />}
        </div>
    );
}

export default TaskDetail;