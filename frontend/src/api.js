import axios from "axios";
import toast from "react-hot-toast";

const baseurl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseurl,
    withCredentials: true, // per l'invio ricezione dei cookie
    xsrfCookieName: 'csrftoken', // nome del cookie
    xsrfHeaderName: 'X-CSRFToken', // header che Django aspetta di ricevere
    headers: {
        'Content-Type': 'application/json',
    }
})

// Intercettore Risposte (Logica Toast Centralizzata)
api.interceptors.response.use(
    (response) => {
        const method = response.config.method.toUpperCase();
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            // Usa il messaggio del backend o uno di default
            const message = response.data?.message || "Operazione completata";
            toast.success(message);
        }
        return response;
    },
    (error) => {
        const status = error.response ? error.response.status : null;
        const isAppPath = window.location.pathname.startsWith('/app')

        if (status === 401 || status === 403) {
            if(isAppPath){
                toast.error("Sessione non valida o scaduta");
                window.location.href = '/login';
            }
        }
        else if (status === 400 && data) {
            const data = error.response ? error.response.data : null;

            Object.keys(data).forEach((field) => {
                const messages = data[field];
                // Se il campo è 'categories' e l'errore è dovuto alla mancanza,
                // possiamo decidere di ignorarlo o mostrare un messaggio specifico.
                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        toast.error(msg);
                    });
                }
            });
        }
        else if (status >= 500)
            toast.error("Errore critico del server");
        else
            toast.error("Errore di connessione");

        return Promise.reject(error);
    }
);

// Intercettore di Richiesta: Estrae il cookie a mano e lo mette nell'header
api.interceptors.request.use(
    (config) => {
        // Funzione rapida per leggere un cookie specifico da JS
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const csrfToken = getCookie('csrftoken');

        if (csrfToken)
            config.headers['X-CSRFToken'] = csrfToken;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;