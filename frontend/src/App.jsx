import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Error404 from './components/Error404';

import LegalHub from './components/legal/LegalHub';
import PrivacyContent from "./components/legal/PrivacyContent.jsx";
import TermsContent from "./components/legal/TermsContent.jsx";
import ContactForm from './components/legal/ContactForm.jsx';
import {useEffect, useState} from "react";

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

                {/*<Route path='/app' element={<TaskMaster/>}/>*/}

                <Route path='*' element={<Error404/>}/>
            </Routes>
        </div>
    );
}

export default App;