import {useEffect,useState} from "react";
import { MeshGradient } from '@paper-design/shaders-react';

const lightColors = ["#FFFFFF", "#F0F9FF", "#3B82F6", "#DBEAFE"];
const darkColors = ["#142749", "#1549c5", "#3469a6", "#0e2160"];

function HeroSection({isDark}) {

    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setIsTransitioning(true);
        const timeout = setTimeout(() => setIsTransitioning(false), 200);
        return () => clearTimeout(timeout);
    }, [isDark]);

    return (
        <section className="relative min-h-[calc(110vh)] w-full flex items-center overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-200">

            <div className="absolute inset-0 z-0">
                <MeshGradient
                    colors={isDark ? darkColors : lightColors}
                    distortion={0.5}
                    height={"110%"}  swirl={1}
                    offsetX={0.6}  scale={0.8}  speed={0.2}
                />
            </div>

            <div className={`absolute inset-0 z-1 transition-opacity duration-500 bg-white dark:bg-slate-950 ${isTransitioning ? 'opacity-100' : 'opacity-40'}`} />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-10" style={{'marginTop': '-10vh'}}>
                <div className="max-w-2xl text-left">
                    <h1 className="text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Task<span className="text-blue-600">Master</span>
                    </h1>
                    <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
                        Organizza la tua giornata, una task alla volta.
                    </p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-5" />
        </section>
    )
}
export default HeroSection;