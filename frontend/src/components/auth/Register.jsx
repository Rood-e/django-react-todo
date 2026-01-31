import {Link, useNavigate} from 'react-router-dom';
import {useState} from "react";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import api from "../../api.js";

const sendRegistration = async (data,navigate) => {
    try {
        let response = await api.post('/register/', data)
        navigate('/login')
    }
    catch(e) {
        console.error("Errore dal backend:", e.response.data);
        alert("Errore: " + JSON.stringify(e.response.data));
    }
}

function Register(){
    const [errors, setErrors] = useState([]); // Array degli ID campi non validi
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]); // Reset errori

        const name = document.getElementById('username');
        const mail = document.getElementById('mail');
        const pass = document.getElementById('passwd');
        const confirm = document.getElementById('confirm_p');
        const terms = document.getElementById('terms');

        const currentErrors = [];

        // Validazione
        if(!name.value.trim())
            currentErrors.push({
                'fields': [name],
                'message': 'Inserire un nome valido'
            });
        else if (name.value.trim().length < 2)
            currentErrors.push({
                'fields': [name],
                'message': 'Lunghezza nome invalida'
            });

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

            if (pass.value.trim() !== confirm.value.trim() || !confirm.value)
                currentErrors.push({
                    'fields': [pass,confirm],
                    'message': 'I campi devono essere uguali'
                });
        }

        if (!terms.checked)
            currentErrors.push({
                'fields': [terms],
                'message': 'É necessario accettare i Termini e Privacy'
            });

        if (currentErrors.length > 0) {
            setErrors(currentErrors);
            return;
        }

        let data = {
            username: name.value.trim(),
            email: mail.value.trim(),
            password: pass.value.trim(),
        }


        sendRegistration(data,navigate);
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
        <form id='registerForm' onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
                <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-4">Nome</label>
                    <input type="text" id='username' className={getInputClass('username')} placeholder="Il tuo nome"/>
                    {
                        getErrorDetails('name') && (<p className='text-[10px] ml-3 p-1 font-semibold uppercase tracking-wider
                            rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block'>{getErrorDetails('username')}</p>)
                    }
                </div>

                <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-4">Email</label>
                    <input type="email" id='mail' className={getInputClass('mail')} placeholder="tua@email.com" />
                    {
                        getErrorDetails('mail') && (<p className='text-[10px] ml-3 p-1 font-semibold uppercase tracking-wider
                            rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block'>{getErrorDetails('mail')}</p>)
                    }
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-4">Password</label>
                        <input type="password" id='passwd' className={getInputClass('passwd')} placeholder="••••••••" />
                        {
                            getErrorDetails('passwd') && (<p className='text-[10px] ml-1 p-1 font-semibold uppercase tracking-wider
                            rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block'>{getErrorDetails('passwd')}</p>)
                        }
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 ml-3">Conferma</label>
                        <input type="password" id='confirm_p' className={getInputClass('confirm_p')} placeholder="••••••••" />
                        {
                            getErrorDetails('confirm_p') && (<p className='text-[10px] ml-1 p-1 font-semibold uppercase tracking-wider
                            rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 inline-block'>{getErrorDetails('confirm_p')}</p>)
                        }
                    </div>
                </div>

                <div className={`flex flex-col gap-2 p-2 rounded-2xl transition-all ${getErrorDetails('terms') ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <div className="flex items-start gap-3">
                        <div className="flex items-center h-5">
                            <input
                                type="checkbox"
                                id="terms"
                                className={`w-5 h-5 rounded border-2 transition-all cursor-pointer ${
                                    getErrorDetails('terms')
                                        ? 'border-red-500 text-red-600'
                                        : 'border-slate-300 dark:border-slate-700 text-blue-600'
                                }`}
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 leading-tight cursor-pointer">
                            Accetto i <Link to='/legal/terms' className='text-blue-500 font-medium'>Termini</Link> e la <Link to='/legal/privacy' className='text-blue-500 font-medium'>Privacy Policy</Link>
                        </label>
                    </div>

                    {/* Messaggio d'errore specifico per la checkbox */}
                    {getErrorDetails('terms') && (
                        <p className='text-[10px] ml-8 font-bold uppercase text-red-600 dark:text-red-400'>
                            {getErrorDetails('terms')}
                        </p>
                    )}
                </div>
            </div>

            <p className={'text-xs text-center text-slate-500'}> Hai già un account? <Link to={'/login'} className={'text-blue-500 font-bold hover:underline'}> Accedi </Link> </p>

            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white
                font-black uppercase tracking-widest text-sm rounded-2xl transition-all
                shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1
                active:scale-95 cursor-pointer">
                Crea nuovo account
            </button>
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