import { useState } from "react";
import api from "../../../api.js";
import { useNavigate } from "react-router-dom";
import { PlusIcon, XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

function ChecklistEditor({ task, isNew }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(task?.title || "");
    // Se il task esiste, parse del JSON in content, altrimenti array vuoto
    const [items, setItems] = useState(() => {
        try {
            return task?.content ? JSON.parse(task.content) : [];
        } catch { return []; }
    });
    const [newItem, setNewItem] = useState("");

    const addItem = () => {
        if (!newItem.trim()) return;
        setItems([...items, { id: Date.now(), text: newItem, checked: false }]);
        setNewItem("");
    };

    const toggleItem = (id) => {
        setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        const payload = {
            title,
            content: JSON.stringify(items),
            task_type: 'list'
        };
        try {
            if (isNew) await api.post("tasks/", payload);
            else await api.put(`tasks/${task.id}/`, payload);
            navigate("/app");
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nome lista..."
                    className="bg-transparent text-4xl font-black uppercase outline-none w-full dark:text-white"
                />
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-500/30">
                    <CloudArrowUpIcon className="w-5 h-5" /> Salva
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        placeholder="Aggiungi elemento..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl outline-none dark:text-white"
                    />
                    <button onClick={addItem} className="p-4 bg-blue-600 text-white rounded-xl"><PlusIcon className="w-6 h-6"/></button>
                </div>

                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => toggleItem(item.id)}
                                    className="w-5 h-5 rounded"
                                />
                                <span className={`font-medium ${item.checked ? 'line-through text-slate-400' : 'dark:text-white'}`}>
                                    {item.text}
                                </span>
                            </div>
                            <button onClick={() => removeItem(item.id)}><XMarkIcon className="w-5 h-5 text-red-500"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChecklistEditor;