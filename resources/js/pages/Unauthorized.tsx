import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const Unauthorized: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-[2.5rem] text-red-600 dark:text-red-400 mb-8 shadow-xl shadow-red-200/50 dark:shadow-none">
                <ShieldAlert size={80} strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                Accès restreint
            </h1>

            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-md font-medium">
                Désolé, vous n'avez pas les permissions nécessaires pour accéder
                à cette page. Veuillez contacter votre administrateur si vous
                pensez qu'il s'agit d'une erreur.
            </p>

            <Link
                to="/"
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
            >
                <ArrowLeft size={20} />
                Retour au tableau de bord
            </Link>
        </div>
    );
};

export default Unauthorized;
