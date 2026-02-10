import {Link, useNavigate} from 'react-router-dom';
import {useState} from "react";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import api from "../../api.js";

import LoadingOverlay from "../aesthetic/LoadingOverlay.jsx";

const log_in = async (data) => {
    return await api.post("login/", data);
}

function Login(){
    const [errors, setErrors] = useState([]);
    const [backendErrors, setBackendErrors] = useState({});
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setBackendErrors({});

        setLoadingMessage('Registrazione in corso...');
        setLoading(true);

        const mail = document.getElementById('mail');
        const pass = document.getElementById('passwd');

        const currentErrors = [];

        // Validazione
        if(!mail.value.trim())
            currentErrors.push({
                'fields': [mail],
                'message': 'Inserire una mail valida'
            });
        else{
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(mail.value.trim()))
                currentErrors.push({
                    'fields': [mail],
                    'message': 'Formato mail non valido'
                });
        }


        if(!pass.value.trim())
            currentErrors.push({
                'fields': [pass],
                'message': 'Inserire una password valida'
            });
        else{
            if (pass.value.trim().length < 8)
                currentErrors.push({
                    'fields': [pass],
                    'message': 'La password deve comprendere almeno 8 caratteri'
                });
        }

        if (currentErrors.length > 0) {
            setErrors(currentErrors);
            setLoading(false);
            setLoadingMessage('')
            return;
        }

        let data = {
            email: mail.value.trim(),
            password: pass.value.trim()
        }

        try {
            // SALVATAGGIO TOKEN:
            // Attendiamo la risposta che contiene il token generato da Django
            const response = await log_in(data);

            // Salviamo il token nel localStorage per usarlo nelle chiamate future
            localStorage.setItem('token', response.data.token);

            // Salvataggio dell'username
            localStorage.setItem('user', response.data.username);

            navigate('/app');
        } catch (e) {
            if (e.response && e.response.data) {
                setBackendErrors(e.response.data);
            } else {
                console.error('ERRORE CRITICO: ', e);
            }
        }finally{
            setLoading(false);
            setLoadingMessage('')
        }
    }

    const getInputClass = (id) => {
        // Verifichiamo se l'ID del campo è presente in uno qualsiasi degli oggetti errore
        const isFrontendInvalid = errors.some(error =>
            error.fields.some(field => field.id === id)
        );

        const djangoFieldName = id === 'mail' ? 'email' : id;

        // Se il backend restituisce un errore generico (es. credenziali errate)
        // Django spesso lo mette in "error" o "non_field_errors"
        const isBackendInvalid = !!backendErrors[djangoFieldName] || !!backendErrors['error'];

        // CORREZIONE LOGICA: deve essere rosso SE frontend invalido OPPURE backend invalido
        const isInvalid = isFrontendInvalid || isBackendInvalid;

        return `w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-2 rounded-2xl transition-all outline-none 
        ${isInvalid
                ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10 animate-shake'
                : 'border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800'
            } text-slate-900 dark:text-white`;
        };

    const getErrorDetails = (id) => {
        const foundError = errors.find(error =>
            error.fields.some(field => field.id === id)
        );
        if (foundError) return foundError.message;

        const djangoFieldName = id === 'mail' ? 'email' : id;

        // Gestione errore specifico del campo o errore generico "error"
        if (backendErrors[djangoFieldName]) {
            return Array.isArray(backendErrors[djangoFieldName])
                ? backendErrors[djangoFieldName][0]
                : backendErrors[djangoFieldName];
        }

        // Se c'è un errore generico di login (es. credenziali sbagliate), lo mostriamo sotto la mail
        if (id === 'mail' && backendErrors['error']) {
            return backendErrors['error'];
        }

        return '';
    };

    return (
        <div>
            {loading && <LoadingOverlay message={loadingMessage}/>}
            <form id='loginForm' onSubmit={handleSubmit} className="space-y-6 w-105 max-w-sm mx-auto">
                <div className="flex flex-col gap-5">

                    {/* Email */}
                    <div className="relative group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-4">
                            Email
                        </label>
                        <input type="email" id='mail' className={getInputClass('mail')} placeholder="tua@email.com" />
                        <div className="mt-0 ml-3">
                            {getErrorDetails('mail') && (
                                <p className='text-[10px] p-1 px-2 font-semibold uppercase tracking-widest rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block animate-in fade-in slide-in-from-top-1'>
                                    {getErrorDetails('mail')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-4">
                            Password
                        </label>
                        <input type="password" id='passwd' className={getInputClass('passwd')} placeholder="••••••••" />
                        <div className="mt-0 ml-3">
                            {getErrorDetails('passwd') && (
                                <p className='text-[10px] p-1 px-2 font-semibold uppercase tracking-widest rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block animate-in fade-in slide-in-from-top-1'>
                                    {getErrorDetails('passwd')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className='text-xs text-center text-slate-500'>
                        Non hai un account? <Link to='/register' className='text-blue-500 font-bold hover:underline'>Iscriviti</Link>
                    </p>

                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white
                font-black uppercase tracking-widest text-sm rounded-2xl transition-all
                shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1
                active:scale-95 cursor-pointer">
                        Accedi
                    </button>
                </div>
                <div className='w-1/2 text-xs m-0'>
                    <Link to="/"
                          className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-slate-600 dark:text-white  hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Torna alla Home
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default Login;