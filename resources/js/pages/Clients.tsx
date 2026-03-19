import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    User,
    Phone,
    CreditCard,
    X,
    Mail,
    AlertCircle,
    Edit2,
    Trash2,
} from "lucide-react";
import { clientService } from "../api/clientService";
import { Client, Appartement, Immeuble, Terrain } from "../types";

const inputCls =
    "w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:bg-background focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-muted-foreground";
const errCls = inputCls + " border-red-400 focus:border-red-400";

const ModalField = ({
    icon,
    label,
    error,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
            {icon} {label}
        </label>
        {children}
        {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={11} />
                {error}
            </p>
        )}
    </div>
);

const Clients: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { employee } = useAuth();

    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({
        nom: "",
        cin: "",
        telephone: "",
        email: "",
    });
    const [formErrors, setFormErrors] = useState<{
        nom?: string;
        cin?: string;
        telephone?: string;
        email?: string;
    }>({});

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const data = await clientService.getClients();
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingClient(null);
        setFormData({ nom: "", cin: "", telephone: "", email: "" });
        setFormErrors({});
        setShowForm(true);
    };

    const openEditModal = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingClient(client);
        setFormData({
            nom: client.nom,
            cin: client.cin,
            telephone: client.telephone,
            email: client.email || "",
        });
        setFormErrors({});
        setShowForm(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t("confirm_delete_client"))) {
            try {
                await clientService.deleteClient(id);
                fetchClients();
            } catch (error: any) {
                console.error("Error deleting client:", error);
                alert(t("delete_error_permission"));
            }
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingClient(null);
        setFormData({ nom: "", cin: "", telephone: "", email: "" });
        setFormErrors({});
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        // Validation simple
        const errors: typeof formErrors = {};
        if (!formData.nom.trim()) errors.nom = t("name_required");
        if (!formData.cin.trim()) errors.cin = t("cin_required");
        if (!formData.telephone.trim()) errors.telephone = t("phone_required");

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (editingClient) {
                await clientService.updateClient(editingClient.id, formData);
            } else {
                await clientService.createClient(formData);
            }
            closeForm();
            fetchClients();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                const apiErrors = error.response.data?.errors || {};
                const mapped: typeof formErrors = {};
                if (apiErrors.cin) mapped.cin = apiErrors.cin[0];
                if (apiErrors.nom) mapped.nom = apiErrors.nom[0];
                if (apiErrors.telephone)
                    mapped.telephone = apiErrors.telephone[0];
                if (apiErrors.email) mapped.email = apiErrors.email[0];
                setFormErrors(mapped);
            } else {
                console.error("Error saving client:", error);
            }
        }
    };

    const filteredClients = clients.filter((c) => {
        const query = searchQuery.toLowerCase();
        return (
            c.nom.toLowerCase().includes(query) ||
            c.cin.toLowerCase().includes(query) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            c.telephone.includes(query)
        );
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground overflow-hidden">
                        {t("clients")}
                    </h1>
                    <p className="text-muted-foreground">{t("clients_desc")}</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    {t("add_client")}
                </button>
            </div>

            {/* Stats + Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative">
                    <Search
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={t("search_client_placeholder")}
                        className="w-full ps-12 pe-4 py-4 bg-card border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 dark:focus:border-emerald-800 outline-none shadow-sm transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            {t("total_clients")}
                        </p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-400 mt-1">
                            {clients.length}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                        <User size={24} />
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {t("active_files")}
                        </p>
                        <p className="text-2xl font-black text-blue-900 dark:text-blue-400 mt-1">
                            {
                                clients.filter(
                                    (c) =>
                                        c.contracts && c.contracts.length > 0,
                                ).length
                            }
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 dark:border-blue-900/30">
                        <CreditCard size={24} />
                    </div>
                </div>
            </div>

            {/* Client List */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-start border-collapse">
                    <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                        <tr>
                            <th className="px-8 py-5">{t("client")}</th>
                            <th className="px-8 py-5 hidden md:table-cell">
                                {t("contact")}
                            </th>
                            <th className="px-8 py-5">
                                {t("acquired_property")}
                            </th>
                            <th className="px-8 py-5">{t("amount_paid")}</th>
                            <th className="px-8 py-5 text-end">
                                {t("actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-10 text-muted-foreground"
                                >
                                    {t("no_clients_found")}
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map((client) => {
                                const latestContract = client.contracts?.[0];
                                const totalPaid = (
                                    latestContract?.milestones || []
                                ).reduce(
                                    (sum, m) =>
                                        sum +
                                        (m.payments ?? []).reduce(
                                            (s, p) => s + Number(p.montant),
                                            0,
                                        ),
                                    0,
                                );
                                const totalAmount =
                                    latestContract?.total_sale_price || 0;
                                const progress =
                                    totalAmount > 0
                                        ? Math.min(
                                              (totalPaid / totalAmount) * 100,
                                              100,
                                          )
                                        : 0;

                                const getTargetLabel = () => {
                                    if (!latestContract?.target)
                                        return t("no_property");
                                    switch (latestContract.target_type) {
                                        case "App\\Models\\Appartement":
                                            return `App. ${(latestContract.target as Appartement).numero}`;
                                        case "App\\Models\\Immeuble":
                                            return `Imm. ${(latestContract.target as Immeuble).nom}`;
                                        case "App\\Models\\Terrain":
                                            return `Proj. ${(latestContract.target as Terrain).nom_projet}`;
                                        default:
                                            return "Vente";
                                    }
                                };

                                return (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                        onClick={() =>
                                            navigate(
                                                `/dashboard/clients/${client.id}`,
                                            )
                                        }
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground font-black border border-border group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-all uppercase">
                                                    {client.nom.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">
                                                        {client.nom}
                                                    </p>
                                                    <p className="text-[11px] font-black text-muted-foreground mt-0.5 tracking-wider uppercase">
                                                        {client.cin}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Phone size={12} />{" "}
                                                    {client.telephone}
                                                </span>
                                                {client.email && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail size={12} />{" "}
                                                        {client.email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {latestContract ? (
                                                <>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {getTargetLabel()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-black mt-0.5 tracking-wider">
                                                        {totalAmount.toLocaleString()}{" "}
                                                        MAD
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    {t("no_contract")}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            {latestContract ? (
                                                <div className="w-40">
                                                    <div className="flex justify-between text-[10px] font-black mb-1.5 tracking-widest">
                                                        <span className="text-emerald-600 dark:text-emerald-400">
                                                            {progress.toFixed(
                                                                0,
                                                            )}
                                                            %
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {totalPaid.toLocaleString()}{" "}
                                                            MAD
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-end">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) =>
                                                        openEditModal(client, e)
                                                    }
                                                    className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {(!employee?.role ||
                                                    employee.role.slug ===
                                                        "admin") && (
                                                    <button
                                                        onClick={(e) =>
                                                            handleDelete(
                                                                client.id,
                                                                e,
                                                            )
                                                        }
                                                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* CREATE / EDIT CLIENT MODAL */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
                        <form onSubmit={handleSave}>
                            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                                    <User
                                        size={20}
                                        className="text-emerald-500"
                                    />
                                    {editingClient
                                        ? t("edit_client")
                                        : t("new_client")}
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="px-8 py-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
                                <ModalField
                                    icon={<User size={11} />}
                                    label={t("full_name_label")}
                                    error={formErrors.nom}
                                >
                                    <input
                                        className={
                                            formErrors.nom ? errCls : inputCls
                                        }
                                        placeholder={t("placeholder_full_name")}
                                        value={formData.nom}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                nom: e.target.value,
                                            })
                                        }
                                    />
                                </ModalField>
                                <ModalField
                                    icon={<CreditCard size={11} />}
                                    label={t("cin_label")}
                                    error={formErrors.cin}
                                >
                                    <input
                                        className={
                                            formErrors.cin ? errCls : inputCls
                                        }
                                        placeholder={t("placeholder_cin")}
                                        value={formData.cin}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                cin: e.target.value,
                                            })
                                        }
                                        disabled={!!editingClient}
                                    />
                                </ModalField>
                                <ModalField
                                    icon={<Phone size={11} />}
                                    label={t("phone_label")}
                                    error={formErrors.telephone}
                                >
                                    <input
                                        className={
                                            formErrors.telephone
                                                ? errCls
                                                : inputCls
                                        }
                                        placeholder={t("placeholder_phone")}
                                        value={formData.telephone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                telephone: e.target.value,
                                            })
                                        }
                                    />
                                </ModalField>
                                <ModalField
                                    icon={<Mail size={11} />}
                                    label={t("email_label")}
                                    error={formErrors.email}
                                >
                                    <input
                                        type="email"
                                        className={
                                            formErrors.email ? errCls : inputCls
                                        }
                                        placeholder={t("placeholder_email")}
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </ModalField>
                            </div>
                            <div className="px-8 py-5 border-t border-border flex justify-end gap-3 bg-muted/30">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-6 py-2.5 bg-muted text-muted-foreground rounded-2xl font-bold text-sm hover:bg-border transition-all"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    {editingClient
                                        ? t("save")
                                        : t("create_client")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
