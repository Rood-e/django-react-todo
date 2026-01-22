function PrivacyContent () {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mb-8 italic">
                Ultimo aggiornamento: 22 Gennaio 2026
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">1. Titolare del Trattamento</h2>
                <p>
                    Il Titolare del trattamento è <strong>Rudy Martucci Ortega</strong>, in qualità di persona fisica.
                    Per qualsiasi domanda relativa alla protezione dei dati, puoi contattarmi all'indirizzo email:
                    <span className="text-blue-600 dark:text-blue-400 ml-1 underline">support@taskmaster.com</span>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">2. Tipologia di Dati Raccolti</h2>
                <p>Raccogliamo esclusivamente i dati strettamente necessari al funzionamento del servizio:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Dati di contatto:</strong> Indirizzo email fornito in fase di registrazione.</li>
                    <li><strong>Dati di utilizzo:</strong> Informazioni anonime su come utilizzi l'app (pagine visitate, durata sessioni).</li>
                    <li><strong>Dati tecnici:</strong> Indirizzo IP e identificativi del browser per finalità di sicurezza e monitoraggio.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">3. Finalità del Trattamento</h2>
                <p>I tuoi dati sono trattati per le seguenti finalità:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Esecuzione del Servizio:</strong> Registrazione, autenticazione e sincronizzazione dei tuoi task tra i dispositivi.</li>
                    <li><strong>Sicurezza e Antifrode:</strong> Protezione dell'infrastruttura tecnica e prevenzione di accessi non autorizzati.</li>
                    <li><strong>Supporto:</strong> Gestione delle richieste inviate tramite il form di contatto.</li>
                    <li><strong>Statistica:</strong> Analisi aggregata e anonima per il miglioramento delle funzionalità dell'app.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">4. Modalità di Trattamento</h2>
                <p>
                    Il trattamento dei dati avviene mediante strumenti informatici e telematici, con logiche strettamente correlate alle finalità indicate.
                    <strong>Non utilizziamo processi decisionali completamente automatizzati</strong> per la gestione del tuo profilo o dei tuoi dati.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">5. Conservazione dei Dati</h2>
                <p>
                    I tuoi task e le tue informazioni di profilo saranno conservati fino a quando l'account rimarrà attivo.
                    Puoi richiedere la cancellazione immediata di tutti i tuoi dati in qualsiasi momento tramite le impostazioni del profilo.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">6. Diritti dell'Utente</h2>
                <p>
                    In conformità al GDPR, hai il diritto di accedere ai tuoi dati, chiederne la rettifica, la portabilità o la cancellazione.
                    Per esercitare tali diritti, invia un'email al Titolare sopra indicato.
                </p>
            </section>
        </div>
    );
}

export default PrivacyContent;