import { useEffect, useState } from "react";
import api from "../../api.js";
import {
    CheckCircleIcon,
    ClockIcon,
    ListBulletIcon,
    ChevronDownIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import FilterSystem from "./FilterSystem.jsx";
import TaskCard from "./TaskCard.jsx";

// Sotto-componente per le card delle statistiche
function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: "text-blue-600 dark:text-blue-700 bg-blue-100 dark:bg-blue-200",
        green: "text-green-600 dark:text-green-700 bg-green-100 dark:bg-green-200",
        orange: "text-orange-600 dark:text-orange-700 bg-orange-100 dark:bg-orange-200",
        red: "text-red-600 dark:text-red-700 bg-red-100 dark:bg-red-200",
    };

    return (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center gap-5 transition-all">
            <div className={`p-2 rounded-2xl ${colors[color]}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function Dashboard({ isTrashView = false }) {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
    const [filteredTasks, setFilteredTasks] = useState([]);

    const LIMIT = 10;

    useEffect(() => {
        loadTasks(true);
    }, [isTrashView]);

    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    const loadTasks = async (reset = false) => {
        try {
            const currentOffset = reset ? 0 : offset;
            // Aggiungiamo il filtro active basato sulla prop isTrashView
            const response = await api.get(`tasks/?limit=${LIMIT}&offset=${currentOffset}&active=${!isTrashView}`);

            const newTasks = response.data.tasks;
            const total = response.data.total;

            if (reset) {
                setTasks(newTasks);
                setOffset(LIMIT);
            } else {
                setTasks(prev => [...prev, ...newTasks]);
                setOffset(currentOffset + LIMIT);
            }

            setHasMore(response.data.has_more);

            // Statistiche dinamiche
            setStats({
                total: total,
                completed: newTasks.filter(t => t.status === 'completed').length,
                pending: total - newTasks.filter(t => t.status === 'completed').length
            });

        } catch (err) {
            console.error("Errore nel caricamento:", err);
        }

    };

    const handleEmptyTrash = async () => {
        try {
            await api.delete('tasks/?action=empty_trash')
            setTasks([]);
            setStats(prev => ({ ...prev, total: 0 }));
        } catch (err) {
            console.error("Errore svuotamento cestino", err);
        } finally {
            setShowEmptyTrashModal(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* INTESTAZIONE DINAMICA */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {isTrashView ? (
                            <>Il tuo <span className="text-red-500">Cestino</span></>
                        ) : (
                            <>Bentornato, <span className="text-blue-600">{localStorage.getItem('user')}</span></>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isTrashView
                            ? "Le note qui verranno conservate prima dell'eliminazione definitiva."
                            : "Gestione attività e statistiche correnti."}
                    </p>
                </div>
            </header>

            {/* GRIGLIA STATISTICHE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={isTrashView ? "Nel Cestino" : "Totali"}
                    value={stats?.total || 0}
                    icon={isTrashView ? TrashIcon : ListBulletIcon}
                    color={isTrashView ? "red" : "blue"}
                />
                <StatCard title="Completati" value={stats?.completed || 0} icon={CheckCircleIcon} color="green" />
                <StatCard title="In Sospeso" value={stats?.pending || 0} icon={ClockIcon} color="orange" />
            </div>

            {/* LISTA DEI TASK */}
            <section className="space-y-6">
                <header className="flex justify-between items-end">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        {isTrashView ? "Task Eliminate" : "Le tue Task"}
                    </h2>
                    {isTrashView && tasks.length > 0 && (
                        <button
                            onClick={() => setShowEmptyTrashModal(true)}
                            className="mb-1 px-6 py-3 bg-red-200 text-red-600 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                            Svuota Cestino
                        </button>
                    )}
                </header>
                <FilterSystem tasks={tasks}     onFilterChange={(data) => setFilteredTasks(data)}/>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
                    ) : (
                        // Logica per gestire i diversi messaggi di "Vuoto"
                        <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            {
                                (isTrashView && tasks.length === 0) ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <TrashIcon className={'w-40 text-slate-700'}/>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            Il cestino è vuoto
                                        </p>
                                    </div>
                                ) :
                                (
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        {tasks.length === 0 ? "Nessuna task presente" : "Nessun risultato per i filtri selezionati"}
                                    </p>
                                )
                            }

                            {tasks.length === 0 && !isTrashView && (
                                <Link to="task/new" className="inline-block mt-4 text-blue-600 font-black hover:underline decoration-2 underline-offset-4">
                                    CREANE UNA SUBITO
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Tasto Carica altri */}
                {hasMore && (
                    <div className="pt-6 flex justify-center">
                        <button onClick={() => loadTasks(false)} className="cursor-pointer flex items-center gap-2 px-3 py-1 text-slate-500 rounded-2xl font-bold hover:scale-105 transition-all">
                            <ChevronDownIcon className="w-5 h-5 animate-bounce -mb-0.5"/> Carica altri
                        </button>
                    </div>
                )}
            </section>

            {/* Modale di conferma svuotamento cestino */}
            {showEmptyTrashModal && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">

                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">

                        <div className="flex flex-col items-center text-center">
                            {/* Icona Warning Dinamica */}
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                                <TrashIcon className="w-10 h-10 text-red-600" />
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">
                                Svuotare il Cestino?
                            </h3>

                            <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                                Stai per eliminare definitivamente <span className="text-red-600 font-bold">tutte le note</span> presenti nel cestino. Questa azione non può essere annullata in alcun modo.
                            </p>

                            <div className="flex flex-col w-full gap-4">
                                <button
                                    onClick={handleEmptyTrash}
                                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-600/20 active:scale-95 cursor-pointer"
                                >
                                    Sì, elimina tutto per sempre
                                </button>

                                <button
                                    onClick={() => setShowEmptyTrashModal(false)}
                                    className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
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

export default Dashboard;