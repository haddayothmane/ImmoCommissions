import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { commissionService } from "../api/commissionService";
import { Commission } from "../types";
import {
    ArrowLeft,
    Percent,
    Building2,
    User,
    Calendar,
    DollarSign,
    Plus,
    Loader2,
    CheckCircle2,
    AlertCircle,
    History,
    Save,
} from "lucide-react";

const CommissionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [commission, setCommission] = useState<Commission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Form state
    const [paymentData, setPaymentData] = useState({
        montant: "",
        date_paiement: new Date().toISOString().split("T")[0],
        mode_paiement: "virement",
        reference: "",
    });

    useEffect(() => {
        if (id) fetchCommissionDetails();
    }, [id]);

    const fetchCommissionDetails = async () => {
        setIsLoading(true);
        try {
            const data = await commissionService.getCommission(id!);
            setCommission(data);
            setPaymentData((prev) => ({
                ...prev,
                montant: data.montant_restant.toString(),
            }));
        } catch (error) {
            console.error("Error fetching commission:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await commissionService.addPayment(id!, {
                ...paymentData,
                montant: parseFloat(paymentData.montant),
            });
            setShowPaymentModal(false);
            fetchCommissionDetails();
        } catch (error) {
            console.error("Error adding payment:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-96 justify-center items-center">
                <Loader2
                    className="animate-spin text-indigo-500 mb-4"
                    size={48}
                />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                    Chargement des détails...
                </p>
            </div>
        );
    }

    if (!commission) return <div>Commission non trouvée</div>;

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={commission.statut === "payé"}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                >
                    <Plus size={18} />
                    Ajouter un versement
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                <Percent size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Détails de la Commission
                                </h2>
                                <p className="text-slate-500 font-medium">
                                    Référence agent:{" "}
                                    {commission.agent?.full_name}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Bien Immobilier
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            Appartement{" "}
                                            {commission.appartement?.numero}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Client
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {commission.client?.nom || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Date de Vente
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {new Date(
                                                commission.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Prix de Vente
                                        </p>
                                        <p className="font-bold text-emerald-600">
                                            {Number(
                                                commission.prix_vente,
                                            ).toLocaleString()}{" "}
                                            MAD
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">
                                    Calculateur
                                </h3>
                                <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                                    Taux: {commission.pourcentage}%
                                </div>
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                                {Number(
                                    commission.montant_total,
                                ).toLocaleString()}{" "}
                                <span className="text-lg">MAD</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium italic">
                                Commission totale calculée sur le prix de vente
                                final.
                            </p>
                        </div>
                    </div>

                    {/* Payment History Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="text-slate-400" size={20} />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Historique des versements
                            </h3>
                        </div>

                        {commission.payments &&
                        commission.payments.length > 0 ? (
                            <div className="space-y-4">
                                {commission.payments.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-500/50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {Number(
                                                        p.montant,
                                                    ).toLocaleString()}{" "}
                                                    MAD
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">
                                                    {new Date(
                                                        p.date_paiement,
                                                    ).toLocaleDateString()}{" "}
                                                    • {p.mode_paiement}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Enregistré par
                                            </div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {p.creator?.full_name ||
                                                    "Admin"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                Aucun versement enregistré.
                            </div>
                        )}
                    </div>
                </div>

                {/* Status & Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Statut Actuel
                        </h3>
                        <div
                            className={`text-center py-4 rounded-3xl border-2 mb-8 font-black uppercase tracking-widest text-sm ${
                                commission.statut === "payé"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-500/20"
                                    : commission.statut === "partiellement payé"
                                      ? "bg-amber-50 text-amber-600 border-amber-500/20"
                                      : "bg-rose-50 text-rose-600 border-rose-500/20"
                            }`}
                        >
                            {commission.statut}
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold text-xs uppercase">
                                    Payé
                                </span>
                                <span className="text-emerald-600 font-black">
                                    {Number(
                                        commission.montant_paye,
                                    ).toLocaleString()}{" "}
                                    MAD
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold text-xs uppercase">
                                    Restant
                                </span>
                                <span className="text-rose-600 font-black">
                                    {Number(
                                        commission.montant_restant,
                                    ).toLocaleString()}{" "}
                                    MAD
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                    style={{
                                        width: `${(commission.montant_paye / commission.montant_total) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-600/20">
                        <AlertCircle className="mb-4 opacity-50" size={32} />
                        <h4 className="font-black text-lg uppercase tracking-tight mb-2">
                            Note Logicielle
                        </h4>
                        <p className="text-sm font-medium text-white/70 leading-relaxed">
                            Les commissions sont calculées automatiquement lors
                            de la finalisation d'un contrat d'appartement. Tout
                            ajustement du taux doit être justifié par
                            l'administrateur de l'agence.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-slate-700 animate-slideUp">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Ajouter un Versement
                            </h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-4">
                                    Montant (MAD)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={paymentData.montant}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            montant: e.target.value,
                                        })
                                    }
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-4">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={paymentData.date_paiement}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            date_paiement: e.target.value,
                                        })
                                    }
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-4">
                                    Mode de règlement
                                </label>
                                <select
                                    value={paymentData.mode_paiement}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            mode_paiement: e.target.value,
                                        })
                                    }
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                >
                                    <option value="virement">Virement</option>
                                    <option value="especes">Espèces</option>
                                    <option value="cheque">Chèque</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-4">
                                    Référence (Optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={paymentData.reference}
                                    placeholder="Ex: REF-12345"
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            reference: e.target.value,
                                        })
                                    }
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={20}
                                    />
                                ) : (
                                    <Save size={20} />
                                )}
                                Confirmer le paiement
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionDetails;
