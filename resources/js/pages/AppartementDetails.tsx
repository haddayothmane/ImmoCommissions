import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    Edit3,
    Trash2,
    Share2,
    ExternalLink,
    Square,
    Coins,
    Activity,
    ChevronRight,
    FileText,
    File as FileIcon,
    Image as ImageIcon,
    Download,
    Eye,
    Plus,
    Building2,
    Layers,
    Loader2,
    X,
    ChevronLeft,
    ChevronDown,
    Home,
    Maximize,
    DoorOpen,
    Bed,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShieldCheck,
} from "lucide-react";
import { Appartement, Immeuble, Client } from "../types";
import EditAppartementModal from "../components/appartements/EditAppartementModal";
import { useAuth } from "../hooks/useAuth";
import { appartementService } from "../api/appartementService";
import { paiementService } from "../api/paiementService";

const AppartementDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [appartement, setAppartement] = useState<Appartement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
        null,
    );
    const [showDocModal, setShowDocModal] = useState(false);
    const [docFiles, setDocFiles] = useState<FileList | null>(null);
    const [isUploadingDocs, setIsUploadingDocs] = useState(false);
    const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
    const [showStatutDropdown, setShowStatutDropdown] = useState(false);
    const statutDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                statutDropdownRef.current &&
                !statutDropdownRef.current.contains(e.target as Node)
            ) {
                setShowStatutDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchAppartement = async () => {
        try {
            setIsLoading(true);
            const data = await appartementService.getAppartement(id!);
            setAppartement(data);
        } catch (error) {
            console.error("Failed to fetch appartement", error);
            navigate("/dashboard/appartements");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAppartement();
    }, [id]);

    const imageDocs =
        appartement?.documents?.filter((d: string) =>
            /\.(jpe?g|png|gif|webp|svg)$/i.test(d),
        ) || [];

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) =>
                    prev !== null ? (prev + 1) % imageDocs.length : null,
                );
            } else if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) =>
                    prev !== null
                        ? (prev - 1 + imageDocs.length) % imageDocs.length
                        : null,
                );
            } else if (e.key === "Escape") {
                setSelectedImageIndex(null);
            }
        },
        [selectedImageIndex, imageDocs],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (selectedImageIndex === null) return;
            if (e.deltaY > 0) {
                // Scroll down -> Next
                setSelectedImageIndex((prev) =>
                    prev !== null ? (prev + 1) % imageDocs.length : null,
                );
            } else if (e.deltaY < 0) {
                // Scroll up -> Prev
                setSelectedImageIndex((prev) =>
                    prev !== null
                        ? (prev - 1 + imageDocs.length) % imageDocs.length
                        : null,
                );
            }
        },
        [selectedImageIndex, imageDocs],
    );

    useEffect(() => {
        if (selectedImageIndex !== null) {
            window.addEventListener("wheel", handleWheel);
        }
        return () => window.removeEventListener("wheel", handleWheel);
    }, [selectedImageIndex, handleWheel]);

    useEffect(() => {
        if (selectedImageIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedImageIndex]);

    const handleUpdate = async (id: string, data: FormData) => {
        try {
            await appartementService.updateAppartement(id, data);
            fetchAppartement();
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating appartement", error);
            alert(t("error_occured"));
        }
    };

    const handleDelete = async () => {
        if (user?.role?.slug !== "admin") {
            alert(t("admin_only_delete_terrain")); // Assuming you want a similar admin check
            return;
        }
        if (
            window.confirm(t("confirm_delete_terrain")) // Example reuse if same message
        ) {
            try {
                await appartementService.deleteAppartement(appartement!.id);
                navigate("/dashboard/appartements");
            } catch (error) {
                console.error("Error deleting appartement", error);
            }
        }
    };

    const handleUploadDocs = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docFiles || docFiles.length === 0) return;

        try {
            setIsUploadingDocs(true);
            const data = new FormData();
            Array.from(docFiles).forEach((file) =>
                data.append("files[]", file),
            );
            await appartementService.updateAppartement(appartement!.id, data);
            fetchAppartement();
            setShowDocModal(false);
            setDocFiles(null);
        } catch (error) {
            console.error("Error uploading documents", error);
            alert(t("error_occured"));
        } finally {
            setIsUploadingDocs(false);
        }
    };

    const handleDeleteDoc = async (fileUrl: string) => {
        if (window.confirm(t("confirm_delete_doc"))) {
            try {
                await appartementService.deleteDocument(
                    appartement!.id,
                    fileUrl,
                );
                fetchAppartement();
            } catch (error) {
                console.error("Error deleting document", error);
            }
        }
    };

    const handleDownloadContract = async () => {
        const contract = appartement?.contracts?.find(
            (c) => c.status === "active" || c.status === "completed",
        );
        if (!contract) {
            alert(
                "Aucun contrat actif trouvé pour cet appartement. Veuillez d'abord créer un contrat dans la section 'Ventes'.",
            );
            return;
        }

        try {
            const response = await axios.get(
                `/api/contracts/${contract.id}/pdf?lang=fr`,
                {
                    responseType: "blob",
                },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `contrat_${appartement?.numero}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download contract", error);
            alert("Erreur lors du téléchargement du contrat.");
        }
    };

    const handleDownloadReceipt = async (paymentId?: string) => {
        let idToUse = paymentId;

        // If no ID provided, try to find the latest payment
        if (
            !idToUse &&
            appartement?.paiements &&
            appartement.paiements.length > 0
        ) {
            idToUse = appartement.paiements[0].id; // paiements are sorted latest first in Controller
        }

        if (!idToUse) {
            alert("Aucun paiement trouvé pour cet appartement.");
            return;
        }

        try {
            await paiementService.downloadReceipt(idToUse);
        } catch (error) {
            console.error("Failed to download receipt", error);
            alert("Erreur lors du téléchargement du reçu.");
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            setIsUpdatingStatut(true);
            const data = new FormData();
            data.append("statut", newStatus);
            await appartementService.updateAppartement(appartement!.id, data);
            fetchAppartement();
            setShowStatutDropdown(false);
        } catch (error) {
            console.error("Error updating status", error);
            alert(t("error_occured"));
        } finally {
            setIsUpdatingStatut(false);
        }
    };

    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case "disponible":
                return <CheckCircle2 size={12} />;
            case "reserve":
                return <Clock size={12} />;
            case "vendu":
                return <ShieldCheck size={12} />;
            default:
                return <AlertCircle size={12} />;
        }
    };

    const getStatusStyle = (statut: string) => {
        switch (statut) {
            case "disponible":
                return "bg-emerald-500 shadow-emerald-500/40 text-white";
            case "reserve":
                return "bg-blue-500 shadow-blue-500/40 text-white";
            case "vendu":
                return "bg-rose-600 shadow-rose-600/40 text-white";
            default:
                return "bg-slate-500 text-white";
        }
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">
                    {t("loading_details")}
                </p>
            </div>
        );
    }

    if (!appartement) return null;

    const FALLBACK_IMG = `https://picsum.photos/seed/apt${appartement.id}/1200/400`;
    const heroImage = imageDocs[0]
        ? imageDocs[0].startsWith("http")
            ? imageDocs[0]
            : `${imageDocs[0]}`
        : FALLBACK_IMG;

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors font-semibold group"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    {t("back")}
                </button>
                <div className="flex gap-3">
                    <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted shadow-sm transition-colors">
                        <Share2 size={18} />
                    </button>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground font-bold hover:bg-muted shadow-sm transition-colors"
                    >
                        <Edit3 size={18} className="text-emerald-500" />
                        {t("edit")}
                    </button>
                    {user?.role?.slug === "admin" && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold hover:bg-rose-500/20 shadow-sm transition-colors"
                        >
                            <Trash2 size={18} />
                            {t("delete")}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Info Card */}
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
                <div className="relative h-64 md:h-80 bg-slate-900">
                    <img
                        src={heroImage}
                        className={`w-full h-full object-cover opacity-60 transition-transform duration-700 ${imageDocs.length > 0 ? "cursor-pointer hover:scale-105" : ""}`}
                        alt={`Appartement ${appartement.numero}`}
                        onClick={() =>
                            imageDocs.length > 0 && setSelectedImageIndex(0)
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute bottom-8 start-8 end-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative" ref={statutDropdownRef}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStatutDropdown(
                                            !showStatutDropdown,
                                        );
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest ${getStatusStyle(appartement.statut)} shadow-lg hover:scale-105 transition-all active:scale-95 group/statut`}
                                >
                                    {isUpdatingStatut ? (
                                        <Loader2
                                            size={12}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <>
                                            {getStatusIcon(appartement.statut)}
                                            {t(appartement.statut)}
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-300 group-hover/statut:translate-y-0.5 ${showStatutDropdown ? "rotate-180" : ""}`}
                                            />
                                        </>
                                    )}
                                </button>

                                {showStatutDropdown && (
                                    <div className="absolute top-full start-0 mt-3 w-56 bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[150] overflow-hidden animate-scaleIn origin-top-left backdrop-blur-xl">
                                        <div className="p-2.5 space-y-1.5">
                                            {[
                                                "disponible",
                                                "reserve",
                                                "vendu",
                                            ].map((st) => (
                                                <button
                                                    key={st}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateStatus(st);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                                        appartement.statut ===
                                                        st
                                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`${appartement.statut === st ? "text-white" : "text-muted-foreground"}`}
                                                        >
                                                            {getStatusIcon(st)}
                                                        </span>
                                                        <span className="uppercase tracking-widest">
                                                            {t(st)}
                                                        </span>
                                                    </div>
                                                    {appartement.statut ===
                                                        st && (
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                <Building2 size={12} />{" "}
                                {appartement.immeuble?.terrain?.nom_projet ||
                                    "Indépendant"}{" "}
                                • {appartement.immeuble?.nom || "N/A"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black">
                            {t("appartement")} {appartement.numero}
                        </h1>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Activity
                                    size={20}
                                    className="text-emerald-500"
                                />
                                {t("description")}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {appartement.description ||
                                    t("no_description_provided")}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("floor")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {appartement.etage}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("rooms")}
                                </p>
                                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <DoorOpen
                                        size={18}
                                        className="text-muted-foreground"
                                    />
                                    {appartement.chambres}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("surface")}
                                </p>
                                <p className="text-lg font-bold text-foreground flex items-center gap-1">
                                    <Maximize
                                        size={18}
                                        className="text-muted-foreground"
                                    />
                                    {appartement.surface}{" "}
                                    <span className="text-xs text-muted-foreground">
                                        m²
                                    </span>
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("total_price")}
                                </p>
                                <p className="text-lg font-bold text-emerald-600">
                                    {(
                                        Number(appartement.prix_total) / 1000
                                    ).toLocaleString()}
                                    k{" "}
                                    <span className="text-xs text-muted-foreground">
                                        MAD
                                    </span>
                                </p>
                            </div>
                        </div>

                        <section className="pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                                <span>{t("payment_history")}</span>
                                <button className="text-sm text-emerald-600 font-bold hover:underline">
                                    + {t("new_payment")}
                                </button>
                            </h3>
                            <div className="space-y-3">
                                {appartement.paiements &&
                                appartement.paiements.length > 0 ? (
                                    appartement.paiements.map((pay) => (
                                        <div
                                            key={pay.id}
                                            className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-emerald-500/50 transition-all"
                                        >
                                            <div
                                                onClick={() =>
                                                    handleDownloadReceipt(
                                                        pay.id,
                                                    )
                                                }
                                                className="flex items-center gap-4 cursor-pointer group/item"
                                            >
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                                                    <Coins size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover/item:text-emerald-600 transition-colors">
                                                        {pay.reference ||
                                                            t("payment")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            pay.date_paiement,
                                                        ).toLocaleDateString(
                                                            "fr-FR",
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-end">
                                                    <p className="font-bold text-foreground">
                                                        {pay.montant.toLocaleString()}{" "}
                                                        MAD
                                                    </p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-600">
                                                        {t("confirmed")}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadReceipt(
                                                            pay.id,
                                                        );
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors group-hover:opacity-100"
                                                    title="Télécharger le reçu"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-muted/20 border border-dashed border-border rounded-xl">
                                        <p className="text-sm text-muted-foreground">
                                            {t("no_payments_yet")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                                <span>{t("docs_and_media")}</span>
                                <button
                                    onClick={() => setShowDocModal(true)}
                                    className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    {t("add_document")}
                                </button>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {appartement.documents?.map((doc, idx) => {
                                    const fileName =
                                        doc.split("/").pop() || "Document";
                                    const isImage =
                                        /\.(jpe?g|png|gif|webp|svg)$/i.test(
                                            doc,
                                        );
                                    const fileUrl = doc.startsWith("http")
                                        ? doc
                                        : `${doc}`;

                                    return (
                                        <div
                                            key={idx}
                                            className="group relative bg-card border border-border rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="shrink-0">
                                                    {isImage ? (
                                                        <div
                                                            className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted cursor-pointer active:scale-95 transition-transform"
                                                            onClick={() => {
                                                                const imgIdx =
                                                                    imageDocs.indexOf(
                                                                        doc,
                                                                    );
                                                                if (
                                                                    imgIdx !==
                                                                    -1
                                                                )
                                                                    setSelectedImageIndex(
                                                                        imgIdx,
                                                                    );
                                                            }}
                                                        >
                                                            <img
                                                                src={fileUrl}
                                                                alt={fileName}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                                                            <FileIcon
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="font-bold text-foreground truncate mb-0.5"
                                                        title={fileName}
                                                    >
                                                        {fileName}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        <span>
                                                            {isImage
                                                                ? t(
                                                                      "docs_and_media",
                                                                  )
                                                                : t(
                                                                      "docs_and_media",
                                                                  )}
                                                        </span>
                                                        <span>•</span>
                                                        <span>DOC</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isImage ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const imgIdx =
                                                                    imageDocs.indexOf(
                                                                        doc,
                                                                    );
                                                                if (
                                                                    imgIdx !==
                                                                    -1
                                                                )
                                                                    setSelectedImageIndex(
                                                                        imgIdx,
                                                                    );
                                                            }}
                                                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            title={t(
                                                                "view_details",
                                                            )}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    ) : (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            title={t(
                                                                "view_details",
                                                            )}
                                                        >
                                                            <Eye size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteDoc(doc)
                                                        }
                                                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                        title={t("delete")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-6">
                            <h4 className="font-bold text-foreground tracking-tight flex items-center justify-between">
                                {t("status")} & {t("traceability")}
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-card border border-border rounded-xl relative group/sidebar-statut">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                                        {t("current_status")}
                                    </p>
                                    <button
                                        onClick={() =>
                                            setShowStatutDropdown(
                                                !showStatutDropdown,
                                            )
                                        }
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getStatusStyle(appartement.statut)} shadow-lg active:scale-95`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(appartement.statut)}
                                            {t(appartement.statut)}
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 ${showStatutDropdown ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {showStatutDropdown && (
                                        <div className="absolute bottom-full start-0 mb-3 w-full bg-card border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden animate-scaleIn origin-bottom backdrop-blur-xl">
                                            <div className="p-2 space-y-1">
                                                {[
                                                    "disponible",
                                                    "reserve",
                                                    "vendu",
                                                ].map((st) => (
                                                    <button
                                                        key={st}
                                                        onClick={() =>
                                                            updateStatus(st)
                                                        }
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black transition-all ${
                                                            appartement.statut ===
                                                            st
                                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        } uppercase tracking-widest`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(st)}
                                                            {t(st)}
                                                        </div>
                                                        {appartement.statut ===
                                                            st && (
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground border border-border shadow-sm">
                                        {(
                                            appartement.creator?.full_name ||
                                            "Agent"
                                        )
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {t("created_by")}
                                        </p>
                                        <p className="text-sm font-bold text-foreground">
                                            {appartement.creator?.full_name ||
                                                "Agent"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {t("creation_date")}
                                        </p>
                                        <p className="text-sm font-bold text-foreground">
                                            {new Date(
                                                appartement.created_at!,
                                            ).toLocaleDateString(
                                                i18n.language === "ar"
                                                    ? "ar-MA"
                                                    : "fr-FR",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {appartement.client ? (
                            <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <User
                                        size={18}
                                        className="text-emerald-500"
                                    />
                                    {t("client")}
                                </h4>
                                <div className="flex items-center gap-3 border border-border bg-card p-3 rounded-xl shadow-sm">
                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                                        {appartement.client.nom
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {appartement.client.nom}
                                        </p>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/clients/${appartement.client?.id}`,
                                                )
                                            }
                                            className="text-xs text-emerald-600 font-black uppercase tracking-tighter hover:underline"
                                        >
                                            Voir profil client
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4 text-center">
                                <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto text-muted-foreground/30 border border-border shadow-sm">
                                    <User size={24} />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Aucun client rattaché
                                </p>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                                >
                                    Attribuer à un client
                                </button>
                            </div>
                        )}

                        <div className="p-6 bg-emerald-900 dark:bg-emerald-950 rounded-2xl text-white space-y-4 shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText
                                    size={20}
                                    className="text-emerald-400"
                                />
                                <h4 className="font-bold uppercase tracking-widest text-xs">
                                    Actions rapides
                                </h4>
                            </div>
                            <button
                                onClick={handleDownloadContract}
                                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                Générer Contrat
                            </button>
                            <button
                                onClick={() => handleDownloadReceipt()}
                                className="w-full py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                Générer Reçu
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditAppartementModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdate}
                appartement={appartement}
            />

            {/* Doc Upload Modal */}
            {showDocModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                <ImageIcon className="text-emerald-500" />
                                AJOUTER DES DOCUMENTS
                            </h3>
                            <button
                                onClick={() => setShowDocModal(false)}
                                className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUploadDocs} className="p-6">
                            <div className="border-2 border-dashed border-border rounded-2xl p-8 transition-all hover:border-emerald-500/50 flex flex-col items-center text-center group cursor-pointer relative mb-6">
                                <Plus
                                    className="text-muted-foreground mb-3 transition-transform group-hover:scale-125 group-hover:text-emerald-500"
                                    size={32}
                                />
                                <p className="text-sm font-bold text-foreground mb-1">
                                    {docFiles
                                        ? `${docFiles.length} fichiers sélectionnés`
                                        : "Cliquer pour parcourir"}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                    PDF, IMAGES (MAX 10MB)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) =>
                                        setDocFiles(e.target.files)
                                    }
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDocModal(false)}
                                    className="flex-1 px-4 py-3 bg-muted text-muted-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-border transition-all"
                                >
                                    ANNULER
                                </button>
                                <button
                                    type="submit"
                                    disabled={!docFiles || isUploadingDocs}
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUploadingDocs ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        "TÉLÉVERSER"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox / Full-screen Gallery */}
            {selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center animate-fadeIn group"
                    onClick={() => setSelectedImageIndex(null)}
                >
                    {/* Top Controls */}
                    <div className="absolute top-0 start-0 end-0 p-8 flex items-center justify-between z-[220] bg-gradient-to-b from-black/60 to-transparent">
                        <div className="flex items-center gap-4">
                            <h2 className="text-white font-black uppercase tracking-widest text-xs py-2 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                {selectedImageIndex + 1} / {imageDocs.length}{" "}
                                Photos
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={
                                    imageDocs[selectedImageIndex].startsWith(
                                        "http",
                                    )
                                        ? imageDocs[selectedImageIndex]
                                        : `${imageDocs[selectedImageIndex]}`
                                }
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all border border-white/10 group/btn"
                                title="Télécharger"
                            >
                                <Download
                                    size={20}
                                    className="group-hover/btn:scale-110"
                                />
                            </a>
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="p-3 bg-white/10 hover:bg-rose-500/80 backdrop-blur-md rounded-xl text-white transition-all border border-white/10 group/btn"
                                title="Fermer"
                            >
                                <X
                                    size={20}
                                    className="group-hover/btn:rotate-90 transition-transform duration-500"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                                prev !== null
                                    ? (prev - 1 + imageDocs.length) %
                                      imageDocs.length
                                    : null,
                            );
                        }}
                        className="absolute start-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-8 md:p-10 bg-white/5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-md z-[210] border border-white/5 hover:border-white/20 active:scale-95 shadow-2xl"
                    >
                        <ChevronLeft size={48} strokeWidth={1} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                                prev !== null
                                    ? (prev + 1) % imageDocs.length
                                    : null,
                            );
                        }}
                        className="absolute end-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-8 md:p-10 bg-white/5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-md z-[210] border border-white/5 hover:border-white/20 active:scale-95 shadow-2xl"
                    >
                        <ChevronRight size={48} strokeWidth={1} />
                    </button>

                    {/* Main Image View */}
                    <div className="w-full h-full p-4 md:p-24 flex items-center justify-center pointer-events-none">
                        <img
                            src={
                                imageDocs[selectedImageIndex].startsWith("http")
                                    ? imageDocs[selectedImageIndex]
                                    : `${imageDocs[selectedImageIndex]}`
                            }
                            className="max-w-full max-h-[85vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-scaleIn select-none rounded-lg pointer-events-auto"
                            alt="Visualisation"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Thumbnail Strip Overlay */}
                    <div className="absolute bottom-8 start-1/2 -translate-x-1/2 flex items-center gap-3 p-4 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 max-w-[95vw] overflow-x-auto no-scrollbar z-[220] shadow-2xl">
                        {imageDocs.map((doc, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex(idx);
                                }}
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 relative group/thumb ${
                                    selectedImageIndex === idx
                                        ? "border-emerald-500 scale-105 shadow-xl shadow-emerald-500/20 z-10"
                                        : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                                }`}
                            >
                                <img
                                    src={
                                        doc.startsWith("http") ? doc : `${doc}`
                                    }
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                                {selectedImageIndex === idx && (
                                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppartementDetails;
