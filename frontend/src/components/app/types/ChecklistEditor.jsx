import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";

function ChecklistEditor({ initialContent, onChange, isArchived }) {

    // Funzione helper sicura per il parsing del JSON
    const parseInitialContent = (content) => {
        if (!content || content === "<p></p>" || content.trim() === "") {
            return [{ id: Date.now(), text: "", checked: false }];
        }
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : [{ id: Date.now(), text: "", checked: false }];
        } catch (e) {
            console.warn("Rilevato contenuto non JSON nella checklist, resetto a riga vuota:", e);
            return [{ id: Date.now(), text: "", checked: false }];
        }
    };

    // Usiamo lo stato locale alimentato dal parse sicuro
    const [items, setItems] = useState(() => parseInitialContent(initialContent));

    // Sincronizza lo stato locale se il contenuto del padre cambia (es. quando carichi una task esistente)
    useEffect(() => {
        setItems(parseInitialContent(initialContent));
    }, [initialContent]);

    // Funzione interna per aggiornare gli item e notificare il padre
    const updateItems = (newItems) => {
        setItems(newItems); // Aggiorna lo stato locale immediatamente
        onChange(JSON.stringify(newItems)); // Invia la stringa JSON pulita al padre
    };

    return (
        <div className="mt-12 space-y-4 px-4">
            {/* Il resto del tuo return (items.map, input, bottoni) rimane identico al 100% */}
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