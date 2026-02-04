import ThemeButton from "../ThemeButton.jsx";
import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import {useState} from "react";

function AppLayout({isDark, setIsDark}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 ">
            <div className="fixed top-6 right-6 z-50">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            <div className="w-full h-dvh flex flex-row">
                <aside className="h-dvh">
                    <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
                </aside>

                {/* Sezione a destra: In base all'URL capisce cosa inserire */}
                <main className="w-full bg-white dark:bg-slate-900 p-10 shadow-sm">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout;