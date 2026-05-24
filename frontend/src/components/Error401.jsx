import { Link } from 'react-router-dom';

function Error401({children}) {
    const token = document.cookie;

    if (token)
        return children;

    return (
        <div className="grid h-screen place-items-center bg-white dark:bg-slate-950 px-6 py-24 sm:py-32 lg:px-8 text-center transition-colors duration-500">
            <div className="relative">
                <div className="absolute -inset-10 bg-blue-600/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">401</p>
                    <h1 className="text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Permessi mancanti
                    </h1>
                    <p className="mt-6 font-semibold leading-7 text-slate-600 dark:text-slate-400">
                        Spiacenti, per accedere alla pagina richiesta è necessario autenticarsi.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link to="/" className="text-sm font-semibold text-slate-900 dark:text-slate-300
                            hover:text-blue-600 dark:hover:text-blue-400">
                            <span aria-hidden="true">&larr;</span> Torna alla Home
                        </Link>
                        <Link to="/login" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg
                            shadow-blue-500/25 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95">
                            Accedi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Error401;