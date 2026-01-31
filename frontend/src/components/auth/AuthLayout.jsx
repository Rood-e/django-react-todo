import ThemeButton from "../ThemeButton.jsx";
import { MeshGradient } from '@paper-design/shaders-react';
import {useEffect, useState} from "react";

const lightColors = ["#FFFFFF", "#F0F9FF", "#3B82F6", "#DBEAFE"];
const darkColors = ["#142749", "#1549c5", "#3469a6", "#0e2160"];

function AuthLayout({children,isDark,setIsDark}) {
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setIsTransitioning(true);
        const timeout = setTimeout(() => setIsTransitioning(false), 200);
        return () => clearTimeout(timeout);
    }, [isDark]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-250">
            <div className="absolute inset-0 z-0">
                <MeshGradient
                    colors={isDark ? darkColors : lightColors}
                    distortion={0.5}
                    height={"100%"}  swirl={1}
                    offsetX={0.6}  scale={0.8}  speed={0.2}
                />
            </div>

            <div className={`absolute inset-0 z-1 transition-opacity duration-250 bg-white dark:bg-slate-950 ${isTransitioning ? 'opacity-100' : 'opacity-40'}`} />


            <div className='z-10'>
                <div className="absolute top-10 right-10">
                    <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
                </div>

                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-200 dark:border-slate-800 ">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black tracking-tight">Task<span className='text-blue-500'>Master</span></h2>
                    </div>
                    {children}
                </div>
            </div>


        </div>
    );
}

export default AuthLayout;