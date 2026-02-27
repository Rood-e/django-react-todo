import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../../api.js";

import {KeyIcon, UserCircleIcon, ArrowLeftIcon, ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import LoadingOverlay from '../aesthetic/LoadingOverlay.jsx'
import DeletionModal from "../aesthetic/DeletionModal.jsx";

function Settings(){
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        current_password: '',
        new_password: ''
    });

    // Stato per gli errori specifici dei campi
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('user/');
                setFormData(prev => ({ ...prev, username: res.data.username, email: res.data.email }));
            } catch (err) {
                console.error("Errore caricamento dati", err);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Pulisce l'errore del campo mentre l'utente scrive
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setFieldErrors({}); // Resetta errori precedenti
        setLoadingMessage('Salvataggio in corso...');
        setLoading(true);

        try {
            let response = await api.put('user/update/', formData);
            localStorage.setItem('user', formData.username);
            setMessage({ type: 'success', text: response.data.message });
            // Puliamo le password dopo il successo
            setFormData(prev => ({ ...prev, current_password: '', new_password: '' }));
        } catch (err) {
            if (err.response?.status === 400) {
                const backendErrors = err.response.data;
                if (backendErrors.error)
                    setMessage({ type: 'error', text: backendErrors.error });
                else {
                    // errori dei campi (email già presa, etc)
                    setFieldErrors(backendErrors);
                    setMessage({ type: 'error', text: 'Controlla i dati inseriti.' });
                }
            } else {
                setMessage({ type: 'error', text: 'Errore imprevisto del server.' });
            }
        } finally {
            setLoading(false);
            setLoadingMessage('');
            setTimeout(() => { setMessage({ type: '', text: '' }) }, 8000);
        }
    };

    const deleteUser = async () => {
        setLoadingMessage('Eliminazione account...');
        setLoading(true);
        try {
            await api.delete('user/delete/');
            localStorage.clear();
            navigate('/');
        } catch (err) {
            setMessage({ type: 'error', text: 'Errore durante l\'eliminazione.' });
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className='relative min-h-screen'>
            {loading && <LoadingOverlay message={loadingMessage}/>}

            <div className={`max-w-4xl m-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${showDeleteModal ? 'blur-sm pointer-events-none' : ''}`}>
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Impostazioni <span className="text-blue-600">Profilo</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestisci le tue informazioni personali.</p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sezione Dati Personali */}
                    <div className="space-y-6 bg-slate-100 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
                        <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                            <UserCircleIcon className="w-5 h-5" /> Informazioni Base
                        </h2>

                        <div>
                            <label className="block text-xs font-bold mb-1 ml-2 text-slate-500 uppercase">Username</label>
                            <input name="username" value={formData.username} onChange={handleChange}
                                   className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all text-slate-900 dark:text-white 
                                   ${fieldErrors.username ? 'border-red-500 shadow-red-500/30' : 'border-transparent focus:border-blue-500 focus:hover:shadow-blue-500/30'} hover:shadow-md dark:hover:shadow-blue-500/20`}/>
                            {fieldErrors.username && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{fieldErrors.username[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1 ml-2 text-slate-500 uppercase">Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange}
                                   className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all text-slate-900 dark:text-white 
                                   ${fieldErrors.email ? 'border-red-500 dark:hover:shadow-blue-500/10' : 'border-transparent focus:border-blue-500 focus:hover:shadow-blue-500/30'} hover:shadow-md dark:hover:shadow-blue-500/20`} />
                            {fieldErrors.email && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{fieldErrors.email[0]}</p>}
                        </div>
                    </div>

                    {/* Sezione Sicurezza */}
                    <div className="space-y-6 bg-slate-100 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
                        <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                            <KeyIcon className="w-5 h-5" /> Sicurezza
                        </h2>

                        <div>
                            <label className="block text-xs font-bold mb-1 ml-2 text-slate-500 uppercase">Nuova Password</label>
                            <input name="new_password" type="password" placeholder="Lascia vuoto per non cambiare" onChange={handleChange}
                                   className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 focus:hover:shadow-orange-500/30 rounded-2xl
                                                outline-none transition-all text-slate-900 dark:text-white hover:shadow-md dark:hover:shadow-orange-500/10" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1 ml-2 text-slate-500 uppercase">Password Corrente</label>
                            <input name="current_password" type="password" required onChange={handleChange} value={formData.current_password}
                                   className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-orange-500/30 focus:border-orange-500 focus:hover:shadow-orange-500/30 rounded-2xl
                                                outline-none transition-all text-slate-900 dark:text-white hover:shadow-md dark:hover:shadow-orange-500/10" />
                            <p className="text-[10px] mt-2 ml-2 text-slate-400 font-medium">Necessaria per confermare le modifiche.</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`md:col-span-2 p-4 rounded-2xl font-bold text-center animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="md:col-span-2 flex justify-between gap-4">
                        <div>
                            <Link to="/app" className="flex items-center gap-3 px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400
                                            font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                                <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
                            </Link>
                        </div>

                        <div>
                            <button type="submit" className="mx-2 px-8 py-4 bg-blue-600 hover:cursor-pointer hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                Salva Modifiche
                            </button>

                            <button onClick={ () => setShowDeleteModal(true) } type="button" className="px-8 py-4 bg-red-600 hover:cursor-pointer hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                Elimina Profilo
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <DeletionModal  showModal={showDeleteModal} setShowModal={setShowDeleteModal}
                            icon={ExclamationTriangleIcon} action={deleteUser} title={'Sei sicuro?'}
                            description={'Questa azione è irreversibile. Tutti i tuoi dati verranno persi.'}/>
        </div>
    );
}

export default Settings;