import {ArrowPathIcon, DocumentTextIcon, ListBulletIcon, TrashIcon} from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";

function TaskCard({ task, isTrashView }) {
    return (
        <Link to={`/app/task/${task.id}`} key={task.id} className="block group">
            <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border-b-4 hover:border-blue-500">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isTrashView ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        {isTrashView ? (
                            <TrashIcon className="w-5 h-5 text-red-500" />
                        ) : (
                            task.type === 'note' ?
                                <DocumentTextIcon className="w-5 h-5 text-blue-500" /> :
                                <ListBulletIcon className="w-5 h-5 text-blue-500"/>
                        )}
                    </div>
                    <div>
                        <h3 className={`font-bold text-slate-900 dark:text-white transition-colors ${isTrashView ? 'group-hover:text-red-500' : 'group-hover:text-blue-600'}`}>
                            {task.title || "Senza titolo"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {isTrashView ? "Sola lettura" : `Modificato: ${new Date(task.updated_at).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                {/* Badge di stato o di eliminazione */}
                <div className="flex items-center gap-3">
                    {
                        isTrashView && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1 bg-amber-100 text-amber-600 dark:bg-amber-900/30 rounded-full">
                                <ArrowPathIcon className="w-3 h-3" /> Cestinato
                            </span>
                        )
                    }
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full 
                        ${  
                            task.status === 'completed'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                        {
                            task.status === 'tostart' ? 'Da Iniziare' :
                            task.status === 'progress' ? 'In Corso' :
                            task.status === 'pending' ? 'In Sospeso' :
                            task.status === 'completed' ? 'Completata' : task.status
                        }
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default TaskCard;