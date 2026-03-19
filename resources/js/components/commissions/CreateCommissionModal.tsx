import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    User,
    Building2,
    Percent,
    DollarSign,
    X,
    Check,
    Loader2,
} from "lucide-react";
import { commissionService } from "../../api/commissionService";
import { clientService } from "../../api/clientService";
import axios from "axios";
import { Employee, Appartement, Client } from "../../types";

interface CreateCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCommissionModal: React.FC<CreateCommissionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [agents, setAgents] = useState<Employee[]>([]);
    const [appartements, setAppartements] = useState<Appartement[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    const [agentId, setAgentId] = useState("");
    const [appartementId, setAppartementId] = useState("");
    const [clientId, setClientId] = useState("");
    const [prixVente, setPrixVente] = useState("");
    const [pourcentage, setPourcentage] = useState("2.5");

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [agentsRes, appsRes, clientsRes] = await Promise.all([
                axios.get("/api/employees"),
                axios.get("/api/appartements?paginate=false"),
                clientService.getClients(),
            ]);
            setAgents(agentsRes.data.data || agentsRes.data);
            setAppartements(appsRes.data.data || appsRes.data);
            setClients(clientsRes);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleAppartementChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const id = e.target.value;
        setAppartementId(id);

        if (id) {
            const selected = appartements.find(
                (app: any) => String(app.id) === String(id),
            );
            if (selected) {
                if (selected.prix_total) {
                    setPrixVente(String(selected.prix_total));
                }
                if (selected.client_id) {
                    setClientId(selected.client_id);
                }
            }
        } else {
            setPrixVente("");
            setClientId("");
        }
    };

    const montantCommission = (Number(prixVente) * Number(pourcentage)) / 100;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await commissionService.createCommission({
                agent_id: agentId,
                appartement_id: appartementId,
                client_id: clientId || null,
                prix_vente: Number(prixVente),
                pourcentage: Number(pourcentage),
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error creating commission:", error);
            alert("Erreur lors de la création de la commission");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Percent className="text-indigo-500" />
                        Nouvelle Commission
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                                Agent
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <select
                                    required
                                    value={agentId}
                                    onChange={(e) => setAgentId(e.target.value)}
                                    className="w-full ps-11 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold dark:text-white"
                                >
                                    <option value="">
                                        Sélectionner un agent
                                    </option>
                                    {agents.map((a: any) => (
                                        <option key={a.id} value={a.id}>
                                            {a.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                                Appartement
                            </label>
                            <div className="relative">
                                <Building2
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <select
                                    required
                                    value={appartementId}
                                    onChange={handleAppartementChange}
                                    className="w-full ps-11 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold dark:text-white"
                                >
                                    <option value="">
                                        Sélectionner un appartement
                                    </option>
                                    {appartements.map((app: any) => (
                                        <option key={app.id} value={app.id}>
                                            App. {app.numero} (Étage {app.etage}
                                            )
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                                Client
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <select
                                    value={clientId}
                                    onChange={(e) =>
                                        setClientId(e.target.value)
                                    }
                                    className="w-full ps-11 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold dark:text-white"
                                >
                                    <option value="">
                                        Aucun ou Sélectionner un client
                                    </option>
                                    {clients.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nom} ({c.cin})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                                Prix de vente (MAD)
                            </label>
                            <div className="relative">
                                <DollarSign
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={prixVente}
                                    onChange={(e) =>
                                        setPrixVente(e.target.value)
                                    }
                                    className="w-full ps-11 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold dark:text-white"
                                    placeholder="Ex: 500000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
                                Taux de Commission (%)
                            </label>
                            <div className="relative">
                                <Percent
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    max="100"
                                    value={pourcentage}
                                    onChange={(e) =>
                                        setPourcentage(e.target.value)
                                    }
                                    className="w-full ps-11 pe-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold dark:text-white"
                                    placeholder="Ex: 2.5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-900/50 dark:text-indigo-400/70 uppercase tracking-widest">
                            Montant Calculé
                        </span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {isNaN(montantCommission)
                                ? "0"
                                : montantCommission.toLocaleString()}{" "}
                            MAD
                        </span>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg flex-[2] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Check size={20} />
                            )}
                            Créer la commission
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommissionModal;
