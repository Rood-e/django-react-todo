import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

/* Pulsante per il cambio tema chiaro/scuro */
function ThemeButton({isDark,setIsDark}) {
    return (
        <button onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
                        transition-all duration-300 hover:scale-103 shadow-md hover:shadow-slate-400/60 dark:hover:shadow-yellow-200/50"
                aria-label="Cambia tema">
            {isDark ? ( <SunIcon className="h-6 w-6 text-yellow-600"/> ) : ( <MoonIcon className="h-6 w-6 text-gray-800"/>)}
        </button>
    )
}

export default ThemeButton;