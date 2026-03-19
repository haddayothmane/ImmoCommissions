import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Globe,
    Crown,
    Map,
    Building2,
    UserCheck,
    Home,
    FileText,
    ShieldCheck,
    Coins,
    Percent,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Layout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, employee, agency, permissions, signOut } = useAuth();
    const location = useLocation();

    const toggleLanguage = () => {
        const next = i18n.language === "fr" ? "ar" : "fr";
        i18n.changeLanguage(next);
        localStorage.setItem("lang", next);
    };

    const navItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: t("dashboard"),
            path: "/dashboard",
        },
        {
            icon: <Map size={20} />,
            label: t("terrains"),
            path: "/dashboard/inventory",
        },
        {
            icon: <Building2 size={20} />,
            label: t("immeubles"),
            path: "/dashboard/immeubles",
        },
        {
            icon: <Home size={20} />,
            label: t("appartements"),
            path: "/dashboard/appartements",
        },
        {
            icon: <FileText size={20} />,
            label: t("contracts"),
            path: "/dashboard/contracts",
        },
        {
            icon: <Coins size={20} />,
            label: t("paiements", "Paiements"),
            path: "/dashboard/paiements",
        },
        {
            icon: <Percent size={20} />,
            label: t("commissions", "Commissions"),
            path: "/dashboard/commissions",
        },
        {
            icon: <UserCheck size={20} />,
            label: t("clients"),
            path: "/dashboard/clients",
        },
        {
            icon: <Users size={20} />,
            label: t("employees"),
            path: "/dashboard/employees",
            permission: "manage_users",
        },
        {
            icon: <ShieldCheck size={20} />,
            label: t("roles_permissions", "Rôles & Permissions"),
            path: "/dashboard/roles",
            role: "admin",
        },
        {
            icon: <Settings size={20} />,
            label: t("settings"),
            path: "/dashboard/settings",
        },
    ];

    const filteredNavItems = navItems.filter((item) => {
        if (item.role && user?.role?.slug !== item.role) return false;
        if (item.permission && !permissions.includes(item.permission))
            return false;
        return true;
    });

    const isRtl = i18n.language === "ar";

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-e border-border flex flex-col">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                        I
                    </div>
                    <span className="font-bold text-xl text-emerald-900 tracking-tight">
                        {t("app_name")}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                location.pathname === item.path ||
                                (item.path !== "/" &&
                                    location.pathname.startsWith(item.path))
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="mb-4 bg-primary/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold mb-1">
                            <Crown size={14} />
                            <span>
                                {t("plan_label")}{" "}
                                {agency?.plan_type?.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-emerald-600/70">
                            {t("plan_valid_until")} 31/12/2025
                        </p>
                    </div>

                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{t("logout")}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            {agency?.name}
                        </h2>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold rounded uppercase">
                            {user?.role?.name || "User"}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium"
                        >
                            <Globe size={18} />
                            {i18n.language === "fr" ? "العربية" : "Français"}
                        </button>
                        <div className="flex items-center gap-3 ps-6 border-s border-border">
                            <div className="text-end">
                                <p className="text-sm font-semibold text-foreground">
                                    {employee?.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {employee?.email}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">
                                {employee?.full_name?.charAt(0) || "U"}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
