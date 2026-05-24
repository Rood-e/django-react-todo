import {
    CalendarDaysIcon, PlusIcon, Cog6ToothIcon, ChartBarSquareIcon,
    ArrowLeftOnRectangleIcon, TrashIcon
} from '@heroicons/react/24/outline';
import {Link, useLocation, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api.js";
import {useAuth} from "../auth/AuthContext.jsx";

/*
 * Sidebar di navigazione principale con funzionalità di espansione automatica.
 * Gestisce il conteggio dinamico delle task attive e di quelle nel cestino.
 */
function Sidebar({ isOpen, setIsOpen, tasks }) {
    const location = useLocation();
    const navigate = useNavigate();
    // Stato locale per memorizzare il numero di task per categoria (Badge)
    const [counts, setCounts] = useState({ active: 0, trash: 0 });
    const {setUser} = useAuth();

    // Ricalcola i conteggi ogni volta che la lista tasks globale cambia
    useEffect(() => {
        setCounts({ active: tasks.filter(task => task.is_active === true).length, trash: tasks.filter(task => task.is_active === false).length });
    }, [tasks])

    // Configurazione centralizzata delle voci di menu per facilitare la manutenzione
    const navItems = [
        { to: "/app", icon: ChartBarSquareIcon, label: "Dashboard", count: counts.active, color: "text-blue-600", bg: "bg-blue-600" },
        { to: "/app/calendar", icon: CalendarDaysIcon, label: "Calendario", count: null, color: "text-indigo-600", bg: "bg-indigo-600" },
        { to: "/app/trash", icon: TrashIcon, label: "Cestino", count: counts.trash, color: "text-red-500", bg: "bg-red-500" },
    ];

    const handleLogout = async () => {
        try {
            await api.post('logout/');
        } catch (err) {
            console.error("Errore durante il logout lato server:", err);
        } finally { // Anche se il server fallisce, procedere a pulire il locale per sicurezza
            setUser(null);
            // Ritorno alla home
            navigate('/');
        }
    };

    return (
        <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className={`h-screen sticky top-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out ${isOpen ? 'w-72' : 'w-24'}`}
        >
            {/* LOGO */}
            <div className="flex flex-col items-center py-8 flex-none h-32">
                <div className={`transition-all duration-500 ${!isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0'}`}>
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white text-2xl font-black">T</span>
                    </div>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-w-xs opacity-100 px-8 w-full' : 'max-w-0 opacity-0 h-0'}`}>
                    <Link to='/'>
                        <span className="text-2xl font-black tracking-tighter dark:text-white uppercase block text-center">Task<span className='text-blue-600'>Master</span></span>
                    </Link>
                </div>
            </div>

            {/* NAVIGATION */}
            <div className="grow flex flex-col px-4">
                <Link to="/app/task/new" className={`flex items-center mb-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 ${isOpen ? 'p-4 gap-4' : 'h-14 w-14 justify-center mx-auto'}`}>
                    <PlusIcon className="w-6 h-6 stroke-3" />
                    {isOpen && <span className="font-black text-xs uppercase tracking-[0.2em] whitespace-nowrap">Nuova Nota</span>}
                </Link>

                <nav className="space-y-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link key={item.to} to={item.to} className={`flex items-center h-14 rounded-2xl transition-all group relative ${isActive ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}>
                                <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-16' : 'w-full'}`}>
                                    <item.icon className={`w-6 h-6 transition-colors ${isActive ? item.color : 'text-slate-400 group-hover:' + item.color}`} />
                                </div>
                                {isOpen && (
                                    <div className="flex items-center justify-between flex-1 pr-4 animate-in fade-in duration-500">
                                        <span className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:' + item.color}`}>
                                            {item.label}
                                        </span>
                                        {item.count > 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg text-white ${item.bg}`}>{item.count}</span>}
                                    </div>
                                )}
                                {isActive && <div className={`absolute left-0 w-1.5 h-6 rounded-r-full ${item.bg}`} />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* FOOTER */}
            <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800 flex-none">
                <Link to="/app/account" className="flex items-center h-12 text-slate-400 hover:text-slate-900 dark:hover:text-white group transition-all rounded-xl">
                    <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-16' : 'w-full'}`}>
                        <Cog6ToothIcon className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                    </div>
                    {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">Impostazioni</span>}
                </Link>
                <button onClick={handleLogout} className="flex items-center h-12 text-red-400 hover:text-red-600 group transition-all cursor-pointer w-full rounded-xl">
                    <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-16' : 'w-full'}`}>
                        <ArrowLeftOnRectangleIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">Disconnetti</span>}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;