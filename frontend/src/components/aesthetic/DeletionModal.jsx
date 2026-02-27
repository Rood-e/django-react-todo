function DeletionModal({showModal, setShowModal, icon: Icon, action, title = "Sei sicuro?", description = "Questa azione è irreversibile. Tutti i dati verranno persi."}){
    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-30">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-30">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Icon className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-8">{description}</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={action} className="cursor-pointer w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all">Elimina</button>
                            <button onClick={() => setShowModal(false)} className="cursor-pointer w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Annulla</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DeletionModal;