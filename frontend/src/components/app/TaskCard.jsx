import {ArrowPathIcon, DocumentTextIcon, ListBulletIcon, TrashIcon, CalendarIcon} from "@heroicons/react/24/outline";

function TaskCard({ task, isTrashView, categoriesMap, handleTaskClick }) {
    // --- LOGICA DI VISUALIZZAZIONE ---
    // Determina se la task ha superato la data di scadenza (ignorando l'ora)
    const isOverdue = task.due_date && new Date(task.due_date) < new Date().setHours(0,0,0,0);
    const hasDueDate = !!task.due_date;

    return (
        <div onClick={() => handleTaskClick(task)} className="cursor-pointer block group">
            {/* Il container usa 'group' per attivare effetti sui figli al passaggio del mouse */}
            <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border-b-4 hover:border-blue-500">
                <div className="flex items-center gap-4">
                    {/* Icona variabile: cambia in base al tipo (Nota, Lista, Evento) o stato Cestino */}
                    <div className={`p-2 rounded-xl ${isTrashView ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        {isTrashView ? (
                            <TrashIcon className="w-5 h-5 text-red-500" />
                        ) : (
                            task.type === 'note' ?
                                <DocumentTextIcon className="w-5 h-5 text-blue-500" /> :
                            task.type === 'list' ?
                                <ListBulletIcon className="w-5 h-5 text-blue-500"/>:
                                <CalendarIcon className="w-5 h-5 text-blue-500"/>
                        )}
                    </div>
                    <div>
                        {/* TITOLO */}
                        <h3 className={`font-bold text-slate-900 dark:text-white transition-colors ${isTrashView ? 'group-hover:text-red-500' : 'group-hover:text-blue-600'}`}>
                            {task.title || "Senza titolo"}
                        </h3>

                        {/* Riga Metadati: Gestione della scadenza con alert visivo se scaduta */}
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            {hasDueDate ? (
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter ${isOverdue && task.status !== 'completed' ? 'text-red-500' : 'text-slate-400'}`}>
                                    <CalendarIcon className="w-3 h-3" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                </div>
                            ):(
                                <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-slate-400`}>
                                    <CalendarIcon className="w-3 h-3" />
                                    Nessuna scadenza
                                </div>
                            )}


                            {/* Mapping delle Categorie: Trasforma gli ID ricevuti dal server in Badge colorati */}
                            <div className="flex flex-wrap gap-1">
                                {task.categories && task.categories.length > 0 ? (
                                    task.categories.map(catId => {
                                        const category = categoriesMap[catId];
                                        if (!category) return null;
                                        return (
                                            <span
                                                key={catId}
                                                style={{
                                                    color: category.color,
                                                    borderColor: category.color,
                                                    backgroundColor: `${category.color}10`
                                                }}
                                                className="px-2 py-0.5 border text-[8px] font-black uppercase rounded-md tracking-tighter"
                                            >
                                                {category.name}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-tighter">
                                        Nessuna Categoria
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="mt-1 text-[9px] text-slate-400 font-medium uppercase tracking-widest opacity-60">
                            {isTrashView ? "Sola lettura" : `Modificato: ${new Date(task.updated_at).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                {/* Status Badge: Traduzione degli slug del backend in etichette user-friendly */}
                <div className="flex items-center gap-3">
                    {
                        isTrashView && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1 bg-amber-100 text-amber-600 dark:bg-amber-900/30 rounded-full">
                                <ArrowPathIcon className="w-3 h-3" /> Cestinato
                            </span>
                        )
                    }
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full 
                        ${  
                            task.status === 'completed'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                        {
                            task.status === 'tostart' ? 'Da Iniziare' :
                            task.status === 'progress' ? 'In Corso' :
                            task.status === 'pending' ? 'In Sospeso' :
                            task.status === 'completed' ? 'Completata' : task.status
                        }
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TaskCard;