import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";

function ChecklistEditor({ initialContent, onChange, isArchived }) {
    // Trasformiamo la stringa JSON in arrivo dal padre in un array di oggetti
    // Se non c'è contenuto, partiamo con una riga vuota
    const items = initialContent ? JSON.parse(initialContent) : [{ id: Date.now(), text: "", checked: false }];

    // Funzione interna per aggiornare gli item e notificare il padre
    const updateItems = (newItems) => {
        // Notifichiamo il padre inviando la stringa JSON aggiornata
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="mt-12 space-y-4 px-4">
            {items.map((item) => (
                <div key={item.id}
                     className={`group flex items-center gap-5 p-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-4xl transition-all ${isArchived ? 'opacity-70' : 'hover:shadow-lg'}`}>

                    {/* Checkbox */}
                    <button
                        disabled={isArchived}
                        onClick={() => updateItems(items.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))}
                        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all 
                        ${item.checked ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-100 dark:border-slate-800'} 
                        ${!isArchived && !item.checked ? 'hover:border-blue-500' : ''} cursor-pointer`}>
                        {item.checked && <CheckIcon className="w-6 h-6 text-white stroke-4" />}
                    </button>

                    {/* Input Testo */}
                    <input
                        type="text"
                        value={item.text}
                        readOnly={isArchived}
                        placeholder="Aggiungi un elemento..."
                        onChange={(e) => updateItems(items.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                        className={`flex-1 bg-transparent border-none outline-none font-bold text-xl ${item.checked ? 'line-through text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-200'}`}
                    />

                    {/* Bottone Elimina riga */}
                    {!isArchived && (
                        <button
                            onClick={() => updateItems(items.filter(i => i.id !== item.id))}
                            className="opacity-0 group-hover:opacity-100 p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                        >
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            ))}

            {/* Bottone Aggiungi riga */}
            {!isArchived && (
                <button
                    onClick={() => updateItems([...items, { id: Date.now(), text: "", checked: false }])}
                    className="w-full py-8 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[3rem] flex items-center justify-center gap-4 text-slate-300 dark:text-slate-800 font-black uppercase tracking-[0.4em] text-xs hover:border-blue-500/30 hover:text-blue-500 transition-all cursor-pointer"
                >
                    <PlusIcon className="w-8 h-8" /> Aggiungi nuova riga
                </button>
            )}
        </div>
    );
}

export default ChecklistEditor;