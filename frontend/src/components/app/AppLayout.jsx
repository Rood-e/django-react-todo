import ThemeButton from "../ThemeButton.jsx";
import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import {useEffect, useState} from "react";

import api from "../../api.js";

function AppLayout({isDark, setIsDark}) {
    const [isOpen, setIsOpen] = useState(false);
    const [tasks,setTasks] = useState([]);

    useEffect( () => {
        let initTasks = async () => {
            try {
                const tasksRes = await api.get(`tasks/`);
                setTasks(tasksRes.data);
            } catch (error) {}
        }
        initTasks();
    },[]);

    // useEffect(() => {
    //     console.log(tasks)
    // }, [tasks])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 ">
            <div className="fixed top-6 right-6 z-100">
                <ThemeButton isDark={isDark} setIsDark={setIsDark}/>
            </div>

            <div className="w-full h-dvh flex flex-row">

                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} tasks={tasks}/>

                {/* Sezione a destra: In base all'URL capisce cosa inserire */}
                <main className="flex-1  w-full bg-white dark:bg-slate-900 p-10 shadow-sm overflow-hidden">
                    <Outlet context={{ appTasks: tasks }}/>
                </main>
            </div>
        </div>
    )
}

export default AppLayout;