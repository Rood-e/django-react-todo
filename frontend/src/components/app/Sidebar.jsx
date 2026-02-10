import {Bars3Icon, CalendarDaysIcon, PlusIcon, ChevronDownIcon, Cog6ToothIcon} from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";

function Sidebar({isOpen,setIsOpen}) {

    return (
        <div className={`min-h-screen border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 justify-between transition-all duration-500 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>

            <div className="overflow-hidden">
                {/* Hamburger */}
                <div className="mb-8 flex items-center h-12">
                    <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-12' : 'w-full'}`}>
                        <div className="cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                             onClick={() => setIsOpen(!isOpen)}>
                            <Bars3Icon className="h-8 w-8 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Bottone Nuovo + */}
                <div className="mb-8 relative h-12 flex items-center">
                    {/* Versione Estesa */}
                    <div className={`absolute inset-0 flex items-center transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                        <button className="flex-1 h-full bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-l-xl py-2 px-4 font-bold flex items-center justify-between whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Nuovo +
                        </button>
                        <button className="h-full bg-white dark:bg-slate-900 border-2 border-l-0 border-slate-900 dark:border-white rounded-r-xl py-2 px-3 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ChevronDownIcon className="w-5 h-5 text-slate-900 dark:text-white stroke-[2.5]" />
                        </button>
                    </div>

                    {/* Versione Ridotta */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${!isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                        <button className="h-12 w-12 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition-all">
                            <PlusIcon className="w-6 h-6 stroke-3" />
                        </button>
                    </div>
                </div>

                {/* Voce Calendario */}
                <div className="flex items-center h-12 text-slate-600 dark:text-slate-400 cursor-pointer mb-6 group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl">
                    <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-12' : 'w-full'}`}>
                        <div className="p-2 rounded-xl transition-all">
                            <CalendarDaysIcon className="w-7 h-7 min-w-7 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                    <span className={`font-bold transition-all duration-500 whitespace-nowrap overflow-hidden group-hover:text-blue-600 dark:group-hover:text-blue-400 ${isOpen ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0'}`}>
                        Calendario
                    </span>
                </div>

                {/* Liste decorative */}
                <div className={`space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6 transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                    <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded-full ml-4"></div>
                    <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded-full ml-4"></div>
                </div>
            </div>

            <div className={'flex flex-col gap-1'}>
                <Link to={'/app/account'}>
                    <div className="flex items-center h-12 text-slate-500 dark:text-slate-400 cursor-pointer group ìhover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl ">
                        <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-12' : 'w-full'}`}>
                            <div className="p-2 rounded-xl transition-all">
                                <Cog6ToothIcon className="w-7 h-7 min-w-7 group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                        </div>
                        <span className={`font-medium transition-all duration-500 whitespace-nowrap overflow-hidden group-hover:text-slate-900 dark:group-hover:text-white ${isOpen ? 'max-w-xs opacity-100 ml-2' : 'max-w-0 opacity-0'}`}>
                            Impostazioni
                        </span>
                    </div>
                </Link>
                {/* Brand */}
                <div className="h-12 flex items-center overflow-hidden border-t border-slate-100 dark:border-slate-800">
                    <Link to={'/'} className="flex items-center w-full group hover:scale-105 transition-transform duration-300 origin-left">
                        <div className={`flex items-center justify-center transition-all duration-500 ${isOpen ? 'w-12' : 'w-full'}`}>
                            <span className="text-blue-600 text-3xl font-black">T</span>
                        </div>
                        <div className={`transition-all duration-500 whitespace-nowrap overflow-hidden -ml-3.5 mt-1 ${isOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                            <span className="text-slate-900 dark:text-white font-black text-2xl">askMaster</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;