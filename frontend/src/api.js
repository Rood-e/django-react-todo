import axios from "axios";
import toast from "react-hot-toast";

const baseurl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseurl,
    withCredentials: true, 
    xsrfCookieName: 'csrftoken', 
    xsrfHeaderName: 'X-CSRFToken', 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercettore Risposte (Logica Toast Centralizzata)
api.interceptors.response.use(
    (response) => {
        const method = response.config.method.toUpperCase();
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            const message = response.data?.message || "Operazione completata";
            toast.success(message);
        }
        return response;
    },
    (error) => {
        const status = error.response ? error.response.status : null;
        const data = error.response ? error.response.data : null; // Spostata qui per essere visibile ovunque sotto
        const isAppPath = window.location.pathname.startsWith('/app');

        if (status === 401 || status === 403) {
            // Si evita il reindirizzamento forzato se si controlla l'utente corrente
            const isCurrentUserCheck = error.config.url.includes('current-user') || error.config.url.includes('me');
            
            if (isAppPath && !isCurrentUserCheck) {
                toast.error("Sessione non valida o scaduta");
                // Invece di distruggere lo stato con window.location.href, svuota la sessione se necessario
                // o lascia che sia il sistema di rotte (ProtectedRoutes) a fare il redirect pulito.
                window.location.href = '/login';
            }
        }
        else if (status === 400 && data) {
            Object.keys(data).forEach((field) => {
                const messages = data[field];
                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        toast.error(`${field}: ${msg}`);
                    });
                } else if (typeof messages === 'string') {
                    toast.error(messages);
                }
            });
        }
        else if (status >= 500) {
            toast.error("Errore critico del server");
        }
        else {
            // Evita di mostrare l'errore generico se la richiesta è stata cancellata o se è un check silente
            if (!axios.isCancel(error)) {
                toast.error("Errore di connessione o autorizzazione mancante");
            }
        }

        return Promise.reject(error);
    }
);

// Intercettore di Richiesta: Estrae il cookie a mano e lo mette nell'header
api.interceptors.request.use(
    (config) => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const csrfToken = getCookie('csrftoken');

        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
