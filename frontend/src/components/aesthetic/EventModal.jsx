import {ArrowPathIcon, TrashIcon} from "@heroicons/react/24/outline";

function EventModal({
                        isOpen,
                        onClose,
                        mode = 'edit', // 'edit' (Calendar/Dash), 'trash' (Cestino)
                        editingTaskId,
                        taskForm,
                        setTaskForm,
                        handleSaveTask,
                        handleDeleteTask,   // Per spostare nel cestino
                        handleRestoreTask,  // Per recuperare dal cestino (Punto 4)
                        handlePermanentDelete, // Per eliminazione definitiva (Punto 4)
                        allCategories,
                        toggleCategory,
                        STATUS_OPTIONS,
                        isStatusOpen,
                        setIsStatusOpen,
                        getColorByStatus
                    }) {
    if (!isOpen) return null;

    const isTrashMode = mode === 'trash';

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">

                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <span className={`w-2 h-8 rounded-full ${isTrashMode ? 'bg-red-500' : (editingTaskId ? 'bg-amber-500' : 'bg-blue-600')}`}></span>
                    {isTrashMode ? 'Dettagli Cestino' : (editingTaskId ? 'Modifica Task' : 'Nuova Task')}
                </h2>

                <form onSubmit={handleSaveTask} className="space-y-5">
                    {/* TITOLO */}
                    <input
                        className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 outline-none pb-2 text-slate-900 dark:text-white disabled:opacity-50"
                        placeholder="Titolo..."
                        value={taskForm.title}
                        required
                        disabled={isTrashMode}
                        onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                    />

                    {/* STATO */}
                    <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Stato</label>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 disabled:cursor-not-allowed"
                                type="button" disabled={isTrashMode} onClick={() => setIsStatusOpen(!isStatusOpen)}>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorByStatus(taskForm.status) }}/>
                                <span className="font-bold text-sm uppercase text-slate-700 dark:text-slate-200">
                                    {STATUS_OPTIONS.find(o => o.value === taskForm.status)?.label}
                                </span>
                            </div>
                        </button>
                        {!isTrashMode && isStatusOpen && (
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => { setTaskForm({...taskForm, status: opt.value}); setIsStatusOpen(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col border-b last:border-none border-slate-50 dark:border-slate-700/50">
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

                    {/* CATEGORIE */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Categorie</label>
                        <div className="flex flex-wrap gap-2">
                            {allCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    disabled={isTrashMode}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                        taskForm.category.includes(cat.id)
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                                    } disabled:opacity-50`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SCADENZA */}
                    <input
                        type="date"
                        disabled={isTrashMode}
                        value={taskForm.due_date}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-white disabled:opacity-50"
                        onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                    />

                    {/* AZIONI DINAMICHE */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {isTrashMode ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handlePermanentDelete(editingTaskId)}
                                    className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all"
                                >
                                    <TrashIcon className="w-4 h-4"/> Elimina Definitivamente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRestoreTask(editingTaskId)}
                                    className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20"
                                >
                                    <ArrowPathIcon className="w-4 h-4"/> Ripristina
                                </button>
                            </>
                        ) : (
                            <>
                                {editingTaskId && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTask(editingTaskId)}
                                        className="mr-auto text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                        Sposta nel Cestino
                                    </button>
                                )}
                                <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Annulla</button>
                                <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">Salva</button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventModal