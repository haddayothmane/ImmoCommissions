import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { User, Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";

const Settings: React.FC = () => {
    const { employee, user } = useAuth();
    const { t } = useTranslation();

    // Profile State
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || employee?.email || "");
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileError, setProfileError] = useState("");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileUpdating(true);
        setProfileSuccess("");
        setProfileError("");

        try {
            const response = await axios.put("/api/profile", {
                name,
                email,
            });
            setProfileSuccess(t("profile_updated"));
            // optionally reload or update context here
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setProfileError(error.response?.data?.message || t("update_error"));
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordUpdating(true);
        setPasswordSuccess("");
        setPasswordError("");

        if (newPassword !== confirmPassword) {
            setPasswordError(t("passwords_dont_match"));
            setIsPasswordUpdating(false);
            return;
        }

        try {
            await axios.put("/api/password", {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setPasswordSuccess(t("password_updated"));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setPasswordError(
                error.response?.data?.message || t("password_update_error"),
            );
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    {t("profile_settings")}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t("settings_desc")}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Form */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                            {t("personal_info")}
                        </h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        {profileSuccess && (
                            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                {profileSuccess}
                            </div>
                        )}
                        {profileError && (
                            <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm">
                                {profileError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t("full_name")}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t("auth_email")}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isProfileUpdating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isProfileUpdating ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {t("save")}
                        </button>
                    </form>
                </div>

                {/* Password Form */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
                            <Lock size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                            {t("security")}
                        </h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        {passwordSuccess && (
                            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm">
                                {passwordError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t("current_password")}
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t("new_password")}
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t("auth_confirm")}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPasswordUpdating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50 mt-2"
                        >
                            {isPasswordUpdating ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Lock size={18} />
                            )}
                            {t("update_password")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
