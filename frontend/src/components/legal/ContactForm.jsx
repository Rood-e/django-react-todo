import { useState } from 'react';

const ContactForm = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Inviando...');
        setTimeout(() => setStatus('Messaggio inviato con successo!'), 1500);
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                Contattaci
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-10">
                Hai riscontrato un problema o vuoi suggerire una funzionalità? Scrivici direttamente.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome</label>
                        <input type="text" required placeholder="Il tuo nome"
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input type="email" required placeholder="tua@email.com"
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Messaggio</label>
                    <textarea rows="5" required  placeholder="Come possiamo aiutarti?"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"></textarea>
                </div>

                <button type="submit"
                    className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25">
                    Invia Messaggio
                </button>

                {status && (
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-4 animate-pulse">
                        {status}
                    </p>
                )}
            </form>

            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Email Diretta</h3>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                    support@taskmaster.com
                </p>
            </div>
        </div>
    );
};

export default ContactForm;