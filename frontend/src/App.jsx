import { Routes, Route } from 'react-router-dom';
import {useState} from "react";

import Home from './components/Home/Home.jsx';
import LegalHub from './components/legal/LegalHub';
import PrivacyContent from "./components/legal/PrivacyContent.jsx";
import TermsContent from "./components/legal/TermsContent.jsx";
import ContactForm from './components/legal/ContactForm.jsx';
import AuthLayout from "./components/auth/AuthLayout.jsx";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import Settings from "./components/auth/AccountSettings.jsx";
import Error404 from './components/Error404';
import Error401 from "./components/Error401.jsx";
import AppLayout from './components/app/AppLayout.jsx';
import Dashboard from "./components/app/Dashboard.jsx";
import TaskDetail from "./components/app/TaskDetail.jsx";
import AppCalendar from "./components/app/types/AppCalendar.jsx";

import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/24/outline";
import {useAuth} from "./components/auth/AuthContext.jsx";
import {Toaster} from "react-hot-toast";
import LoadingOverlay from "./components/aesthetic/LoadingOverlay.jsx";

function App() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const { loading } = useAuth();

    if(loading)
        return <LoadingOverlay message={'Caricamento in corso...'}/>

    return (
        <div className={isDark ? 'dark' : ''}>
            {/* Alert Toaster */}
            <Toaster position="top-right"
                     toastOptions={{
                             className: 'rounded-xl p-4 font-medium text-sm flex items-center gap-3 border cursor-pointer select-none',
                             duration: 3000}}>
                {(t) => (
                    <div
                        className={`${
                            t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md bg-white dark:bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700`}
                        style={{
                            // Logica per il colore in base al tipo
                            borderLeft: t.type === 'success' ? '4px solid #10b981' : t.type === 'error' ? '4px solid #ef4444' : '4px solid #3b82f6'
                        }}
                    >
                        <div className="p-4 flex items-center gap-3">
                            {t.type === 'success' ? (
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            ) : (
                                <XCircleIcon className="w-6 h-6 text-red-500" />
                            )}
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {t.message}
                            </p>
                        </div>

                        {/* Barra di progresso animata */}
                        <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-700">
                            <div
                                className={`h-full ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{
                                    animation: `progress ${t.duration || 4000}ms linear forwards`
                                }}
                            />
                        </div>
                    </div>
                )}
            </Toaster>

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home isDark={isDark} setIsDark={setIsDark}/>} />

                <Route path='/legal' element={<LegalHub isDark={isDark} setIsDark={setIsDark}/>}>
                    <Route path='privacy' element={<PrivacyContent/>}/>
                    <Route path='terms' element={<TermsContent/>}/>
                    <Route path='contact' element={<ContactForm/>}/>
                </Route>

                <Route path='/login' element={
                    <AuthLayout isDark={isDark} setIsDark={setIsDark}><Login/></AuthLayout>
                }/>

                <Route path='/register' element={
                    <AuthLayout isDark={isDark} setIsDark={setIsDark}><Register/></AuthLayout>
                }/>

                {/* App Routes (Protette da Error401) */}
                <Route path='/app' element={
                    <Error401>
                        <AppLayout isDark={isDark} setIsDark={setIsDark} />
                    </Error401>
                }>
                    {/* /app */}
                    <Route index element={<Dashboard />} />
                    <Route path="trash" element={<Dashboard isTrashView={true} />} />

                    {/* /app/task/new o /app/task/123 */}
                    <Route path="task/:id" element={<TaskDetail />} />

                    <Route path="account" element={<Settings />} />

                    {/* Calendario */}
                     <Route path="calendar" element={<AppCalendar />} />
                </Route>

                {/* ERROR 404 */}
                <Route path='*' element={<Error404/>}/>
            </Routes>
        </div>
    );
}

export default App;