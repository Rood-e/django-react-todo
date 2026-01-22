import { Link, Outlet } from 'react-router-dom';

import ThemeButton from '../ThemeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function LegalHub ({isDark, setIsDark}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            <div className="max-w-6xl mx-auto px-10 flex flex-col md:flex-row gap-16">
                <aside className="w-full md:w-1/4">
                    <nav className="sticky top-32 flex flex-col h-fit space-y-8">
                        {/* Gruppo Link */}
                        <div className="space-y-2">
                            <p className="px-6 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                                Documentazione
                            </p>
                            <Link to="/legal/privacy" className="block px-6 py-3 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Privacy Policy
                            </Link>
                            <Link to="/legal/terms" className="block px-6 py-3 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Termini di Servizio
                            </Link>
                            <Link to="/legal/contact" className="block px-6 py-3 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Contatti
                            </Link>
                        </div>

                        {/* Separatore */}
                        <div className="border-t border-slate-200 dark:border-slate-800 mx-6"></div>

                        {/* Link Home */}
                        <div>
                            <Link to="/"
                                className="flex items-center gap-3 px-6 py-3 rounded-xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                                <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                Torna alla Home
                            </Link>
                        </div>
                    </nav>
                </aside>

                {/* Sezione a destra: In base all'URL capisce cosa inserire */}
                <main className="w-full md:w-3/4 bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
export default LegalHub;