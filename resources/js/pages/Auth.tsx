import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";

const Auth: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        if (location.state && (location.state as any).isSignUp) {
            setIsSignUp(true);
        }
    }, [location]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (isSignUp) {
                if (password !== passwordConfirmation) {
                    setError("Passwords do not match!");
                    return;
                }
                await signUp(email, fullName, password, passwordConfirmation);
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            console.error("Auth error", err);

            // Extract a user-friendly error message if available
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError(
                    t(
                        "auth_invalid_credentials",
                        "Invalid credentials. Please try again.",
                    ),
                );
            } else {
                setError(
                    t(
                        "auth_generic_error",
                        "An error occurred. Please try again.",
                    ),
                );
            }
        }
    };

    const inputClasses =
        "w-full ps-12 pe-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl text-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white";
    const labelClasses =
        "text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block tracking-widest ms-1";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden transition-colors duration-200">
            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                    alt="Moroccan Architecture"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-transparent to-transparent" />
                <div className="relative z-10 p-16 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black text-xl shadow-xl">
                            I
                        </div>
                        <span className="text-2xl font-black tracking-tight">
                            {t("app_name")}
                        </span>
                    </div>

                    <div>
                        <h1 className="text-6xl font-black leading-tight mb-6">
                            {t("auth_visual_hero")}
                        </h1>
                        <p className="text-xl text-emerald-100/70 max-w-lg leading-relaxed font-medium">
                            {t("auth_visual_desc")}
                        </p>
                    </div>

                    <div className="flex gap-12 text-sm font-bold text-emerald-200/50 uppercase tracking-widest">
                        <div className="flex flex-col gap-1">
                            <span className="text-white text-lg font-black tracking-normal">
                                500+
                            </span>
                            <span>{t("agencies")}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white text-lg font-black tracking-normal">
                                2.4B
                            </span>
                            <span>{t("managed_mad")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
                <div className="absolute top-8 end-8">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md animate-fadeIn">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            {isSignUp ? t("auth_signup") : t("auth_login")}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {isSignUp
                                ? t("auth_signup_desc")
                                : t("auth_login_desc")}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isSignUp && (
                            <div className="animate-slideDown">
                                <label className={labelClasses}>
                                    {t("full_name")}
                                </label>
                                <div className="relative">
                                    <User
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                        size={18}
                                    />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ahmed El Mansouri"
                                        className={inputClasses}
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={labelClasses}>
                                {t("auth_email")}
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                    size={18}
                                />
                                <input
                                    required
                                    type="email"
                                    placeholder="contact@agence.ma"
                                    className={inputClasses}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                {t("auth_password")}
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                    size={18}
                                />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••••••"
                                    className={inputClasses}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="animate-slideDown">
                                <label className={labelClasses}>
                                    {t("auth_confirm")}
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                        size={18}
                                    />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••••••"
                                        className={inputClasses}
                                        value={passwordConfirmation}
                                        onChange={(e) =>
                                            setPasswordConfirmation(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {!isSignUp && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                                >
                                    {t("auth_forgot")}
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isSignUp ? t("auth_signup") : t("auth_login")}
                            <span className="rtl:rotate-180 transition-transform">
                                <ArrowRight size={20} />
                            </span>
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <span className="relative bg-slate-50 dark:bg-slate-900 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {t("or_continue_with")}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm">
                                <Chrome
                                    size={20}
                                    className="text-slate-700 dark:text-slate-300"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Google
                                </span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm">
                                <Github
                                    size={20}
                                    className="text-slate-700 dark:text-slate-300"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    GitHub
                                </span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {isSignUp ? t("already_member") : t("not_member")}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-emerald-600 dark:text-emerald-500 font-black hover:underline ms-1"
                        >
                            {isSignUp ? t("auth_login") : t("auth_signup")}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
