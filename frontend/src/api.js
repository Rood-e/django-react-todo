import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token)
            config.headers.Authorization = `Token ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
        const data = error.response ? error.response.data : null;

        if (status === 401) {
            toast.error("Sessione scaduta");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        else if (status === 400 && data) {
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

export default api;