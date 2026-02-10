function LoadingOverlay({ message = "Caricamento in corso..." }) {
    return (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            {/* Contenitore Spinner */}
            <div className="relative flex items-center justify-center">
                {/* Cerchio esterno statico (opzionale per estetica) */}
                <div className="w-16 h-16 border-4 border-slate-200/30 rounded-full"></div>

                {/* Spinner Animato */}
                <div className="absolute w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Messaggio */}
            {message && (
                <p className="mt-4 text-white font-black uppercase tracking-widest text-xs animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}

export default LoadingOverlay;