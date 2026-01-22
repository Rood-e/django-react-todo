function TermsContent () {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                Termini di Servizio
            </h1>
            <p className="text-sm text-slate-500 mb-8 italic">
                Ultimo aggiornamento: 22 Gennaio 2026
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">1. Accettazione dei Termini</h2>
                <p>
                    Utilizzando TaskMaster, l'utente accetta di essere vincolato dai presenti termini. Il servizio è fornito
                    esclusivamente per uso personale e la gestione della produttività individuale.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">2. Descrizione del Servizio</h2>
                <p>
                    TaskMaster è una piattaforma "SaaS" (Software as a Service) che permette la creazione e sincronizzazione
                    di liste di attività. Il servizio è attualmente offerto in modalità gratuita. Ci riserviamo il diritto
                    di modificare o sospendere funzionalità in qualsiasi momento.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">3. Limitazione di Responsabilità</h2>
                <p>
                    Il software è fornito <strong>"così com'è"</strong> (as-is), senza garanzie di alcun tipo.
                    Il Titolare non potrà essere ritenuto responsabile per:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Mancata esecuzione di task o promemoria.</li>
                    <li>Perdita accidentale di dati dovuta a bug tecnici o interruzioni del server.</li>
                    <li>Uso improprio dell'account da parte dell'utente.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">4. Comportamento dell'Utente</h2>
                <p>
                    L'utente si impegna a non utilizzare il servizio per scopi illeciti, a non tentare di violare l'infrastruttura
                    tecnica e a non inserire contenuti che violino diritti di terzi.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">5. Modifiche ai Termini</h2>
                <p>
                    Questi termini possono essere aggiornati periodicamente. L'uso continuato dell'applicazione dopo le modifiche
                    costituisce accettazione dei nuovi termini.
                </p>
            </section>
        </div>
    );
}

export default TermsContent;