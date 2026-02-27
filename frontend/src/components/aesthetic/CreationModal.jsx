import { useState } from "react";

function CreationModal({ showModal, setShowModal, onSave }) {
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState("#3b82f6");

    const palette = [
        "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
        "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"
    ];

    const internalSave = () => {
        onSave(
            {
                name,
                color: selectedColor
            }
        ).then(() => {
            setName('')
        })
    }

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">

                        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-6">Nuova Categoria</h2>

                        <div className="space-y-6">
                            {/* Input Nome */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nome Categoria</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Es. Lavoro, Spesa..."
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Colore Etichetta</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {palette.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-10 rounded-xl transition-all ${selectedColor === color ? 'ring-4 ring-offset-2 ring-slate-300 dark:ring-slate-600 scale-95' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Azioni */}
                            <div className="flex flex-col gap-3 pt-4">
                                <button onClick={ internalSave }
                                    className="cursor-pointer w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20">
                                    Crea Categoria
                                </button>
                                <button onClick={() => setShowModal(false)} className="cursor-pointer w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreationModal;