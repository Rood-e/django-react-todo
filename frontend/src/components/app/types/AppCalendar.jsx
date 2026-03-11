import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import itLocale from '@fullcalendar/core/locales/it';
import interactionPlugin from '@fullcalendar/interaction';
import {useEffect, useRef, useState} from "react";
import api from "../../../api.js";
import {useNavigate} from "react-router-dom";
import {XMarkIcon, DocumentTextIcon, ListBulletIcon, CheckCircleIcon, PlayIcon, StopIcon, ClockIcon} from "@heroicons/react/24/outline";
import EventModal from "../../aesthetic/EventModal.jsx";

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
                ? await api.put(`/tasks/${editingTaskId}/`, data)
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
                    display: 'list-item'
                });
            }

            // 3. SINCRONIZZAZIONE STATO REACT (Opzionale ma consigliata)
            // Aggiorna lo stato locale così se cambi vista e torni indietro i dati ci sono
            if (!editingTaskId) {
                setTasks(prev => [...prev, {
                    id: resp.data.id,
                    title: taskForm.title,
                    start: taskForm.due_date,
                    backgroundColor: getColorByStatus(taskForm.status),
                    display: 'list-item'
                }]);
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

    const handleEventDrop = async (e) => {
        try {
            const event = e.event;
            const newDate = event.startStr.split('T')[0];
            // console.log(newDate);
            await api.put(`/tasks/${event.id}/`, {due_date: newDate})
        } catch (error) {
            console.log(error);
            e.revert(); //In caso di errori l'evento viene rimesso al punto di partenza
        }
    }

    return (
        <div className="h-screen w-full -mt-7 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <div className="flex-1 p-6 flex flex-col min-h-0">
                <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                    <FullCalendar
                        plugins={[dayGridPlugin,interactionPlugin]}
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

                        editable = {true}
                        eventStartEditable={true}
                        droppable={true}
                        eventDrop={handleEventDrop}

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

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingTaskId={editingTaskId}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                handleSaveTask={handleSaveTask}
                allCategories={allCategories}
                toggleCategory={toggleCategory}
                STATUS_OPTIONS={STATUS_OPTIONS}
                isStatusOpen={isStatusOpen}
                setIsStatusOpen={setIsStatusOpen}
                getColorByStatus={getColorByStatus}
            />
        </div>
    );
}

export default AppCalendar;