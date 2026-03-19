// immocommissions/resources/js/pages/Employees.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import {
    Mail,
    ShieldCheck,
    MoreVertical,
    UserPlus,
    KeyRound,
    UserX,
    X,
    User,
    Shield,
    ChevronRight,
} from "lucide-react";
import type { Employee, Role } from "../types";

interface FormState {
    name: string;
    email: string;
    role: Role;
}

/**
 * Employees page – API driven.
 *
 *   * GET    /api/employees           → list employees (filtered by agency)
 *   * POST   /api/employees           → create employee (returns plain password)
 *   * PUT    /api/employees/{id}      → update role / activation
 *   * DELETE /api/employees/{id}      → delete employee
 *
 * All actions are guarded by the `admin` role via the UserPolicy.
 */
const Employees: React.FC = () => {
    const { t } = useTranslation();
    const { user, agency } = useAuth(); // authenticated admin (has role & agence_id) + agency for plan limits
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showPassword, setShowPassword] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "agent" as string,
    });

    // -------------------------------------------------------------------------
    // Fetch employees – runs once on mount and after any mutation
    // -------------------------------------------------------------------------
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get<Employee[]>("/api/employees");
            setEmployees(data);
        } catch (err) {
            console.error(t("error_loading_employees"), err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role?.slug === "admin") {
            fetchEmployees();
        }
    }, [user]);

    // -------------------------------------------------------------------------
    // Create employee – generates a password on the backend and returns it once
    // -------------------------------------------------------------------------
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
                active: true,
            };
            const { data } = await axios.post("/api/employees", payload);
            // Append the newly created employee to the list
            setEmployees((prev) => [...prev, data.employee]);
            setShowPassword(data.plain_password);
            // reset form
            setForm({ name: "", email: "", role: "agent" });
            setShowAdd(false);
        } catch (err) {
            console.error(t("error_creating_employee"), err);
        }
    };

    // -------------------------------------------------------------------------
    // Delete employee
    // -------------------------------------------------------------------------
    const handleDelete = async (id: string) => {
        if (!window.confirm(t("confirm_delete_employee"))) return;
        try {
            await axios.delete(`/api/employees/${id}`);
            setEmployees((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            console.error(t("error_deleting_employee"), err);
        }
    };

    // -------------------------------------------------------------------------
    // Toggle activation status
    // -------------------------------------------------------------------------
    const toggleActive = async (emp: Employee) => {
        try {
            const { data } = await axios.put(`/api/employees/${emp.id}`, {
                active: !emp.active,
            });
            setEmployees((prev) =>
                prev.map((e) => (e.id === emp.id ? data : e)),
            );
        } catch (err) {
            console.error(t("error_toggling_active"), err);
        }
    };

    // -------------------------------------------------------------------------
    // Update role (simple inline select)
    // -------------------------------------------------------------------------
    const changeRole = async (emp: Employee, newRole: any) => {
        try {
            const { data } = await axios.put(`/api/employees/${emp.id}`, {
                role: newRole,
            });
            setEmployees((prev) =>
                prev.map((e) => (e.id === emp.id ? data : e)),
            );
        } catch (err) {
            console.error(t("error_changing_role"), err);
        }
    };

    // -------------------------------------------------------------------------
    // UI helpers
    // -------------------------------------------------------------------------
    const copyPassword = async () => {
        if (showPassword) {
            await navigator.clipboard.writeText(showPassword);
            alert(t("password_copied"));
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    if (!user || user.role?.slug !== "admin") {
        return <p>{t("access_denied")}</p>;
    }

    const limits = {
        used: employees.length,
        max: agency?.plan_type === "pro" ? 10 : 3,
    };
    const limitReached = limits.used >= limits.max;

    return (
        <div className="space-y-8 animate-fadeIn relative">
            {/* Header & Add button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("employees")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("manage_team_access")}
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    disabled={limitReached}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                        limitReached
                            ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                    }`}
                >
                    <UserPlus size={20} />
                    {t("add_employee")}
                </button>
            </div>

            {/* Plan usage card */}
            <div className="bg-card p-8 rounded-3xl border border-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="font-black text-foreground text-lg">
                            {t("plan_usage")}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            {t("plan_allows", {
                                plan: agency?.plan_type,
                                max: limits.max,
                            })}
                        </p>
                    </div>
                </div>
                <div className="text-end flex flex-col items-end gap-3">
                    <div className="text-sm font-black text-foreground tracking-widest">
                        <span
                            className={
                                limitReached
                                    ? "text-orange-500"
                                    : "text-emerald-600"
                            }
                        >
                            {limits.used}
                        </span>{" "}
                        / {limits.max} {t("users")}
                    </div>
                    <div className="w-64 h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                        <div
                            className={`h-full transition-all duration-1000 rounded-full ${
                                limitReached
                                    ? "bg-orange-500"
                                    : "bg-emerald-500 shadow-sm"
                            }`}
                            style={{
                                width: `${Math.min((limits.used / limits.max) * 100, 100)}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {limitReached && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-5 rounded-2xl flex items-center justify-between animate-slideDown shadow-sm">
                    <div className="flex items-center gap-3 text-orange-700 dark:text-orange-400">
                        <ShieldCheck size={20} />
                        <p className="text-sm font-bold">
                            {t("plan_limit_reached")}
                        </p>
                    </div>
                    <button className="px-5 py-2.5 bg-background text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all shadow-sm">
                        {t("upgrade")}
                    </button>
                </div>
            )}

            {/* Employees Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-start">
                    <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                        <tr>
                            <th className="px-8 py-5">{t("collaborator")}</th>
                            <th className="px-8 py-5">{t("role")}</th>
                            <th className="px-8 py-5">{t("status")}</th>
                            <th className="px-8 py-5 text-end">
                                {t("actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {employees.map((emp) => (
                            <tr
                                key={emp.id}
                                className="hover:bg-muted/50 transition-colors group"
                            >
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground font-black border border-border group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-all">
                                            {emp.full_name?.charAt(0) ??
                                                emp.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm">
                                                {emp.full_name}
                                            </p>
                                            <p className="text-[11px] font-black text-muted-foreground flex items-center gap-1.5 mt-0.5 tracking-wider">
                                                <Mail
                                                    size={12}
                                                    className="text-emerald-500"
                                                />
                                                {emp.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <select
                                        value={
                                            emp.role?.slug || (emp.role as any)
                                        }
                                        onChange={(e) =>
                                            changeRole(emp, e.target.value)
                                        }
                                        className="bg-card text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest border border-border p-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        <option value="admin">
                                            {t("admin")}
                                        </option>
                                        <option value="agent">
                                            {t("agent")}
                                        </option>
                                        <option value="comptable">
                                            {t("accountant")}
                                        </option>
                                    </select>
                                </td>
                                <td className="px-8 py-5">
                                    {emp.active ? (
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
                                            {t("active")}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                                            {t("inactive")}
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-end">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button
                                            title={t("reset_password")}
                                            onClick={async () => {
                                                // Trigger password reset – backend not implemented here,
                                                // you could call a dedicated endpoint.
                                            }}
                                            className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm transition-all"
                                        >
                                            <KeyRound size={18} />
                                        </button>
                                        <button
                                            title={
                                                emp.active
                                                    ? t("deactivate")
                                                    : t("activate")
                                            }
                                            onClick={() => toggleActive(emp)}
                                            className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 shadow-sm transition-all"
                                        >
                                            {emp.active ? (
                                                <UserX size={18} />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            title={t("delete")}
                                            className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 shadow-sm transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/50">
                            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                                <UserPlus className="text-emerald-500" />
                                {t("add_employee")}
                            </h2>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="p-2.5 hover:bg-muted text-muted-foreground rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreate}
                            className="p-10 space-y-6"
                        >
                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-black text-muted-foreground uppercase mb-1.5 block tracking-widest">
                                    {t("full_name")}
                                </label>
                                <div className="relative">
                                    <User
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        required
                                        type="text"
                                        placeholder={t("full_name_label")}
                                        className="w-full ps-11 pe-4 py-3.5 bg-muted border border-border rounded-2xl text-sm focus:bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none placeholder:text-muted-foreground text-foreground"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[11px] font-black text-muted-foreground uppercase mb-1.5 block tracking-widest">
                                    {t("email_professional")}
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        size={18}
                                    />
                                    <input
                                        required
                                        type="email"
                                        placeholder="email@agence.ma"
                                        className="w-full ps-11 pe-4 py-3.5 bg-muted border border-border rounded-2xl text-sm focus:bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none placeholder:text-muted-foreground text-foreground"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="text-[11px] font-black text-muted-foreground uppercase mb-1.5 block tracking-widest">
                                    {t("role")}
                                </label>
                                <div className="relative">
                                    <Shield
                                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                        size={18}
                                    />
                                    <select
                                        className="w-full ps-11 pe-4 py-3.5 bg-muted border border-border rounded-2xl text-sm focus:bg-background focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-foreground"
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                role: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="agent">
                                            {t("agent")}
                                        </option>
                                        <option value="comptable">
                                            {t("accountant")}
                                        </option>
                                        <option value="admin">
                                            {t("admin")}
                                        </option>
                                    </select>
                                    <ChevronRight
                                        className="absolute end-4 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none"
                                        size={16}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(false)}
                                    className="flex-1 py-4 border-2 border-border rounded-2xl font-black text-muted-foreground hover:bg-muted transition-all text-xs uppercase tracking-widest"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                                >
                                    {t("save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password display modal – appears once after creation */}
            {showPassword && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-scaleIn">
                        <h3 className="text-xl font-bold text-foreground mb-4">
                            {t("generated_password")}
                        </h3>
                        <div className="flex items-center gap-2 bg-muted rounded-xl p-3 border border-border">
                            <code className="flex-1 break-all text-foreground">
                                {showPassword}
                            </code>
                            <button
                                onClick={copyPassword}
                                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                            >
                                {t("copy")}
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("password_once_warning")}
                        </p>
                        <button
                            onClick={() => setShowPassword(null)}
                            className="mt-4 w-full py-2 bg-emerald-600 text-white rounded"
                        >
                            {t("close")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
