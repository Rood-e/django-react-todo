import { useEffect, useState } from "react";
import api from "../../api.js";
import {
    CheckCircleIcon,
    ClockIcon,
    ListBulletIcon,
    ChevronDownIcon
} from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";

// Sotto-componente per le card delle statistiche (per non ripetere codice)
function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: "text-blue-600 dark:text-blue-700 bg-blue-100 dark:bg-blue-200",
        green: "text-green-600 dark:text-green-700 bg-green-100 dark:bg-green-200",
        orange: "text-orange-600 dark:text-orange-700 bg-orange-100 dark:bg-orange-200",
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${colors[color]}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}


function Dashboard() {
    // 1. STATI: Dove salviamo i dati
    const [tasks, setTasks] = useState([]);       // La lista dei task
    const [stats, setStats] = useState(null);     // I numeri (totale, completati, ecc.)
    const [offset, setOffset] = useState(0);      // Quanti task abbiamo già saltato
    const [hasMore, setHasMore] = useState(false); // Ci sono altri task sul server?
    const LIMIT = 10;                              // Quanti ne carichiamo per volta

    // 2. FUNZIONE PER CARICARE I DATI
    const loadTasks = async (reset = false) => {
        try {
            // Se reset è true (primo avvio), partiamo da zero, altrimenti usiamo l'offset attuale
            const currentOffset = reset ? 0 : offset;
            const response = await api.get(`tasks/?limit=${LIMIT}&offset=${currentOffset}`);

            const newTasks = response.data.tasks;
            const total = response.data.total;

            if (reset) {
                setTasks(newTasks);
                setOffset(LIMIT); // Prepariamo l'offset per la prossima volta
            } else {
                setTasks([...tasks, ...newTasks]); // Aggiungiamo i nuovi a quelli vecchi
                setOffset(currentOffset + LIMIT);
            }

            setHasMore(response.data.has_more);

            // Calcoliamo le statistiche basandoci sul totale che ci ha dato il server
            setStats({
                total: total,
                completed: newTasks.filter(t => t.status === 'completed').length, // Esempio semplice
                pending: total - newTasks.filter(t => t.status === 'completed').length
            });

        } catch (err) {
            console.error("Errore nel caricamento:", err);
        }
    };

    // 3. AVVIO: Carica i primi 10 appena apri la pagina
    useEffect(() => {
        loadTasks(true);
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* INTESTAZIONE */}
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">
                    Dashboard
                </h1>
                <p className="text-slate-500 font-medium">Gestione attività e statistiche.</p>
            </header>

            {/* GRIGLIA STATISTICHE (I 3 QUADRATI IN ALTO) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Totali" value={stats?.total || 0} icon={ListBulletIcon} color="blue" />
                <StatCard title="Completati" value={stats?.completed || 0} icon={CheckCircleIcon} color="green" />
                <StatCard title="In Sospeso" value={stats?.pending || 0} icon={ClockIcon} color="orange" />
            </div>

            {/* LISTA DEI TASK */}
            <section className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Le tue Task
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tasks.map((task) => (
                        <Link to={`task/${task.id}`} key={task.id}>
                            <div key={task.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-between transition-all shadow-sm dark:shadow-blue-500/30 hover:scale-105">
                                <div className="flex items-center gap-4">
                                    {/* Checkbox basata sullo status del model */}
                                    <input
                                        type="checkbox"
                                        checked={task.status === 'completed'}
                                        readOnly
                                        className="w-6 h-6 rounded-full border-2 border-slate-300 checked:bg-blue-600 cursor-pointer"
                                    />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{task.title}</h3>
                                        <p className="text-xs text-slate-400">Scadenza: {task.due_date || 'Nessuna'}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">
                                {task.status}
                            </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* TASTO CARICA ALTRI (Appare solo se hasMore è vero) */}
                {hasMore && (
                    <div className="pt-6 flex justify-center">
                        <button
                            onClick={() => loadTasks(false)}
                            className="cursor-pointer flex items-center gap-2 px-3 py-1  text-slate-500 rounded-2xl font-bold hover:scale-105 transition-all"
                        >
                            <ChevronDownIcon className="w-5 h-5 animate-bounce -mb-0.5"/> Carica altri
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;