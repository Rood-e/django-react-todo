import { Link } from 'react-router-dom';
import {useState} from "react";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";

function Register(){
    const [errors, setErrors] = useState([]); // Array degli ID campi non validi

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]); // Reset errori

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
                    'message': 'Il campo "password" deve comprendere almeno 8 caratteri'
                });
        }

        if (currentErrors.length > 0) {
            setErrors(currentErrors);
            return;
        }

        console.log("Invio dati a Django...");
    }

    const getInputClass = (id) => {
        // Verifichiamo se l'ID del campo è presente in uno qualsiasi degli oggetti errore
        const isInvalid = errors.some(error =>
            error.fields.some(field => field.id === id)
        );

        return `w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-2 rounded-2xl transition-all outline-none 
        ${isInvalid
                ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10 animate-shake'
                : 'border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800'
            } text-slate-900 dark:text-white`;
        };

    const getErrorDetails = (id) => {
        if (errors.length === 0) return '';

        // Cerchiamo l'errore che contiene il campo con l'ID fornito
        const foundError = errors.find(error =>
            error.fields.some(field => field.id === id)
        );

        // Se lo trova, restituisce il messaggio, altrimenti stringa vuota
        return foundError ? foundError.message : '';
    };

    return (
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
    )
}

export default Register;