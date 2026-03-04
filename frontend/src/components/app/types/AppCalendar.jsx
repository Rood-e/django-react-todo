import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import itLocale from '@fullcalendar/core/locales/it';
import {useEffect, useRef, useState} from "react";
import api from "../../../api.js";

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
        { title: "Lunedì dell'Angelo", start: easterMonday.toISOString().split('T')[0] }
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
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const resp = await api.get('/tasks/');

                const taskEvents = resp.data
                    .filter(task => task.due_date)
                    .map(task => ({
                        id: task.id,
                        title: task.title || "Senza titolo",
                        start: task.due_date,
                        backgroundColor: task.status === 'completed' ? '#22c55e' : '#3b82f6',
                        borderColor: 'transparent',
                        extendedProps: { ...task },
                        display: 'block'
                    }));

                const holidays = getItalianHolidays(currentYear);

                setTasks([...taskEvents, ...holidays]);
            } catch (error) {
                setTasks(getItalianHolidays(currentYear));
            }
        };
        fetchTasks();
    }, [currentYear]);

    useEffect(() => {
        console.log(tasks);
    }, [tasks])

    return (
        <div className="h-screen w-full -mt-7 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <style>{`
                /* FIX PER IL BUG DELLA COLONNA VUOTA (SIDEBAR) */
                .fc {
                    display: flex !important;
                    flex-direction: column !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                
                /* Forza le tabelle interne a occupare il 100% senza basarsi sui pixel calcolati */
                .fc-scrollgrid, .fc-daygrid-body, .fc-multimonth-daygrid-table, .fc-col-header {
                    width: 100% !important;
                }
                
                .fc-daygrid-body table {
                    width: 100% !important;
                }

                /* HEADER E MAIUSCOLE */
                .fc .fc-toolbar-title { 
                    text-transform: capitalize !important; 
                    font-weight: 900; 
                    font-size: 2rem; 
                    letter-spacing: -0.04em;
                    color: #1e293b;
                }
                .dark .fc .fc-toolbar-title { color: white; }

                /* BOTTONI MODERNI */
                .fc .fc-button-primary {
                    background: transparent !important;
                    border: 2px solid #e2e8f0 !important;
                    color: #64748b !important;
                    font-weight: 800;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    transition: all 0.2s ease;
                }
                .dark .fc .fc-button-primary { border-color: #1e293b !important; }
                
                .fc .fc-button-primary:hover {
                    background: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                }
                
                .fc .fc-button-active {
                    background: #0f172a !important;
                    color: white !important;
                    border-color: #0f172a !important;
                }

                /* GRIGLIA PULITA */
                .fc-theme-standard .fc-scrollgrid { border: none !important; }
                .fc-theme-standard td, .fc-theme-standard th { 
                    border: 1px solid #f1f5f9 !important; 
                }
                .dark .fc-theme-standard td, .dark .fc-theme-standard th { 
                    border: 1px solid #1e293b !important; 
                }

                /* NUMERI GIORNI */
                .fc .fc-daygrid-day-number {
                    padding: 12px !important;
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #94a3b8;
                }
            `}</style>
            <div className="flex-1 p-6 flex flex-col min-h-0">
                <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        locale={itLocale}
                        dayMaxEvents={true}
                        handleWindowResize={true}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        height="100%"
                        events={tasks}
                    />
                </div>
            </div>
        </div>
    );
}

export default AppCalendar;