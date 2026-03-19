import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { paiementService } from "../api/paiementService";
import { PaiementRecord } from "../types";
import {
    Search,
    Download,
    Filter,
    Coins,
    Calendar,
    User,
    FileText,
    Loader2,
} from "lucide-react";
import { Pagination } from "../components/ui/Pagination";

const Paiements: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [paiements, setPaiements] = useState<PaiementRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchPaiements();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchPaiements = async () => {
        setIsLoading(true);
        try {
            const data = await paiementService.listPaiements();
            setPaiements(data);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (paymentId: string) => {
        setDownloadingId(paymentId);
        try {
            await paiementService.downloadReceipt(paymentId);
        } catch (error) {
            console.error("Error downloading receipt:", error);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredPaiements = paiements.filter((p) => {
        const clientName = p.client?.nom?.toLowerCase() || "";
        const ref = p.reference?.toLowerCase() || "";
        return (
            clientName.includes(searchTerm.toLowerCase()) ||
            ref.includes(searchTerm.toLowerCase())
        );
    });

    const isRtl = i18n.language === "ar";

    const paginatedPaiements = filteredPaiements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                            <Coins size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {t("paiements_title", "GESTION DES PAIEMENTS")}
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {t(
                            "paiements_subtitle",
                            "Historique complet des règlements et génération de reçus officiels.",
                        )}
                    </p>
                </div>
            </div>

            {/* Stats Cards - Optional but looks premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("total_collected", "Total Encaissé")}
                    </p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {paiements
                            .reduce(
                                (acc, curr) => acc + Number(curr.montant),
                                0,
                            )
                            .toLocaleString()}{" "}
                        <span className="text-sm">MAD</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("payments_this_month", "Paiements ce mois")}
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {paiements.length}{" "}
                        <span className="text-sm font-bold text-slate-400">
                            {t("transactions", "Transactions")}
                        </span>
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t("last_transaction", "Dernière transaction")}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {paiements.length > 0
                            ? new Date(
                                  paiements[0].date_paiement,
                              ).toLocaleDateString()
                            : "N/A"}
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
                            "search_payment_placeholder",
                            "Rechercher par client ou référence...",
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-12 pe-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder-slate-400 font-bold text-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all">
                    <Filter size={18} />
                    {t("advanced_filters", "Filtres avancés")}
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-4">
                        <Loader2
                            className="animate-spin text-emerald-500"
                            size={48}
                        />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                            Chargement des données...
                        </p>
                    </div>
                ) : filteredPaiements.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Coins size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {t("no_payment_found", "Aucun paiement trouvé")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
                            {t(
                                "no_payment_desc",
                                "Il semble qu'aucun règlement ne corresponde à votre recherche pour le moment.",
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t("date_ref", "Date & Réf.")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t("client", "Client")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t(
                                            "property_desc",
                                            "Bien / Description",
                                        )}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-end">
                                        {t("amount", "Montant")}
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                        {t("actions", "Action")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {paginatedPaiements.map((pay) => (
                                    <tr
                                        key={pay.id}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-all duration-300"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 dark:text-white text-sm">
                                                        {new Date(
                                                            pay.date_paiement,
                                                        ).toLocaleDateString(
                                                            "fr-FR",
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        REF:{" "}
                                                        {pay.reference ||
                                                            pay.id.substring(
                                                                0,
                                                                8,
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center font-black text-xs">
                                                    {pay.client?.nom?.charAt(0)}
                                                </div>
                                                <div className="font-bold text-slate-700 dark:text-slate-300">
                                                    {pay.client?.nom}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                                {pay.milestone?.label ||
                                                    pay.description ||
                                                    t(
                                                        "installment",
                                                        "Versement",
                                                    )}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                                <FileText size={10} />
                                                {pay.appartement
                                                    ? `App. ${pay.appartement.numero}`
                                                    : t(
                                                          "global_contract",
                                                          "Contrat global",
                                                      )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-end">
                                            <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                                                {Number(
                                                    pay.montant,
                                                ).toLocaleString()}{" "}
                                                <span className="text-xs uppercase ms-1">
                                                    MAD
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {pay.mode_reglement}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() =>
                                                    handleDownload(pay.id)
                                                }
                                                disabled={
                                                    downloadingId === pay.id
                                                }
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-white hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50"
                                            >
                                                {downloadingId === pay.id ? (
                                                    <Loader2
                                                        size={14}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Download size={14} />
                                                )}
                                                {t("receipt_pdf", "Reçu PDF")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!isLoading && filteredPaiements.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredPaiements.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default Paiements;
