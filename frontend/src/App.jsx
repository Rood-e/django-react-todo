import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";

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
import TaskDetail from "./components/app/TaskDetail.jsx"; // Il nuovo componente ibrido

function App() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    return (
        <div className={isDark ? 'dark' : ''}>
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

                    {/* /app/task/new o /app/task/123 */}
                    <Route path="task/:id" element={<TaskDetail />} />

                    {/* Spostata qui per mantenere Sidebar e Layout */}
                    <Route path="account" element={<Settings />} />

                    {/* Futura rotta Calendario */}
                    {/* <Route path="calendar" element={<Calendar />} /> */}
                </Route>

                {/* Catch-all 404 */}
                <Route path='*' element={<Error404/>}/>
            </Routes>
        </div>
    );
}

export default App;