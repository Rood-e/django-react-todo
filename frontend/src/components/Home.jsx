import { useState, useEffect } from "react";
import ThemeButton from "./ThemeButton.jsx";
import FeatureDisplay from "./FeatureDisplay.jsx";
import HeroSection from "./HeroSection.jsx";

import { Link } from 'react-router-dom';

import { PencilIcon, CloudArrowUpIcon, Squares2X2Icon, ArchiveBoxIcon, SparklesIcon, ArrowPathRoundedSquareIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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

function Home({isDark, setIsDark}) {
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

    const currentFeature = features.find(f => f.id === activeId);

    return (
        <div className="min-h-screen transition-colors duration-250 bg-slate-50 dark:bg-slate-950">
            {/* Pulsante cambia tema */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
                <Link to="/login"  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400
                   hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Accedi
                </Link>

                <Link to="/register" className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-black
                   uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20
                   hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all">
                    Crea Account
                </Link>
            </div>

            {/* Hero */}
            <HeroSection isDark={isDark}/>

            {/* Perchè scegliere TaskMaster */}
            <section className="w-full pt-50 pb-26 bg-white dark:bg-slate-900">

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

            {/* Caratteristiche */}
            <section className="py-24 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-10">

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                            Oltre la semplice lista di cose da fare
                        </h2>
                        <p className="mt-4 text-slate-500">Progettato per chi esige il massimo dal proprio tempo.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <SparklesIcon/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Focus Mentale</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Libera la mente dai promemoria continui e concentrati su ciò che conta davvero.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <ArrowPathRoundedSquareIcon/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Workflow Ottimizzato</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Smetti di saltare da un'app all'altra. Centralizza ogni tua priorità in un unico posto.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <ChartBarIcon/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Analisi dei Progressi</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Non limitarti a completare task, guarda quanto sei diventato produttivo con le nostre statistiche.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className=" bg-slate-50 dark:bg-slate-900">
                <div className=" relative overflow-hidden dark:bg-blue-950/20 border-white/10 p-12 md:p-20 text-center">

                    {/* Cerchi di luce soffusa decorativo */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold dark:text-white tracking-tight mb-6">
                            Trasforma il tuo caos <br/>
                            <span className="text-blue-400 font-extrabold italic">in chiarezza.</span>
                        </h2>

                        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                            Unisciti a chi ha già scelto un approccio moderno alla gestione del tempo.
                            Semplice, veloce e senza attriti.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to='/register' className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold
                                rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95">
                                Inizia Ora
                            </Link>
                        </div>
                        <p className="mt-5 text-slate-500 text-sm font-medium tracking-wide">
                            Libero da costi • Pronto in 30 secondi
                        </p>
                    </div>
                </div>
            </section>

            <footer className="w-full pt-10 pb-6 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Task<span className="text-blue-600">Master</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Organizza la tua giornata, una task alla volta.
                        </p>
                        <div className="flex gap-4 text-slate-400">

                        </div>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link to="/legal/privacy" className="hover:text-blue-600 transition-colors">
                            Privacy
                        </Link>
                        <Link to="/legal/terms" className="hover:text-blue-600 transition-colors">
                            Terms
                        </Link>
                        <Link to="/legal/privacy" className="hover:text-blue-600 transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-10 mt-6 pt-8 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400">
                    © 2026 TaskMaster. Tutti i diritti riservati.
                </div>
            </footer>
        </div>
    );
}

export default Home;