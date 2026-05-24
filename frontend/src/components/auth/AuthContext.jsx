import { createContext, useState, useEffect, useContext } from "react";
import api from "../../api.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await api.get('user/me/');

            if (res.data.authenticated) {
                setUser(res.data); // Salviamo i dati dell'utente loggato
            } else {
                setUser(null); // È un utente anonimo, nessun errore generato
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Sincronizzazione multi-finestra (rimane ottima)
    useEffect(() => {
        const syncTabs = (event) => {
            if (event.key === 'auth_session_token')
                window.location.reload();
        };
        window.addEventListener('storage', syncTabs);
        return () => window.removeEventListener('storage', syncTabs);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);