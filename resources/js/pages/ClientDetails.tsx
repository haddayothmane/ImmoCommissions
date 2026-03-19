import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
    ArrowLeft,
    CreditCard,
    Download,
    Phone,
    Mail,
    Building2,
    CheckCircle2,
    X,
    Printer,
    FileText,
    AlertCircle,
    Activity,
    Plus,
    Receipt,
} from "lucide-react";
import { clientService } from "../api/clientService";
import { paiementService } from "../api/paiementService";
import {
    Client,
    Contract,
    PaymentMilestone,
    Appartement,
    Immeuble,
    Terrain,
} from "../types";

const ClientDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showContractModal, setShowContractModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchClientData();
        }
    }, [id]);

    const fetchClientData = async () => {
        try {
            setIsLoading(true);
            const data = await clientService.getClient(id!);
            setClient(data);
        } catch (error) {
            console.error("Error fetching client details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Contract download ──────────────────────────────────────────────────
    const handleDownloadContract = async () => {
        const contract = client?.contracts?.[0];
        if (!contract) return;
        try {
            const response = await axios.get(
                `/api/contracts/${contract.id}/pdf?lang=fr`,
                { responseType: "blob" },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `contrat_${contract.id.split("-")[0].toUpperCase()}.pdf`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download contract", error);
            alert("Erreur lors du téléchargement du contrat.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Activity size={48} className="text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-medium">
                    Chargement du client...
                </p>
            </div>
        );
    }

    if (!client) return <div>Client introuvable</div>;

    const latestContract = client.contracts?.[0];
    const milestones = [...(latestContract?.milestones || [])].sort(
        (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );

    // Sum actual recorded payment amounts from DB (not planned milestone amounts)
    const totalPaid = milestones.reduce(
        (sum, m) =>
            sum + (m.payments ?? []).reduce((s, p) => s + Number(p.montant), 0),
        0,
    );

    const totalPrice = latestContract?.total_sale_price || 0;
    const progress =
        totalPrice > 0 ? Math.min((totalPaid / totalPrice) * 100, 100) : 0;

    const nextMilestone = milestones.find((m) => m.status === "pending");

    const allPayments = milestones
        .flatMap((m) =>
            (m.payments || []).map((p) => ({
                ...p,
                milestoneLabel: m.label,
            })),
        )
        .sort(
            (a, b) =>
                new Date(b.date_paiement).getTime() -
                new Date(a.date_paiement).getTime(),
        );

    const lastPayments = allPayments.slice(0, 5);

    const getTargetLabel = () => {
        if (!latestContract?.target) return "Aucun bien";
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

    const getTargetDetails = () => {
        if (!latestContract?.target) return "Aucun détail disponible";
        switch (latestContract.target_type) {
            case "App\\Models\\Appartement":
                const app = latestContract.target as Appartement;
                return `Étage ${app.etage} - ${app.chambres} pièces - ${app.surface} m²`;
            case "App\\Models\\Immeuble":
                const imm = latestContract.target as Immeuble;
                return imm.terrain
                    ? `Projet ${imm.terrain.nom_projet}`
                    : "Immeuble résidentiel";
            case "App\\Models\\Terrain":
                const ter = latestContract.target as Terrain;
                return `${ter.ville}${ter.quartier ? ` - ${ter.quartier}` : ""}`;
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard/clients")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors font-semibold"
                >
                    <ArrowLeft size={20} />
                    Retour aux clients
                </button>
                <div className="flex gap-3">
                    {latestContract && (
                        <button
                            onClick={() => setShowContractModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-foreground font-bold hover:bg-muted shadow-sm transition-colors"
                        >
                            <FileText size={18} className="text-emerald-500" />
                            Contrat
                        </button>
                    )}
                </div>
            </div>

            {/* Hero Section: Client & Property */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                    {/* Client Info */}
                    <div className="p-8 md:w-1/2 flex items-center gap-6">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center text-3xl font-black border border-emerald-100 dark:border-emerald-900/30">
                            {client.nom.charAt(0)}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-foreground">
                                {client.nom}
                            </h1>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                {client.cin}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <Phone
                                        size={14}
                                        className="text-emerald-500"
                                    />{" "}
                                    {client.telephone}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <Mail
                                        size={14}
                                        className="text-emerald-500"
                                    />{" "}
                                    {client.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Property Info */}
                    <div className="p-8 md:w-1/2 bg-emerald-600/5 dark:bg-emerald-900/20">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    Bien Acquis
                                </h3>
                                <p className="text-xl font-bold text-foreground">
                                    {getTargetLabel()}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {getTargetDetails()}
                                </p>
                            </div>
                            <div className="text-end">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    Prix de vente
                                </h3>
                                <p className="text-xl font-black text-emerald-600">
                                    {totalPrice.toLocaleString()} MAD
                                </p>
                            </div>
                        </div>
                        {/* Progress */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-muted-foreground uppercase">
                                    Progression
                                </span>
                                <span className="text-sm font-black text-emerald-600">
                                    {progress.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Contracts List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <FileText
                                        className="text-emerald-500"
                                        size={20}
                                    />
                                    Contrats du client
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(client.contracts ?? []).length} contrat
                                    {(client.contracts ?? []).length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    enregistré
                                    {(client.contracts ?? []).length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    navigate("/dashboard/contracts/new")
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                <Plus size={16} />
                                Nouveau contrat
                            </button>
                        </div>

                        <div className="divide-y divide-border">
                            {(client.contracts ?? []).length > 0 ? (
                                (client.contracts ?? []).map((c) => {
                                    const statusConfig: Record<
                                        string,
                                        { label: string; cls: string }
                                    > = {
                                        draft: {
                                            label: "Brouillon",
                                            cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                        },
                                        active: {
                                            label: "Actif",
                                            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                        },
                                        completed: {
                                            label: "Soldé",
                                            cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                        },
                                        cancelled: {
                                            label: "Annulé",
                                            cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                                        },
                                    };
                                    const sc =
                                        statusConfig[c.status] ??
                                        statusConfig.draft;

                                    const targetLabel = (() => {
                                        if (!c.target) return "—";
                                        const tgt = c.target as any;
                                        return (
                                            tgt.numero ??
                                            tgt.nom ??
                                            tgt.nom_projet ??
                                            "Bien"
                                        );
                                    })();

                                    const targetTypeLabel = (() => {
                                        switch (c.target_type) {
                                            case "App\\Models\\Appartement":
                                                return "Appartement";
                                            case "App\\Models\\Immeuble":
                                                return "Immeuble";
                                            case "App\\Models\\Terrain":
                                                return "Terrain";
                                            default:
                                                return "Bien";
                                        }
                                    })();

                                    const paidTotal = (
                                        c.milestones ?? []
                                    ).reduce(
                                        (sum, m) =>
                                            sum +
                                            (m.payments ?? []).reduce(
                                                (s, p) => s + Number(p.montant),
                                                0,
                                            ),
                                        0,
                                    );
                                    const contractProgress =
                                        c.total_sale_price > 0
                                            ? Math.min(
                                                  (paidTotal /
                                                      c.total_sale_price) *
                                                      100,
                                                  100,
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/contracts/${c.id}`,
                                                )
                                            }
                                            className="p-6 hover:bg-muted/30 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Left: icon + info */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all flex-shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-foreground text-sm">
                                                                {
                                                                    targetTypeLabel
                                                                }{" "}
                                                                — {targetLabel}
                                                            </p>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sc.cls}`}
                                                            >
                                                                {sc.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase">
                                                            #{" "}
                                                            {c.id
                                                                .split("-")[0]
                                                                .toUpperCase()}
                                                            {" · "}
                                                            {new Date(
                                                                c.created_at,
                                                            ).toLocaleDateString(
                                                                "fr-FR",
                                                            )}
                                                        </p>
                                                        {/* Mini progress bar */}
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-emerald-500 rounded-full"
                                                                    style={{
                                                                        width: `${contractProgress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[9px] font-black text-muted-foreground">
                                                                {contractProgress.toFixed(
                                                                    0,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Right: price + arrow */}
                                                <div className="flex items-center gap-4 flex-shrink-0">
                                                    <div className="text-end">
                                                        <p className="font-black text-foreground">
                                                            {Number(
                                                                c.total_sale_price,
                                                            ).toLocaleString()}{" "}
                                                            <span className="text-xs font-bold text-muted-foreground">
                                                                MAD
                                                            </span>
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {paidTotal.toLocaleString()}{" "}
                                                            payé
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        <CreditCard size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/40">
                                        <FileText size={28} />
                                    </div>
                                    <p className="font-bold text-foreground mb-1">
                                        Aucun contrat
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ce client n'a pas encore de contrat
                                        enregistré.
                                    </p>
                                    <button
                                        onClick={() =>
                                            navigate("/dashboard/contracts/new")
                                        }
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                        Créer un contrat
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Financial Summary & Last Payments */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Déjà payé
                                </p>
                                <p className="text-3xl font-black text-emerald-400">
                                    {totalPaid.toLocaleString()} MAD
                                </p>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Reste à payer
                                </p>
                                <p className="text-2xl font-black">
                                    {(totalPrice - totalPaid).toLocaleString()}{" "}
                                    MAD
                                </p>
                            </div>
                            <div className="pt-4">
                                {nextMilestone ? (
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                        <AlertCircle
                                            size={14}
                                            className="text-amber-500"
                                        />
                                        Prochaine échéance:{" "}
                                        {new Date(
                                            nextMilestone.due_date,
                                        ).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase">
                                        <CheckCircle2 size={14} />
                                        Dossier soldé
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Last Payments List */}
                    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Receipt
                                    size={18}
                                    className="text-emerald-500"
                                />
                                Derniers paiements
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {lastPayments.length > 0 ? (
                                lastPayments.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() =>
                                            paiementService.downloadReceipt(
                                                p.id,
                                            )
                                        }
                                        className="p-3 rounded-2xl border border-border hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black uppercase text-emerald-600">
                                                {p.milestoneLabel}
                                            </span>
                                            <Printer
                                                size={12}
                                                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-black text-foreground">
                                                    {Number(
                                                        p.montant,
                                                    ).toLocaleString()}{" "}
                                                    MAD
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(
                                                        p.date_paiement,
                                                    ).toLocaleDateString(
                                                        "fr-FR",
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                                                {p.mode_reglement}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-sm text-muted-foreground italic">
                                    Aucun paiement
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: Contrat (Contract Preview) */}
            {showContractModal && latestContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <FileText className="text-emerald-500" />
                                Aperçu du Contrat de Vente
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors flex items-center gap-2 text-sm font-bold">
                                    <Printer size={18} /> Imprimer
                                </button>
                                <button
                                    onClick={() => setShowContractModal(false)}
                                    className="p-2 hover:bg-muted text-muted-foreground transition-colors rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 bg-muted/30">
                            <div className="bg-white dark:bg-slate-100 shadow-lg mx-auto max-w-[21cm] p-[2cm] min-h-[29.7cm] text-slate-800 font-serif leading-relaxed">
                                <div className="text-center mb-12">
                                    <h1 className="text-2xl font-black uppercase tracking-widest border-b-2 border-slate-900 pb-4 mb-4">
                                        Compromis de Vente Immobilier
                                    </h1>
                                    <p className="text-sm italic">
                                        N°{" "}
                                        {latestContract.id
                                            .split("-")[0]
                                            .toUpperCase()}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className="font-bold underline uppercase mb-2">
                                            Entre les soussignés :
                                        </h3>
                                        <p className="text-justify">
                                            1. L'Agence Immobilière, sise à
                                            Casablanca, représentée par son
                                            administrateur, ci-après dénommée
                                            "Le Vendeur".
                                        </p>
                                        <p className="text-justify mt-2">
                                            2. M. / Mme{" "}
                                            <strong>{client.nom}</strong>,
                                            titulaire de la CIN n°{" "}
                                            <strong>{client.cin}</strong>,
                                            ci-après dénommé "L'Acquéreur".
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold underline uppercase mb-2">
                                            Article 1 : Objet
                                        </h3>
                                        <p className="text-justify">
                                            Le Vendeur s'engage à vendre à
                                            l'Acquéreur, qui accepte, le bien
                                            immobilier suivant :
                                            <strong> {getTargetLabel()}</strong>
                                            . {getTargetDetails()}.
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold underline uppercase mb-2">
                                            Article 2 : Prix et Modalités
                                        </h3>
                                        <p className="text-justify">
                                            La présente vente est consentie et
                                            acceptée moyennant le prix principal
                                            de
                                            <strong>
                                                {" "}
                                                {totalPrice.toLocaleString()}{" "}
                                                MAD
                                            </strong>
                                            .
                                        </p>
                                        <p className="mt-2">
                                            L'acquéreur a déjà versé à titre
                                            d'acompte la somme de{" "}
                                            <strong>
                                                {totalPaid.toLocaleString()} MAD
                                            </strong>
                                            . Le solde sera réglé selon
                                            l'échéancier convenu entre les
                                            parties.
                                        </p>
                                    </section>

                                    <section className="pt-20 grid grid-cols-2 gap-20">
                                        <div className="text-center border-t border-slate-200 pt-4">
                                            <p className="text-xs font-bold uppercase mb-16">
                                                Signature Vendeur (Cachet)
                                            </p>
                                        </div>
                                        <div className="text-center border-t border-slate-200 pt-4">
                                            <p className="text-xs font-bold uppercase mb-16">
                                                Signature Acquéreur (Légalisée)
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowContractModal(false)}
                                className="px-6 py-2 border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={handleDownloadContract}
                                className="px-6 py-2 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-colors flex items-center gap-2"
                            >
                                <Download size={18} /> Télécharger PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetails;
