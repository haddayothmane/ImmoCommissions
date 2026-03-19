import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Calendar,
    User,
    Edit3,
    Trash2,
    Home,
    Building2,
    Layers,
    Activity,
    ChevronRight,
    FileText,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileCheck,
    CreditCard,
    Receipt,
    X,
    Printer,
    History,
} from "lucide-react";
import {
    Contract,
    PaymentMilestone,
    Appartement,
    Immeuble,
    Terrain,
} from "../types";
import { contractService } from "../api/contractService";
import { paiementService } from "../api/paiementService";

const ContractDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] =
        useState<PaymentMilestone | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMode, setPaymentMode] = useState<
        "cheque" | "virement" | "especes" | "cash"
    >("virement");
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentDescription, setPaymentDescription] = useState("");

    // Receipt state
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptMilestone, setReceiptMilestone] =
        useState<PaymentMilestone | null>(null);

    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            setIsLoading(true);
            const data = await contractService.getContract(id!);
            setContract(data);
        } catch (error) {
            console.error("Error fetching contract:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPayment = (milestone?: PaymentMilestone) => {
        if (milestone) {
            setSelectedMilestone(milestone);
            setPaymentAmount(Number(milestone.amount));
        } else {
            setSelectedMilestone(null);
            setPaymentAmount(0);
        }
        setPaymentMode("virement");
        setPaymentReference("");
        setPaymentDescription("");
        setPaymentDate(new Date().toISOString().split("T")[0]);
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        if (!contract || !contract.client_id) return;
        try {
            await paiementService.createPaiement({
                client_id: contract.client_id,
                contract_id: contract.id,
                milestone_id: selectedMilestone?.id,
                montant: paymentAmount,
                mode_paiement: paymentMode,
                date_paiement: paymentDate,
                reference: paymentReference,
                description: paymentDescription,
            });

            setShowPaymentModal(false);
            fetchContractDetails(); // Refresh
        } catch (error) {
            console.error(t("error_occured"), error);
            alert(t("error_occured"));
        }
    };

    const openReceipt = (milestone: PaymentMilestone) => {
        setReceiptMilestone(milestone);
        setShowReceiptModal(true);
    };

    const printReceipt = () => {
        const content = document.getElementById("receipt-content")?.innerHTML;
        const originalContent = document.body.innerHTML;

        if (content) {
            document.body.innerHTML = content;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        }
    };

    const downloadPdf = async () => {
        if (!contract) return;
        try {
            setIsExporting(true);
            const response = await axios.get(
                `/api/contracts/${contract.id}/pdf`,
                {
                    responseType: "blob",
                },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `contrat_${contract.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("PDF download error:", error);
            alert("Erreur lors de la génération du PDF");
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Activity size={48} className="text-emerald-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("loading_contract")}
                </p>
            </div>
        );
    }

    if (!contract) return null;

    const milestones = [...(contract.milestones || [])].sort(
        (a, b) =>
            new Date(a.due_date || "").getTime() -
            new Date(b.due_date || "").getTime(),
    );

    const totalPaid = milestones.reduce(
        (sum, m) =>
            sum + (m.payments ?? []).reduce((s, p) => s + Number(p.montant), 0),
        0,
    );

    const progress =
        contract.total_sale_price > 0
            ? Math.min((totalPaid / contract.total_sale_price) * 100, 100)
            : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-500";
            case "completed":
                return "bg-blue-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };

    const getTargetName = () => {
        if (!contract.target) return t("unknown");
        switch (contract.target_type) {
            case "App\\Models\\Appartement":
                return `${t("appartement")} ${(contract.target as Appartement).numero}`;
            case "App\\Models\\Immeuble":
                return `${t("building")} ${(contract.target as Immeuble).nom}`;
            case "App\\Models\\Terrain":
                return `${t("project")} ${(contract.target as Terrain).nom_projet}`;
            default:
                return t("contracts");
        }
    };

    const renderPaymentModal = () => {
        if (!showPaymentModal) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="text-emerald-500" />
                            {selectedMilestone
                                ? t("collect_milestone")
                                : t("new_payment_free")}
                        </h2>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X
                                size={20}
                                className="text-slate-500 dark:text-slate-400"
                            />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {t("amount")} (MAD)
                            </label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) =>
                                    setPaymentAmount(
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-black text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    {t("payment_method")}
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
                                    value={paymentMode}
                                    onChange={(e) =>
                                        setPaymentMode(e.target.value as any)
                                    }
                                >
                                    <option value="virement">
                                        {t("virement")}
                                    </option>
                                    <option value="cheque">
                                        {t("cheque")}
                                    </option>
                                    <option value="especes">
                                        {t("especes")}
                                    </option>
                                    <option value="cash">{t("cash")}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    {t("payment_date")}
                                </label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) =>
                                        setPaymentDate(e.target.value)
                                    }
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {t("reference_placeholder")}
                            </label>
                            <input
                                type="text"
                                placeholder={t("ref_desc_placeholder")}
                                value={paymentReference}
                                onChange={(e) =>
                                    setPaymentReference(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {t("description")} ({t("optional")})
                            </label>
                            <textarea
                                rows={2}
                                value={paymentDescription}
                                onChange={(e) =>
                                    setPaymentDescription(e.target.value)
                                }
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={confirmPayment}
                                disabled={paymentAmount <= 0}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50"
                            >
                                {t("confirm_payment_btn")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderReceiptModal = () => {
        if (!showReceiptModal || !receiptMilestone) return null;

        const payments = receiptMilestone.payments || [];
        const latestPayment = payments[payments.length - 1]; // Assume latest if multiple

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-scaleIn max-h-[90vh]">
                    <div className="p-6 bg-muted/50 border-b border-border flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileCheck className="text-emerald-500" />{" "}
                            {t("payment_receipt")}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (latestPayment) {
                                        paiementService.downloadReceipt(
                                            latestPayment.id,
                                        );
                                    } else {
                                        printReceipt();
                                    }
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow flex items-center gap-2"
                            >
                                <Printer size={18} /> Télécharger PDF
                            </button>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="p-2 bg-muted hover:bg-slate-200 rounded-full text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto" id="receipt-content">
                        <div className="bg-white text-slate-900 p-10 border border-slate-200 mx-auto max-w-[21cm]">
                            <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                                <h1 className="text-3xl font-black uppercase tracking-widest">
                                    {t("receipt_of_cash")}
                                </h1>
                                <p className="text-slate-500 mt-1 font-mono text-sm">
                                    N° R-
                                    {receiptMilestone.id
                                        .split("-")[0]
                                        .toUpperCase()}
                                </p>
                            </div>

                            <div className="mb-6 space-y-2 text-sm">
                                <p>
                                    <strong>{t("issue_date")}:</strong>{" "}
                                    {new Date().toLocaleDateString(
                                        i18n.language === "ar"
                                            ? "ar-MA"
                                            : "fr-FR",
                                    )}
                                </p>
                                <p>
                                    <strong>{t("client")}:</strong>{" "}
                                    {contract.client?.nom} ({t("cin")}:{" "}
                                    {contract.client?.cin || "—"})
                                </p>
                                <p>
                                    <strong>{t("contact")}:</strong>{" "}
                                    {contract.client?.telephone || "—"} /{" "}
                                    {contract.client?.email || "—"}
                                </p>
                                <p>
                                    <strong>{t("concerned_property")}:</strong>{" "}
                                    {getTargetName()}
                                </p>
                            </div>

                            <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">
                                    {t("milestone_detail")} :{" "}
                                    {receiptMilestone.label}
                                </h3>

                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">
                                            {t("amount_expected")} :
                                        </span>
                                        <span className="font-bold">
                                            {Number(
                                                receiptMilestone.amount,
                                            ).toLocaleString()}{" "}
                                            MAD
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">
                                            {t("total_amount_received")} :
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {payments
                                                .reduce(
                                                    (acc, p) =>
                                                        acc + Number(p.montant),
                                                    0,
                                                )
                                                .toLocaleString()}{" "}
                                            MAD
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-slate-500">
                                            {t("milestone_status")} :
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {t("paid_status_upper")}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                                        {t("payment_history_detail")}
                                    </h4>
                                    <div className="border rounded-md overflow-hidden text-xs">
                                        <table className="w-full text-start bg-white">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="p-2 border-b">
                                                        {t("date")}
                                                    </th>
                                                    <th className="p-2 border-b">
                                                        {t("payment_mode")}
                                                    </th>
                                                    <th className="p-2 border-b">
                                                        {t("reference")} /{" "}
                                                        {t("description")}
                                                    </th>
                                                    <th className="p-2 border-b text-end">
                                                        {t("amount")}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="p-4 text-center text-slate-400 italic"
                                                        >
                                                            {t("no_results")}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    payments.map((p, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="border-b last:border-0 hover:bg-slate-50"
                                                        >
                                                            <td className="p-2">
                                                                {new Date(
                                                                    p.date_paiement,
                                                                ).toLocaleDateString(
                                                                    i18n.language ===
                                                                        "ar"
                                                                        ? "ar-MA"
                                                                        : "fr-FR",
                                                                )}
                                                            </td>
                                                            <td className="p-2 capitalize">
                                                                {t(
                                                                    (
                                                                        p.mode_reglement ||
                                                                        "virement"
                                                                    ).toLowerCase(),
                                                                )}
                                                            </td>
                                                            <td
                                                                className="p-2 text-slate-500 max-w-[150px] truncate"
                                                                title={
                                                                    p.description ||
                                                                    p.reference ||
                                                                    "—"
                                                                }
                                                            >
                                                                {p.reference ||
                                                                    p.description ||
                                                                    "—"}
                                                            </td>
                                                            <td className="p-2 text-end font-bold text-slate-700">
                                                                {Number(
                                                                    p.montant,
                                                                ).toLocaleString()}{" "}
                                                                MAD
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Page break for printing */}
                        <div
                            className="break-before-page w-full h-8"
                            style={{ pageBreakBefore: "always" }}
                        />

                        {/* Arabic Version */}
                        <div
                            className="bg-white text-slate-900 p-10 border border-slate-200 mx-auto max-w-[21cm]"
                            dir="rtl"
                        >
                            <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                                <h1 className="text-3xl font-black uppercase tracking-widest leading-normal">
                                    وصل إستلام
                                </h1>
                                <p className="text-slate-500 mt-1 font-mono text-sm">
                                    رقم و-{" "}
                                    {receiptMilestone.id
                                        .split("-")[0]
                                        .toUpperCase()}
                                </p>
                            </div>

                            <div className="mb-6 space-y-2 text-sm leading-loose">
                                <p>
                                    <strong>تاريخ الإصدار:</strong>{" "}
                                    <span dir="ltr">
                                        {new Date().toLocaleDateString("fr-FR")}
                                    </span>
                                </p>
                                <p>
                                    <strong>العميل:</strong>{" "}
                                    {contract.client?.nom} (رقم البطاقة الوطنية:{" "}
                                    {contract.client?.cin || "—"})
                                </p>
                                <p>
                                    <strong>الاتصال:</strong>{" "}
                                    <span dir="ltr">
                                        {contract.client?.telephone || "—"} /{" "}
                                        {contract.client?.email || "—"}
                                    </span>
                                </p>
                                <p>
                                    <strong>العقار المعني:</strong>{" "}
                                    {getTargetName()}
                                </p>
                            </div>

                            <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">
                                    تفاصيل الدفعة : {receiptMilestone.label}
                                </h3>

                                <div className="space-y-4 text-sm leading-loose">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">
                                            المبلغ المقرر :
                                        </span>
                                        <span className="font-bold">
                                            <span dir="ltr">
                                                {Number(
                                                    receiptMilestone.amount,
                                                ).toLocaleString()}
                                            </span>{" "}
                                            درهم
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">
                                            إجمالي المبلغ المحصل :
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            <span dir="ltr">
                                                {payments
                                                    .reduce(
                                                        (acc, p) =>
                                                            acc +
                                                            Number(p.montant),
                                                        0,
                                                    )
                                                    .toLocaleString()}
                                            </span>{" "}
                                            درهم
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">
                                            حالة الدفعة :
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            مسدد
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                                        سجل المدفوعات
                                    </h4>
                                    <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                                        <table className="w-full text-end bg-white">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="p-2 border-b border-slate-200">
                                                        التاريخ
                                                    </th>
                                                    <th className="p-2 border-b border-slate-200">
                                                        طريقة الدفع
                                                    </th>
                                                    <th className="p-2 border-b border-slate-200">
                                                        المرجع/الوصف
                                                    </th>
                                                    <th
                                                        className="p-2 border-b border-slate-200"
                                                        style={{
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        المبلغ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="p-4 text-center text-slate-400 italic"
                                                        >
                                                            لا توجد تفاصيل
                                                            مدفوعات.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    payments.map((p, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                                                        >
                                                            <td
                                                                className="p-2"
                                                                dir="ltr"
                                                                style={{
                                                                    textAlign:
                                                                        "right",
                                                                }}
                                                            >
                                                                {new Date(
                                                                    p.date_paiement,
                                                                ).toLocaleDateString(
                                                                    i18n.language ===
                                                                        "ar"
                                                                        ? "ar-MA"
                                                                        : "fr-FR",
                                                                )}
                                                            </td>
                                                            <td className="p-2 capitalize">
                                                                {t(
                                                                    (
                                                                        p.mode_reglement ||
                                                                        "virement"
                                                                    ).toLowerCase(),
                                                                )}
                                                            </td>
                                                            <td
                                                                className="p-2 text-slate-500 max-w-[150px] truncate"
                                                                title={
                                                                    p.description ||
                                                                    p.reference ||
                                                                    "—"
                                                                }
                                                            >
                                                                {p.reference ||
                                                                    p.description ||
                                                                    "—"}
                                                            </td>
                                                            <td
                                                                className="p-2 font-bold text-slate-700"
                                                                style={{
                                                                    textAlign:
                                                                        "left",
                                                                }}
                                                            >
                                                                <span dir="ltr">
                                                                    {Number(
                                                                        p.montant,
                                                                    ).toLocaleString()}
                                                                </span>{" "}
                                                                درهم
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard/contracts")}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-semibold group"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    {t("back")}
                </button>

                <button
                    onClick={downloadPdf}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    <FileText size={18} />
                    {isExporting ? t("generating_contract") : t("download_pdf")}
                </button>
            </div>

            {/* Contract Summary Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${getStatusColor(contract.status)}`}
                            >
                                {t("contract").toUpperCase()} {contract.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                            {t("sale")}: {getTargetName()}
                        </h1>
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <User size={16} />
                                {contract.client?.nom}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                {t("signed_at")}{" "}
                                {new Date(
                                    contract.created_at,
                                ).toLocaleDateString(
                                    i18n.language === "ar" ? "ar-MA" : "fr-FR",
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-end">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                            {t("total_amount")}
                        </p>
                        <p className="text-4xl font-black text-emerald-900 dark:text-emerald-400">
                            {contract.total_sale_price.toLocaleString()}{" "}
                            <span className="text-lg">MAD</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-10 space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t("already_paid")}
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {totalPaid.toLocaleString()}{" "}
                                <span className="text-sm text-slate-400 dark:text-slate-500">
                                    /{" "}
                                    {contract.total_sale_price.toLocaleString()}{" "}
                                    MAD
                                </span>
                            </p>
                        </div>
                        <p className="text-2xl font-black text-emerald-600">
                            {Math.round(progress)}%
                        </p>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600/50 p-1">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Échéancier */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <History
                                    size={20}
                                    className="text-emerald-500"
                                />{" "}
                                {t("payment_history")}
                            </h3>
                            {progress < 100 && (
                                <button
                                    onClick={() => handleOpenPayment()}
                                    className="flex items-center gap-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors font-bold shadow-md"
                                >
                                    <Plus size={16} />{" "}
                                    {t("free_payment_button")}
                                </button>
                            )}
                        </div>
                        <div className="p-0">
                            {milestones.length === 0 && (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                                    {t("no_milestones")}
                                </div>
                            )}
                            {milestones.map((milestone, index) => {
                                const isOverdue =
                                    milestone.status !== "paid" &&
                                    milestone.due_date &&
                                    new Date(milestone.due_date).setHours(
                                        0,
                                        0,
                                        0,
                                        0,
                                    ) < new Date().setHours(0, 0, 0, 0);
                                return (
                                    <div
                                        key={milestone.id}
                                        className={`p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${milestone.status === "paid" ? "bg-emerald-50/30 dark:bg-emerald-900/10" : isOverdue ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${milestone.status === "paid" ? "bg-emerald-500 text-white" : isOverdue ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50"}`}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {milestone.label}
                                                    </p>
                                                    {isOverdue && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                            {t("overdue")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                                    <Calendar size={12} />{" "}
                                                    {t("milestone")}:{" "}
                                                    {new Date(
                                                        milestone.due_date ||
                                                            "",
                                                    ).toLocaleDateString(
                                                        i18n.language === "ar"
                                                            ? "ar-MA"
                                                            : "fr-FR",
                                                    )}{" "}
                                                    • {milestone.percentage}%{" "}
                                                    {t("of_total")}
                                                </div>
                                                {milestone.payments &&
                                                    milestone.payments.length >
                                                        0 && (
                                                        <div className="mt-2 space-y-1 ps-1 border-s-2 border-emerald-200 dark:border-emerald-800">
                                                            {milestone.payments.map(
                                                                (p) => (
                                                                    <div
                                                                        key={
                                                                            p.id
                                                                        }
                                                                        className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors group/pay"
                                                                        onClick={() =>
                                                                            paiementService.downloadReceipt(
                                                                                p.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Receipt
                                                                            size={
                                                                                10
                                                                            }
                                                                            className="text-emerald-500 flex-shrink-0"
                                                                        />
                                                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/pay:text-emerald-600">
                                                                            {Number(
                                                                                p.montant,
                                                                            ).toLocaleString()}{" "}
                                                                            {t(
                                                                                "currency",
                                                                            )}
                                                                        </span>
                                                                        <span>
                                                                            ·
                                                                        </span>
                                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                                            {t(
                                                                                (
                                                                                    p.mode_reglement ||
                                                                                    "virement"
                                                                                ).toLowerCase(),
                                                                            )}
                                                                        </span>
                                                                        <span>
                                                                            ·
                                                                        </span>
                                                                        <span>
                                                                            {new Date(
                                                                                p.date_paiement,
                                                                            ).toLocaleDateString(
                                                                                i18n.language ===
                                                                                    "ar"
                                                                                    ? "ar-MA"
                                                                                    : "fr-FR",
                                                                            )}
                                                                        </span>
                                                                        <div className="ms-auto opacity-0 group-hover/pay:opacity-100 transition-opacity">
                                                                            <Printer
                                                                                size={
                                                                                    10
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-end">
                                                <p
                                                    className={`font-black ${milestone.status === "paid" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                                                >
                                                    {milestone.amount.toLocaleString()}{" "}
                                                    {t("currency")}
                                                </p>
                                            </div>
                                            {milestone.status === "paid" ? (
                                                <div className="flex gap-2 items-center">
                                                    <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase flex items-center gap-1">
                                                        <CheckCircle2
                                                            size={14}
                                                        />{" "}
                                                        {t("paid")}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            openReceipt(
                                                                milestone,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Receipt size={14} />{" "}
                                                        Reçu
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleOpenPayment(
                                                            milestone,
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg text-sm font-bold shadow-md transition-all"
                                                >
                                                    {t("collect")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-xl">
                        <h4 className="font-bold flex items-center gap-2 text-emerald-400">
                            <Activity size={18} /> {t("contract_summary")}
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                <span className="text-slate-400 text-sm">
                                    {t("sale_price")}
                                </span>
                                <span className="font-bold">
                                    {contract.total_sale_price.toLocaleString()}{" "}
                                    MAD
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                <span className="text-emerald-400 text-sm">
                                    {t("already_paid")}
                                </span>
                                <span className="font-bold text-emerald-400">
                                    {totalPaid.toLocaleString()} MAD
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                                <span className="text-rose-400 text-sm">
                                    {t("remaining_to_pay")}
                                </span>
                                <span className="font-bold text-rose-400">
                                    {(
                                        contract.total_sale_price - totalPaid
                                    ).toLocaleString()}{" "}
                                    MAD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {renderPaymentModal()}
            {renderReceiptModal()}
        </div>
    );
};

export default ContractDetails;
