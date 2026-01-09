import {useState, useEffect} from "react";
import ThemeButton from "./components/ThemeButton.jsx";
import { PencilIcon, CloudArrowUpIcon, Squares2X2Icon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const features = [
    {
        id: 'planning',
        title: 'Pianificazione Intuitiva',
        desc: 'Ordina le tue attività con un sistema di priorità a tre livelli.',
        icon: PencilIcon,
        color: 'text-blue-500'
    },
    {
        id: 'sync',
        title: 'Sincronizzazione Cloud',
        desc: 'Ogni modifica viene salvata istantaneamente su tutti i tuoi dispositivi.',
        icon: CloudArrowUpIcon,
        color: 'text-green-500'
    },
    {
        id: 'categories',
        title: 'Gestione Categorie',
        desc: 'Crea aree di lavoro separate per casa, lavoro e studio.',
        icon: Squares2X2Icon,
        color: 'text-purple-500'
    },
    {
        id: 'archive',
        title: 'Archivio Storico',
        desc: 'Consulta i task completati per monitorare la tua produttività.',
        icon: ArchiveBoxIcon,
        color: 'text-orange-500'
    }
];

function App() {
    // 1. Inizializza lo stato leggendo dal localStorage o dalle preferenze di sistema
    const [isDark, setIsDark] = useState(() => {
        return localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const [activeId, setActiveId] = useState(features[0].id);

    // 2. Ogni volta che isDark cambia, aggiorna il DOM e il localStorage
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    return (
        <div className="min-h-screen transition-colors duration-250 bg-slate-50 dark:bg-slate-950">
            {/* Pulsante Tema - Posizionato in basso a destra */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            {/* Full Hero Section */}
            <section className="h-screen w-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Task<span className="text-blue-600">Master</span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                        Organizza la tua giornata, un task alla volta. Semplice, veloce e moderno.
                    </p>
                </div>
            </section>

            <section className="w-full py-20 bg-white dark:bg-slate-900 flex justify-evenly">
                {/* Lista delle caratteristiche */}
                <div className="w-1/3">
                    <ul className="list-none space-y-5">
                        {features.map((f) => (
                            <li key={f.id}>
                                <button
                                    onClick={() => setActiveId(f.id)}
                                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 text-left border-l-4 ${
                                        activeId === f.id
                                            ? `bg-white dark:bg-slate-800 shadow-xl ${f.color} dark:text-white translate-x-2`
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                    }`}>
                                    <f.icon className={`h-6 w-6 ${f.color}`} />
                                    <span className="font-bold text-slate-900 dark:text-white">{f.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* TODO Dettagli: Per ogni Caratteristica selezionata visualizzare un'immagine + dettagli */}
                <div className="w-1/3">
                    {features.map((f) => (
                        <span key={f.id}>
                            <p
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 text-left ${
                                    activeId === f.id
                                        ? `bg-white dark:bg-slate-800 shadow-xl translate-x-2`
                                        : 'hidden'
                                }`}>
                                <img src={''} alt={f.id} />
                                <span className=" text-slate-900 dark:text-white">{f.desc}</span>
                            </p>
                        </span>
                    ))}
                </div>
            </section>

            <footer className="py-10">
            </footer>
        </div>
    );
}

export default App;