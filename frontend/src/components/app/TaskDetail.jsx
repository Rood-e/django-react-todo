import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import api from "../../api.js";
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import {InformationCircleIcon, PencilSquareIcon, ShoppingCartIcon} from "@heroicons/react/24/outline";

// Sotto-componenti
import NoteEditor from "./types/NoteEditor.jsx";
import ChecklistEditor from "./types/ChecklistEditor.jsx";
import EditorLayout from "./types/EditorLayout.jsx";

function TypeCard({ title, desc, icon: Icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-64 p-8 rounded-[3rem] transition-all duration-300 group flex flex-col items-center text-center
                bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500
                hover:-translate-y-2
                
                /* Ombra Light Mode (Nera/Grigia) */
                shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                
                /* Ombra Dark Mode (Azzurro/Glow) */
                dark:shadow-[0_20px_50px_rgba(59,130,246,0.1)] 
                dark:hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)]`}
        >
            <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                {desc}
            </p>
        </button>
    );
}

/*
 * Componente TaskDetail: gestisce la visualizzazione, creazione e modifica
 * delle task individuali (Note e Checklist).
 * Funziona come un router interno basato sull'ID del parametro URL.
 */
function TaskDetail() {
    const { setAppTasks } = useOutletContext(); // Context per aggiornare la lista globale
    const navigate = useNavigate();
    const { id } = useParams(); // 'new' indica una nuova task, altrimenti è l'ID del DB
    const isNew = id === 'new';

    //Autosave
    const autosaveTimerRef = useRef(null);
    const lastSavedDataRef = useRef(null);

    // Stati per la gestione dei dati e della UI
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(!isNew); // Caricamento attivo solo se stiamo recuperando una task esistente
    const [isSaving, setIsSaving] = useState(false); // Feedback visivo durante le chiamate API
    const [selectedType, setSelectedType] = useState(null); // 'note' o 'list' (solo per nuove task)
    const [categories, setCategories] = useState({});

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState("tostart");
    const [selectedCatIds, setSelectedCatIds] = useState([]);
    const [content,setContent] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectionToggle, setSelectionToggle] = useState(0);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: true,
                orderedList: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML()); // Aggiorna lo stato del padre in tempo reale per l'autosave
        },
        onSelectionUpdate: () => {
            setSelectionToggle(prev => prev + 1);
        },
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-slate dark:prose-invert max-w-none text-xl min-h-[500px] leading-relaxed cursor-text p-10',
            },
        },
    });

    useEffect(() => {
        if (task) {
            // Valori normalizzati per evitare discrepanze "" vs null
            const initialTitle = task.title || "";
            const initialStatus = task.status || "tostart";
            const initialDueDate = task.due_date || ""; // Teniamo stringa vuota qui
            const initialCats = task.categories ? task.categories.map(id => id.toString()) : [];
            const initialContent = task.content || "";

            setTitle(initialTitle);
            setStatus(initialStatus);
            setDueDate(initialDueDate);
            setSelectedCatIds(initialCats);
            setContent(initialContent);

            // La FOTO deve essere l'esatta replica di ciò che l'autosave costruirà
            lastSavedDataRef.current = JSON.stringify({
                title: initialTitle,
                status: initialStatus,
                due_date: initialDueDate || null, // Uniformiamo a null per il confronto
                categories: initialCats,
                content: initialContent
            });
        }
    }, [task]);

    // Recupera le categorie disponibili all'avvio per popolare i selettori negli editor
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await api.get('categories/');
                const map = {};
                res.data.forEach(c => map[c.id] = c);
                setCategories(map);
            } catch (err) { console.error(err); }
        };
        fetchCats();
    }, []);

    /*useEffect(() => {
        console.log(categories);
    }, [categories]);*/

    // Se l'ID non è 'new', recupera i dettagli della task dal database
    useEffect(() => {
        if (!isNew) {
            const fetchTask = async () => {
                try {
                    const res = await api.get(`tasks/${id}/`);
                    setTask(res.data);
                } catch (err) {
                    console.error("Task non trovata");
                } finally {
                    setLoading(false);
                }
            };
            fetchTask();
        }else {
            // --- IL GRANDE RESET PER LE NUOVE TASK ---
            setTask(null);
            setSelectedType(null);

            // Svuota tutti gli stati dei metadati
            setTitle("");
            setStatus("tostart");
            setDueDate("");
            setSelectedCatIds([]);
            setContent(""); // Svuota il content del padre (salva la checklist dal crash)

            // Svuota l'editor di Tiptap se esiste già in memoria
            if (editor)
                editor.commands.clearContent()
        }
    }, [id, isNew, editor]);

    //Autosave
    useEffect(() => {
        if (isNew || (task && !task.is_active) || loading) return;

        // Normalizziamo i dati per il confronto
        const normalizedData = {
            title: title || "",
            status: status,
            due_date: dueDate || null, // Trasformiamo "" in null per il confronto
            categories: selectedCatIds,
            content: content
        };

        const currentDataStr = JSON.stringify(normalizedData);

        // Se i dati attuali sono identici all'ultima "foto", fermati
        if (currentDataStr === lastSavedDataRef.current) return;

        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

        autosaveTimerRef.current = setTimeout(() => {
            // Fondamentale: aggiorniamo il ref PRIMA di chiamare onSave
            lastSavedDataRef.current = currentDataStr;
            onSave(normalizedData);
        }, 2000);

        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
        // Aggiungiamo 'task' alle dipendenze così se il server cambia qualcosa, il ref si aggiorna
    }, [title, status, dueDate, selectedCatIds, content, isNew, loading]);

    const handleGlobalSave = async (overrideContent = null) => {
        const payload = {
            title,
            status,
            due_date: dueDate || null,
            categories: selectedCatIds,
            content: overrideContent !== null ? overrideContent : content
        };
        await onSave(payload);
    };

    // Gestione unificata del salvataggio (POST per nuove, PUT per esistenti)
    const onSave = async (payload) => {
        try {
            setIsSaving(true);
            if (isNew) {
                // Creazione: invia i dati e reindirizza all'ID creato
                const res = await api.post("tasks/", { ...payload, type: selectedType });
                payload.id = res.data.id;
                payload.is_active = true;
                setAppTasks(prev => [payload, ...prev]);
                navigate(`/app/task/${res.data.id}`, { replace: true });
            } else {
                // Modifica: aggiorna il DB e sincronizza lo stato globale
                await api.put(`tasks/${id}/`, payload);
                setTask(prev => ({ ...prev, ...payload }))
                setAppTasks(prev => prev.map(t => {
                    if (t.id === Number(id))
                        return { ...t, ...payload };
                    return t;
                }));
            }
            lastSavedDataRef.current = JSON.stringify({
                ...payload,
                due_date: payload.due_date || null
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Gestione eliminazione: sposta nel cestino (is_active = false)
    const onDelete = async () => {
        setIsSaving(true);
        try {
            await api.delete(`tasks/${id}/`);

            setAppTasks(prev => {
                const numericId = Number(id);

                // Aggiorna lo stato globale riflettendo lo spostamento nel cestino
                if (task.is_active)
                    return prev.map(t => t.id === numericId ? { ...t, is_active: false } : t);

                setAppTasks(prev => {
                    return prev.map(t => {
                        console.log(t)
                        if (t.id === Number(id) && t.is_active)
                            return { ...t, is_active: false };
                        else if (t.id !== Number(id))
                            return t;
                    });
                });

                return prev.filter(t => t.id !== numericId);
            });

            navigate("/app", { replace: true });
        } finally {
            setIsSaving(false);
        }
    };

    const onRestore = async () => {
        setIsSaving(true);
        try {
            // Il backend deve restituire il task aggiornato
            await api.put(`tasks/${id}/`, { action: 'restore' });

            setAppTasks(prev => {
                return prev.map(prev => {
                    if (prev.id === Number(id))
                        return { ...prev, is_active: true };
                    return prev;
                });
            });

            setTask(prev => ({ ...prev, is_active: true }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAction = async () => {
        setShowDeleteModal(false);
        await onDelete(); // La tua funzione api.delete esistente
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    // VIEW 1: Selezione tipologia (Mostrata solo per nuove task non ancora tipizzate)
    if (isNew && !selectedType) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
                    Seleziona tipologia
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                    <TypeCard
                        title="Nota"
                        desc="Testo libero e appunti"
                        icon={PencilSquareIcon}
                        onClick={() => setSelectedType('note')}
                    />
                    <TypeCard
                        title="Lista"
                        desc="Checklist e spesa"
                        icon={ShoppingCartIcon}
                        onClick={() => setSelectedType('list')}
                    />
                </div>

                <div className="mt-12 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 shrink-0" />
                        <span>Per scadenze e appuntamenti, usa la sezione Calendario.</span>
                    </p>
                </div>
            </div>
        );
    }

    const type = isNew ? selectedType : task?.type;

    // VIEW 2: Editor specifico (Caricato in base al tipo di task)
    return (
        <EditorLayout editor={editor}
            title={title} setTitle={setTitle}
            status={status} setStatus={setStatus}
            dueDate={dueDate} setDueDate={setDueDate}
            selectedCatIds={selectedCatIds} setSelectedCatIds={setSelectedCatIds}
            categories={categories} type={type}
            isArchived={task?.is_active === false} isNew={isNew}
            onSave={() => handleGlobalSave()}
            onDelete={onDelete} onRestore={onRestore} isSaving={isSaving}
            showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
            handleDeleteAction={handleDeleteAction} selectionKey={selectionToggle}>

            {type === 'note' && (
                <NoteEditor
                    initialContent={content}
                    onChange={(html) => setContent(html)}
                    isArchived={task?.is_active === false}
                    editor={editor}
                />
            )}
            {type === 'list' && (
                <ChecklistEditor
                    initialContent={content}
                    onChange={(json) => setContent(json)}
                    isArchived={task?.is_active === false}
                />
            )}
        </EditorLayout>
    );
}

export default TaskDetail;