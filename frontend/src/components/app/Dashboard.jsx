import { useEffect, useState } from "react";
import api from "../../api.js";
import {CheckCircleIcon, ClockIcon, ListBulletIcon, TrashIcon } from "@heroicons/react/24/outline";
import {Link, useNavigate, useOutletContext} from "react-router-dom";
import FilterSystem from "./FilterSystem.jsx";
import TaskCard from "./TaskCard.jsx";

import DeletionModal from "../aesthetic/DeletionModal.jsx";
import CreationModal from "../aesthetic/CreationModal.jsx";
import EventModal from "../aesthetic/EventModal.jsx";

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

/*
    TODO: Impaginazione(gestione della visualizzazione delle task in modo che non ne appaiono 7000)
*/

function Dashboard({ isTrashView = false }) {
    const { appTasks, setAppTasks } = useOutletContext();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState({});
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);

    const [showCategoryCreationModal, setshowCategoryCreationModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleEditCategory = (id) => {
        setEditingCategory({ id, ...categoriesMap[id] });
        setshowCategoryCreationModal(true);
    };

    useEffect(() => {
        const initDashboard = () => {
            if (!appTasks) return;

            setLoading(true);

            try {
                const allTasks = appTasks.filter(task => task.is_active === !isTrashView);

                setTasks(allTasks);
                setFilteredTasks(allTasks);

                // Calcolo statistiche locale
                setStats({
                    total: allTasks.length,
                    completed: allTasks.filter(t => t.status === 'completed').length,
                    pending: allTasks.filter(t => t.status !== 'completed').length
                });

            } catch (err) {
                console.error("Errore inizializzazione Dashboard:", err);
            } finally {
                setLoading(false);
            }
        }

        initDashboard();
    }, [isTrashView,appTasks]);

    // Caricamento categorie
    useEffect(() => {
        const initCats = async () => {
            try {
                const catRes = await api.get('categories/');

                // Creiamo la mappa delle categorie [ID]: {dati}
                const map = {};
                catRes.data.forEach(cat => {
                    map[cat.id] = { name: cat.name, color: cat.color };
                });
                setCategoriesMap(map);
            } catch (err) {}
        }

        initCats();
    },[]);


    const handleEmptyTrash = async () => {
        try {
            await api.delete('tasks/?action=empty_trash')
            setTasks([]);
            setFilteredTasks([]);
            setAppTasks(prevTasks => prevTasks.filter(t => t.is_active === true));
            setStats({ total: 0, completed: 0, pending: 0 });
        } catch (err) {
            console.error("Errore svuotamento cestino", err);
        } finally {
            setShowEmptyTrashModal(false);
        }
    };

    const onSaveCategory = async (payload) => {
        try {
            if (payload.id) {
                // UPDATE
                await api.put(`categories/${payload.id}/`, payload);
                setCategoriesMap(prev => ({
                    ...prev,
                    [payload.id]: { name: payload.name, color: payload.color }
                }));
            } else {
                // CREATE
                const res = await api.post("categories/", payload);
                setCategoriesMap(prev => ({
                    ...prev,
                    [res.data.id]: { name: res.data.name, color: res.data.color }
                }));
            }
            setEditingCategory(null);
        } catch (err) {
            console.error(err);
        } finally {
            setshowCategoryCreationModal(false);
        }
    };

    // Stati per il modale multitask
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false); // Per il dropdown interno al modale
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        category: [],
        status: 'tostart',
        due_date: new Date().toISOString().split('T')[0]
    });

    // Helper per i colori (stessa logica del calendario)
    const STATUS_OPTIONS = [
        { value: 'tostart', label: 'Da Iniziare', icon: ClockIcon, color: 'text-slate-400', hex: '#94a3b8', desc: 'Attività non ancora avviata' },
        { value: 'progress', label: 'In Corso', icon: ClockIcon, color: 'text-blue-500', hex: '#3b82f6', desc: 'Lavoro attualmente attivo' },
        { value: 'pending', label: 'In Sospeso', icon: ClockIcon, color: 'text-amber-500', hex: '#f59e0b', desc: 'In attesa di altri fattori' },
        { value: 'completed', label: 'Completata', icon: CheckCircleIcon, color: 'text-green-500', hex: '#22c55e', desc: 'Task portata a termine' }
    ];

    const getColorByStatus = (statusValue) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === statusValue);
        return option ? option.hex : '#94a3b8';
    };

    // Apertura Modale al click sulla TaskCard se evento, altrimenti reindirizzamento
    const handleTaskClick = (task) => {
        if (task.type === 'note' || task.type === 'checklist') {
            navigate(`/app/task/${task.id}`);
        } else {
            setEditingTaskId(task.id);
            setTaskForm({
                title: task.title || '',
                category: task.categories || [],
                status: task.status || 'tostart',
                due_date: task.due_date || new Date().toISOString().split('T')[0]
            });
            setIsEventModalOpen(true);
        }
    };

    // Modifica eventi
    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...taskForm, categories: taskForm.category };
            await api.put(`tasks/${editingTaskId}/`, payload);

            // Aggiornamento locale manuale
            setAppTasks(prev => prev.map(t => {
                if (t.id === editingTaskId) {
                    return {
                        ...t,
                        title: taskForm.title,
                        status: taskForm.status,
                        due_date: taskForm.due_date,
                        categories: taskForm.category
                    };
                }
                return t;
            }));

            setIsEventModalOpen(false);
        } catch (err) { console.error("Errore nel salvataggio:", err); }
    };

    // Eliminazione/spostamento nel cestino di eventi
    const handleToggleTrash = async (id, shouldActive) => {
        try {
            await api.delete(`tasks/${id}/`);
            setAppTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: shouldActive } : t));
            setIsEventModalOpen(false);
        } catch (err) { console.error(err); }
    };

    // Ripristino eventi dal cestino
    const handleRestoreTask = async (id) => {
        try {
            await api.put(`tasks/${id}/`, { action: 'restore' });
            setAppTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: true } : t));
            setIsEventModalOpen(false);
        } catch (err) { console.error(err); }
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

                {/* Filtri Avanzati */}
                {!loading && (
                    <FilterSystem
                        tasks={tasks}
                        onFilterChange={setFilteredTasks}
                        showModal={showCategoryCreationModal}
                        setShowModal={setshowCategoryCreationModal}
                        categories={categoriesMap}
                        setCategories={setCategoriesMap}
                        onEdit={handleEditCategory}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <div key={task.id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                                <TaskCard task={task} categoriesMap={categoriesMap} handleTaskClick={handleTaskClick} />
                            </div>
                        ))
                    ) : (
                        // Logica per gestire i diversi messaggi di "Vuoto"
                        <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            {!loading && (
                                <>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        {tasks.length === 0 ? "Nessuna task presente" : "Nessun risultato per i filtri selezionati"}
                                    </p>
                                    {tasks.length === 0 && !isTrashView && (
                                        <Link to="task/new" className="inline-block mt-4 text-blue-600 font-black hover:underline decoration-2 underline-offset-4">
                                            CREANE UNA SUBITO
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>


            <DeletionModal  showModal={showEmptyTrashModal} setShowModal={setShowEmptyTrashModal}
                            icon={TrashIcon} action={handleEmptyTrash} description={`Stai per eliminare definitivamente tutte le note presenti nel cestino. Questa azione non può essere annullata in alcun modo.`}
                            title={'Svuotare il cestino?'}/>

            <CreationModal
                showModal={showCategoryCreationModal}
                setShowModal={(val) => {
                    setshowCategoryCreationModal(val);
                    if(!val) setEditingCategory(null); // Resetta se chiudi il modale
                }}
                onSave={onSaveCategory}
                editingCategory={editingCategory}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                mode={isTrashView ? 'trash' : 'edit'}
                editingTaskId={editingTaskId}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                handleSaveTask={handleSaveTask}
                handleDeleteTask={(id) => handleToggleTrash(id,false)}
                handleRestoreTask={handleRestoreTask}
                allCategories={Object.entries(categoriesMap).map(([id, data]) => ({
                    id: parseInt(id),
                    ...data
                }))}
                toggleCategory={(catId) => {
                    setTaskForm(prev => ({
                        ...prev,
                        category: prev.category.includes(catId)
                            ? prev.category.filter(id => id !== catId)
                            : [...prev.category, catId]
                    }));
                }}
                STATUS_OPTIONS={STATUS_OPTIONS}
                isStatusOpen={isStatusOpen}
                setIsStatusOpen={setIsStatusOpen}
                getColorByStatus={getColorByStatus}
            />
        </div>
    );
}

export default Dashboard;