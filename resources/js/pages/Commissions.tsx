import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { commissionService } from "../api/commissionService";
import { Commission } from "../types";
import {
    Search,
    Filter,
    Percent,
    Calendar,
    User,
    ChevronRight,
    Loader2,
    DollarSign,
    Building2,
    Plus,
} from "lucide-react";
import CreateCommissionModal from "../components/commissions/CreateCommissionModal";
import { Pagination } from "../components/ui/Pagination";

const Commissions: React.FC = () => {
    const { t } = useTranslation();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchCommissions();
    }, [statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const fetchCommissions = async () => {
        setIsLoading(true);
        try {
            const response = await commissionService.listCommissions({
                statut: statusFilter,
            });
            setCommissions(response.data);
        } catch (error) {
            console.error("Error fetching commissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCommissions = commissions.filter((c) => {
        const agentName = c.agent?.full_name?.toLowerCase() || "";
        const appartementNum = c.appartement?.numero?.toLowerCase() || "";
        return (
            agentName.includes(searchTerm.toLowerCase()) ||
            appartementNum.includes(searchTerm.toLowerCase())
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "payé":
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "partiellement payé":
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            default:
                return "bg-rose-500/10 text-rose-600 border-rose-500/20";
        }
    };

    const paginatedCommissions = filteredCommissions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                            <Percent size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {t("commissions_title", "GESTION DES COMMISSIONS")}
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {t(
                            "commissions_subtitle",
                            "Suivi des rétributions agents et historique des paiements.",
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={20} />
                    {t("new_commission", "Nouvelle Commission")}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("total_commissions", "Total Commissions")}
                    </p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {commissions
                            .reduce(
                                (acc, curr) => acc + Number(curr.montant_total),
                                0,
                            )
                            .toLocaleString()}{" "}
                        <span className="text-sm">MAD</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("amount_paid", "Montant Payé")}
                    </p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {commissions
                            .reduce(
                                (acc, curr) => acc + Number(curr.montant_paye),
                                0,
                            )
                            .toLocaleString()}{" "}
                        <span className="text-sm">MAD</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("remaining_to_pay", "Reste à Payer")}
                    </p>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {commissions
                            .reduce(
                                (acc, curr) =>
                                    acc + Number(curr.montant_restant),
                                0,
                            )
                            .toLocaleString()}{" "}
                        <span className="text-sm">MAD</span>
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder={t(
                            "search_commission_placeholder",
                            "Rechercher par agent ou appartement...",
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-12 pe-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-slate-400 font-bold text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">
                        {t("all_statuses", "Tous les statuts")}
                    </option>
                    <option value="non payé">
                        {t("status_unpaid", "Non payé")}
                    </option>
                    <option value="partiellement payé">
                        {t("status_partial", "Partiel")}
                    </option>
                    <option value="payé">{t("status_paid", "Payé")}</option>
                </select>
            </div>

            {/* Commissions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-4">
                        <Loader2
                            className="animate-spin text-indigo-500"
                            size={48}
                        />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                            Chargement des données...
                        </p>
                    </div>
                ) : filteredCommissions.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Percent size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {t(
                                "no_commission_found",
                                "Aucune commission trouvée",
                            )}
                        </h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t("agent_date", "Agent / Date")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t("appartement", "Appartement")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-end">
                                        {t("total_amount", "Montant Total")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                        {t("status", "Statut")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                        {t("actions", "Action")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {paginatedCommissions.map((comm) => (
                                    <tr
                                        key={comm.id}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-all duration-300"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                                    {comm.agent?.full_name?.charAt(
                                                        0,
                                                    ) || "A"}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 dark:text-white text-sm">
                                                        {comm.agent?.full_name}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {t(
                                                            "created_at_prefix",
                                                            "Créée le",
                                                        )}{" "}
                                                        {new Date(
                                                            comm.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                <Building2
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                                App. {comm.appartement?.numero}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">
                                                {t("price", "Prix")}:{" "}
                                                {Number(
                                                    comm.prix_vente,
                                                ).toLocaleString()}{" "}
                                                MAD
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-end">
                                            <div className="font-black text-lg text-slate-900 dark:text-white">
                                                {Number(
                                                    comm.montant_total,
                                                ).toLocaleString()}{" "}
                                                MAD
                                            </div>
                                            <div className="text-[10px] font-black text-emerald-500 uppercase">
                                                {t("remaining", "Reste")}:{" "}
                                                {Number(
                                                    comm.montant_restant,
                                                ).toLocaleString()}{" "}
                                                MAD
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(comm.statut)}`}
                                            >
                                                {comm.statut}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Link
                                                to={`/dashboard/commissions/${comm.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                            >
                                                {t("details", "Détails")}
                                                <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!isLoading && filteredCommissions.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredCommissions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            <CreateCommissionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchCommissions}
            />
        </div>
    );
};

export default Commissions;
