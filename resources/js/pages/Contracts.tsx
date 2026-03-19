import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { contractService } from "../api/contractService";
import { Contract } from "../types";
import { Search, Plus, Filter, FileText, Activity } from "lucide-react";

const Contracts: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setIsLoading(true);
        try {
            const data = await contractService.listContracts();
            setContracts(data);
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContracts = contracts.filter((c) => {
        const clientName = c.client?.nom?.toLowerCase() || "";
        return clientName.includes(searchTerm.toLowerCase());
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-100 text-emerald-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t("contracts")}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t("manage_contracts_desc")}
                    </p>
                </div>
                <Link
                    to="/dashboard/contracts/new"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={20} />
                    {t("new_contract")}
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 flex gap-4">
                <div className="relative flex-1">
                    <Search
                        className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder={t("search_contract_placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-10 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Filter size={20} />
                    {t("filters")}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Activity
                            className="animate-spin text-emerald-500"
                            size={40}
                        />
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText
                            size={48}
                            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                        />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t("no_contract_found")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t("add_first_contract")}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-start">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-black tracking-wider border-b border-slate-100 dark:border-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">{t("client")}</th>
                                    <th className="px-6 py-4">
                                        {t("property")}
                                    </th>
                                    <th className="px-6 py-4 text-end">
                                        {t("amount")}
                                    </th>
                                    <th className="px-6 py-4">{t("status")}</th>
                                    <th className="px-6 py-4">{t("date")}</th>
                                    <th className="px-6 py-4">
                                        {t("actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredContracts.map((contract) => (
                                    <tr
                                        key={contract.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {contract.client?.nom ||
                                                    t("unknown")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                                {(contract.target_type || "")
                                                    .split("\\")
                                                    .pop()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="font-black text-emerald-700 dark:text-emerald-400">
                                                {Number(
                                                    contract.total_sale_price,
                                                ).toLocaleString()}{" "}
                                                <span className="text-xs">
                                                    MAD
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(contract.status)}`}
                                            >
                                                {t(`status_${contract.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {new Date(
                                                    contract.created_at,
                                                ).toLocaleDateString(
                                                    i18n.language === "ar"
                                                        ? "ar-MA"
                                                        : "fr-FR",
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/dashboard/contracts/${contract.id}`}
                                                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                            >
                                                {t("view_details")}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contracts;
