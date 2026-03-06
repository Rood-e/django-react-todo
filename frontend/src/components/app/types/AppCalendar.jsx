import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import itLocale from '@fullcalendar/core/locales/it';
import {useEffect, useRef, useState} from "react";
import api from "../../../api.js";
import {useNavigate} from "react-router-dom";
import {XMarkIcon, DocumentTextIcon, ListBulletIcon, CheckCircleIcon, PlayIcon, StopIcon, ClockIcon} from "@heroicons/react/24/outline";

// Helper Colori e Status (Coerenti con le tue altre pagine)
const STATUS_OPTIONS = [
    { value: 'tostart', label: 'Da Iniziare', icon: StopIcon, color: 'text-slate-400', hex: '#94a3b8', desc: 'Attività non ancora avviata' },
    { value: 'progress', label: 'In Corso', icon: PlayIcon, color: 'text-blue-500', hex: '#3b82f6', desc: 'Lavoro attualmente attivo' },
    { value: 'pending', label: 'In Sospeso', icon: ClockIcon, color: 'text-amber-500', hex: '#f59e0b', desc: 'In attesa di altri fattori' },
    { value: 'completed', label: 'Completata', icon: CheckCircleIcon, color: 'text-green-500', hex: '#22c55e', desc: 'Task portata a termine' }
];

const getColorByStatus = (statusValue) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === statusValue);
    return option ? option.hex : '#94a3b8';
};

const getItalianHolidays = (year) => {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    const easter = new Date(year, month - 1, day);
    const easterMonday = new Date(year, month - 1, day + 1);

    const fixedHolidays = [
        { title: "Capodanno", start: `${year}-01-01` },
        { title: "Epifania", start: `${year}-01-06` },
        { title: "Liberazione", start: `${year}-04-25` },
        { title: "Festa del Lavoro", start: `${year}-05-01` },
        { title: "Festa della Repubblica", start: `${year}-06-02` },
        { title: "Ferragosto", start: `${year}-08-15` },
        { title: "Tutti i Santi", start: `${year}-11-01` },
        { title: "Immacolata", start: `${year}-12-08` },
        { title: "Natale", start: `${year}-12-25` },
        { title: "St. Stefano", start: `${year}-12-26` },
        { title: "Pasqua", start: easter.toISOString().split('T')[0] },
        { title: "Lunedì dell'Angelo", start: easterMonday.toISOString().split('T')[0] },
        { title: "Capodanno", start: `${year+1}-01-01` },
        { title: "Epifania", start: `${year+1}-01-06` },
    ];

    return fixedHolidays.map(h => ({
        ...h,
        display: 'background',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        textColor: '#ef4444',
        classNames: ['holiday-event'],
        allDay: true,
        editable: false
    }));
};


/*
    TODO: Mettere a posto calendario (quando si apre la sidebar si bugga e le colonne non cambiano dimensione)\
          quando si salva un evento non viene visualizzato subito
          visualizzazione dei dettagli degli eventi nella dashboard
          gestione rimozione dal cestino degli eventi
          aggiungere ai filtri gli eventi
*/

function AppCalendar() {
    const [tasks, setTasks] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const lastYearRef = useRef(null);
    const calendarRef = useRef(null);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        category: [], // Array per selezione multipla
        status: 'tostart',
        due_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksResp, catsResp] = await Promise.all([
                    api.get('/tasks/'),
                    api.get('/categories/')
                ]);
                setAllCategories(catsResp.data);

                const taskEvents = tasksResp.data
                    .filter(task => task.due_date && task.is_active === true)
                    .map(task => ({
                        id: task.id,
                        title: task.title || "Senza titolo",
                        start: task.due_date,
                        backgroundColor: getColorByStatus(task.status),
                        borderColor: 'transparent',
                        extendedProps: { ...task },
                        display: 'list-item',
                    }));
                setTasks(taskEvents);
            } catch (error) { console.error(error); }
        };
        fetchData();
    }, []);

    const handleDatesSet = (dateInfo) => {
        // Estrazione dell'anno dal calendario
        const displayedYear = dateInfo.view.currentStart.getFullYear();

        // Se è diverso da quello memorizzato, ricalcola
        if (lastYearRef.current !== displayedYear) {
            lastYearRef.current = displayedYear;
            setHolidays(getItalianHolidays(displayedYear));
        }
    };

    const handleEventClick = (info) => {
        if (info.event.display === 'background') return;
        const p = info.event.extendedProps;

        if (p.type === 'note' || p.type === 'list') {
            navigate(`/app/task/${info.event.id}`);
            return;
        }

        setEditingTaskId(info.event.id);
        setTaskForm({
            title: info.event.title,
            category: p.category || [],
            status: p.status || 'tostart',
            due_date: info.event.startStr
        });
        setIsModalOpen(true);
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            const data = { ...taskForm, type:'event', is_active: true };
            const resp = editingTaskId
                ? await api.patch(`/tasks/${editingTaskId}/`, data)
                : await api.post('/tasks/', data);

            const calendarApi = calendarRef.current.getApi();
            if (editingTaskId) {
                const ev = calendarApi.getEventById(editingTaskId);
                ev.setProp('title', taskForm.title);
                ev.setStart(taskForm.due_date);
                ev.setProp('backgroundColor', getColorByStatus(taskForm.status));
                ev.setExtendedProp('status', taskForm.status);
                ev.setExtendedProp('category', taskForm.category);
            } else {
                calendarApi.addEvent({
                    id: resp.data.id,
                    title: resp.data.title,
                    start: resp.data.due_date,
                    backgroundColor: getColorByStatus(resp.data.status),
                    extendedProps: { ...resp.data },
                    display: 'list-item'
                });
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) { console.error(error); }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`tasks/${taskId}/`);
            calendarRef.current.getApi().getEventById(taskId)?.remove();
            setTasks(prev => prev.filter(t => String(t.id) !== String(taskId)));
        } catch (error) { console.error(error); }
    };

    const resetForm = () => {
        setEditingTaskId(null);
        setTaskForm({ title: '', category: [], status: 'tostart', due_date: new Date().toISOString().split('T')[0] });
    };

    const toggleCategory = (catId) => {
        setTaskForm(prev => ({
            ...prev,
            category: prev.category.includes(catId)
                ? prev.category.filter(id => id !== catId)
                : [...prev.category, catId]
        }));
    };

    return (
        <div className="h-screen w-full -mt-7 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <style>{`
                .fc { display: flex !important; flex-direction: column !important; width: 100% !important; height: 100% !important; }
                .fc-scrollgrid, .fc-daygrid-body, .fc-col-header { width: 100% !important; }
                .fc .fc-toolbar-title { text-transform: capitalize !important; font-weight: 900; font-size: 2rem; letter-spacing: -0.04em; color: #1e293b; }
                .dark .fc .fc-toolbar-title { color: white; }
                .fc .fc-button-primary { background: transparent !important; border: 2px solid #e2e8f0 !important; color: #64748b !important; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; border-radius: 12px !important; padding: 8px 16px !important; }
                .fc .fc-button-active { background: #0f172a !important; color: white !important; }
                .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9 !important; }
                .dark .fc-theme-standard td, .dark .fc-theme-standard th { border: 1px solid #1e293b !important; }
                .fc .fc-daygrid-day-number { padding: 12px !important; font-weight: 800; font-size: 0.9rem; color: #94a3b8; }
                .fc-daygrid-event-dot { display: none !important; }
            `}</style>

            <div className="flex-1 p-6 flex flex-col min-h-0">
                <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        ref={calendarRef}
                        locale={itLocale}
                        dayMaxEvents={true}
                        handleWindowResize={true}
                        headerToolbar={{
                            left: 'prev,next today nuovaTask',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        customButtons={
                            {
                                nuovaTask: {
                                    text: 'Nuova Task',
                                    click: () => {
                                        resetForm();
                                        setIsModalOpen(true);
                                    }
                                }
                            }}
                        height="100%"
                        datesSet={handleDatesSet}
                        events={[...tasks,...holidays]}
                        eventClick={handleEventClick}
                        eventContent={(eventInfo) => {
                            if (eventInfo.event.display === 'background')
                                return <div className="p-2 text-[10px] font-black uppercase text-pink-700 dark:text-red-100 opacity-40">{eventInfo.event.title}</div>;

                            const dotColor = eventInfo.event.backgroundColor;
                            const type = eventInfo.event.extendedProps.type;
                            return (
                                <div className="flex items-center justify-between w-full group py-0.5 px-2 cursor-pointer">
                                    <div className="flex items-center min-w-0">
                                        <span style={{"color": dotColor}}>
                                            {type === 'note' ? <DocumentTextIcon className="w-4 h-4" /> :
                                                type === 'list' ? <ListBulletIcon className="w-4 h-4"/> :
                                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-current shadow-sm" />}
                                        </span>
                                        <span className="truncate font-bold text-[13px] ml-2 text-slate-700 dark:text-slate-200">{eventInfo.event.title}</span>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(eventInfo.event.id); }}>
                                        <XMarkIcon className="h-3.5 w-3.5 text-red-500"/>
                                    </button>
                                </div>
                            );
                        }}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <span className={`w-2 h-8 rounded-full ${editingTaskId ? 'bg-amber-500' : 'bg-blue-600'}`}></span>
                            {editingTaskId ? 'Modifica' : 'Nuova Task'}
                        </h2>
                        <form onSubmit={handleSaveTask} className="space-y-5">
                            <input className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 outline-none pb-2"
                                   placeholder="Titolo..." value={taskForm.title} required onChange={e => setTaskForm({...taskForm, title: e.target.value})}/>

                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Stato</label>
                                <button type="button" onClick={() => setIsStatusOpen(!isStatusOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full bg-[${getColorByStatus(taskForm.status)}]`}/>
                                        <span className="font-bold text-sm uppercase">{STATUS_OPTIONS.find(o => o.value === taskForm.status)?.label}</span>
                                    </div>
                                </button>
                                {isStatusOpen && (
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

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Categorie</label>
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(cat => (
                                        <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${taskForm.category.includes(cat.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input type="date" value={taskForm.due_date} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold" onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}/>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Annulla</button>
                                <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">Salva</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppCalendar;