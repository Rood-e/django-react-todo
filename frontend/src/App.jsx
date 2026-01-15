import { useState, useEffect } from "react";
import ThemeButton from "./components/ThemeButton.jsx";
import FeatureDisplay from "./components/FeatureDisplay.jsx";
import HeroSection from "./components/HeroSection.jsx";
import { PencilIcon, CloudArrowUpIcon, Squares2X2Icon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const features = [
    {
        id: 'planning',
        title: 'Pianificazione Intuitiva',
        desc: 'Ordina le tue attività con un sistema di priorità a tre livelli.',
        icon: PencilIcon,
        color: 'text-blue-500',
        rgb: '#3b82f6',
    },
    {
        id: 'sync',
        title: 'Sincronizzazione Cloud',
        desc: 'Ogni modifica viene salvata istantaneamente su tutti i tuoi dispositivi.',
        icon: CloudArrowUpIcon,
        color: 'text-green-500',
        rgb: '#22c55e',
    },
    {
        id: 'categories',
        title: 'Gestione Categorie',
        desc: 'Crea aree di lavoro separate per casa, lavoro e studio.',
        icon: Squares2X2Icon,
        color: 'text-purple-500',
        rgb: '#a855f7'
    },
    {
        id: 'archive',
        title: 'Archivio Storico',
        desc: 'Consulta i task completati per monitorare la tua produttività.',
        icon: ArchiveBoxIcon,
        color: 'text-orange-500',
        rgb: '#f97316'
    }
];

function App() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const [activeId, setActiveId] = useState(features[0].id);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveId((prevId) => {
                const currentIndex = features.findIndex(item => item.id === prevId);
                const nextIndex = (currentIndex + 1) % features.length;
                return features[nextIndex].id;
            });
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    const currentFeature = features.find(f => f.id === activeId);

    return (
        <div className="min-h-screen transition-colors duration-250 bg-slate-50 dark:bg-slate-950">
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            <HeroSection isDark={isDark}/>

            <section className="w-full pt-50 pb-20 bg-white dark:bg-slate-900">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Perché scegliere TaskMaster?
                    </h2>
                    <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                <div className="flex justify-evenly w-full">
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

                    <div className="w-1/3">
                        <FeatureDisplay key={activeId} activeFeature={currentFeature} />
                    </div>
                </div>
            </section>

            <footer className="py-10">
            </footer>

        </div>
    );
}

export default App;