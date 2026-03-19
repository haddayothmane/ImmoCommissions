import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
    Shield,
    Edit,
    CheckSquare,
    Square,
    Info,
    Save,
    X,
    Lock,
} from "lucide-react";
import { Role, Permission } from "../types";

const Roles: React.FC = () => {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                axios.get("/api/roles"),
                axios.get("/api/permissions"),
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            console.error("Error fetching roles/permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    };

    const togglePermission = (permId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permId)
                ? prev.filter((id) => id !== permId)
                : [...prev, permId],
        );
    };

    const handleSavePermissions = async () => {
        if (!editingRole) return;
        setSaving(true);
        try {
            await axios.put(`/api/roles/${editingRole.id}/permissions`, {
                permissions: selectedPermissions,
            });
            await fetchData();
            setEditingRole(null);
        } catch (error) {
            console.error("Error updating permissions:", error);
            alert(
                t(
                    "roles_update_error",
                    "Erreur lors de la mise à jour des permissions",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                {t("loading")}...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Shield size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        {t("roles_title", "Gestion des Rôles & Permissions")}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {t(
                            "roles_subtitle",
                            "Définissez ce que chaque type d'utilisateur peut voir et faire dans l'application.",
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors capitalize">
                                    {role.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                                    {role.description}
                                </p>
                            </div>
                            <button
                                onClick={() => handleEditRole(role)}
                                className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-95"
                            >
                                <Edit size={18} />
                            </button>
                        </div>

                        <div className="space-y-2 mt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {t("active_permissions", "Permissions actives")}{" "}
                                ({role.permissions?.length || 0})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions?.map((p) => (
                                    <span
                                        key={p.id}
                                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                                    >
                                        {p.name}
                                    </span>
                                ))}
                                {role.permissions?.length === 0 && (
                                    <span className="text-sm text-slate-400 italic">
                                        {t(
                                            "no_permission",
                                            "Aucune permission",
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Permissions Modal */}
            {editingRole && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {t("permissions", "Permissions")} :{" "}
                                        {editingRole.name}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        {t(
                                            "check_allowed_actions",
                                            "Cochez les actions autorisées pour ce rôle.",
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingRole(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {permissions.map((perm) => (
                                    <div
                                        key={perm.id}
                                        onClick={() =>
                                            togglePermission(perm.id)
                                        }
                                        className={`flex items-start gap-3 p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                                            selectedPermissions.includes(
                                                perm.id,
                                            )
                                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                                                : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                                        }`}
                                    >
                                        <div
                                            className={`mt-0.5 ${selectedPermissions.includes(perm.id) ? "text-indigo-600" : "text-slate-300"}`}
                                        >
                                            {selectedPermissions.includes(
                                                perm.id,
                                            ) ? (
                                                <CheckSquare
                                                    size={20}
                                                    fill="currentColor"
                                                    className="text-indigo-100"
                                                />
                                            ) : (
                                                <Square size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p
                                                className={`font-bold text-sm ${selectedPermissions.includes(perm.id) ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-200"}`}
                                            >
                                                {perm.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {perm.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingRole(null)}
                                className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                disabled={saving}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {t(
                                    "save_changes",
                                    "Enregistrer les modifications",
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
