import { useState, useEffect } from "react";

function App() {
  // 1. Inizializza lo stato leggendo dal localStorage o dalle preferenze di sistema
  const [isDark, setIsDark] = useState(() => {
  return localStorage.theme === 'dark' || 
         (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
    <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="p-8 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl text-center border border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Tema {isDark ? "Scuro" : "Chiaro"} Attivo
        </h1>
        
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-6 py-2 rounded-full font-semibold transition-all
                     bg-slate-900 text-white dark:bg-white dark:text-slate-900
                     hover:scale-105 active:scale-95"
        >
          Cambia Tema
        </button>
      </div>
    </div>
  );
}

export default App;