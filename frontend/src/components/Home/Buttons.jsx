import {Link} from "react-router-dom";
import {useAuth} from "../auth/AuthContext.jsx";

/* Pulsanti di accesso/registrazione */
function Buttons() {
    const {user,loading} = useAuth();

    if(loading)
        return <></>

    if(user)
        return (
            <Link to={`/app`} className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-black
               uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20
               hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"> All'area personale &rarr; </Link>
        )

    return (<div>
        <Link to="/login"  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400
               hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Accedi
        </Link>

        <Link to="/register" className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-black
               uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20
               hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all">
            Crea Account
        </Link>
    </div>)
}

export default Buttons;