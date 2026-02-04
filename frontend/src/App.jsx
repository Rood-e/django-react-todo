import { Routes, Route } from 'react-router-dom';
import {useEffect, useState} from "react";

import Home from './components/Home/Home.jsx';
import LegalHub from './components/legal/LegalHub';
import PrivacyContent from "./components/legal/PrivacyContent.jsx";
import TermsContent from "./components/legal/TermsContent.jsx";
import ContactForm from './components/legal/ContactForm.jsx';
import AuthLayout from "./components/auth/AuthLayout.jsx";
import Register from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import Error404 from './components/Error404';
import Error401 from "./components/Error401.jsx";
import AppLayout from './components/app/AppLayout.jsx';

function App(){
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
                <Route path="/" element={<Home isDark={isDark} setIsDark={setIsDark}/>} />

                <Route path='/legal' element={<LegalHub isDark={isDark} setIsDark={setIsDark}/>}>
                    <Route path='privacy' element={<PrivacyContent/>}/>
                    <Route path='terms' element={<TermsContent/>}/>
                    <Route path='contact' element={<ContactForm/>}/>
                </Route>

                <Route path='/login' element={
                  <AuthLayout children={<Login/>} isDark={isDark} setIsDark={setIsDark}/>
                }/>

                <Route path='/register' element={
                  <AuthLayout children={<Register/>} isDark={isDark} setIsDark={setIsDark}/>
                }/>

                <Route path='/app' element={
                    <Error401>
                        <AppLayout isDark={isDark} setIsDark={setIsDark}>

                        </AppLayout>
                        {/*<AuthLayout isDark={isDark} setIsDark={setIsDark}>*/}
                        {/*    <PrivacyContent />*/}
                        {/*</AuthLayout>*/}
                    </Error401>
                }/>


                <Route path='*' element={<Error404/>}/>
            </Routes>
        </div>
    );
}

export default App;