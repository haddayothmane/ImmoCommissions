import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    File,
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
} from "lucide-react";
import { Immeuble } from "../types";
import EditImmeubleModal from "../components/immeubles/EditImmeubleModal";
import { useAuth } from "../hooks/useAuth";

const ImmeubleDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [building, setBuilding] = useState<any>(null);
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

    const fetchBuilding = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`/api/immeubles/${id}`);
            setBuilding(res.data);
        } catch (error) {
            console.error("Failed to fetch building", error);
            navigate("/dashboard/immeubles");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBuilding();
    }, [id]);

    const imageDocs =
        building?.documents?.filter((d: string) =>
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
        [selectedImageIndex, imageDocs.length],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleDelete = async () => {
        if (user?.role?.slug !== "admin") {
            alert(t("admin_only_delete_building"));
            return;
        }
        if (window.confirm(t("confirm_delete_building"))) {
            try {
                await axios.delete(`/api/immeubles/${id}`);
                navigate("/dashboard/immeubles");
            } catch (error) {
                console.error("Error deleting immeuble", error);
            }
        }
    };

    const handleUpdate = async (id: string, data: FormData) => {
        try {
            // Add spoofing since PHP doesn't handle multipart on PUT
            data.append("_method", "PUT");
            await axios.post(`/api/immeubles/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchBuilding();
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating building", error);
            alert(t("error_occured"));
        }
    };

    const handleDocUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docFiles || docFiles.length === 0) return;

        setIsUploadingDocs(true);
        const data = new FormData();
        Array.from(docFiles).forEach((file) => {
            data.append("files[]", file);
        });
        data.append("_method", "PUT");

        try {
            await axios.post(`/api/immeubles/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchBuilding();
            setShowDocModal(false);
            setDocFiles(null);
        } catch (error) {
            console.error("Failed to upload documents", error);
            alert(t("error_occured"));
        } finally {
            setIsUploadingDocs(false);
        }
    };

    const handleStatutChange = async (newStatut: string) => {
        if (!building || newStatut === building.statut) return;
        setIsUpdatingStatut(true);
        try {
            const payload = new FormData();
            payload.append("statut", newStatut);
            payload.append("_method", "PUT");
            await axios.post(`/api/immeubles/${id}`, payload);
            await fetchBuilding();
            setShowStatutDropdown(false);
        } catch (error) {
            console.error("Failed to update statut", error);
            alert(t("error_occured"));
        } finally {
            setIsUpdatingStatut(false);
        }
    };

    const handleDeleteDocument = async (
        e: React.MouseEvent,
        docUrl: string,
    ) => {
        e.stopPropagation();
        if (!confirm(t("confirm_delete_doc"))) return;

        try {
            await axios.delete(`/api/immeubles/${id}/documents`, {
                data: { file_url: docUrl },
            });
            await fetchBuilding();
        } catch (error) {
            console.error("Failed to delete document", error);
            alert(t("error_deleting_doc"));
        }
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % imageDocs.length);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex(
                (selectedImageIndex - 1 + imageDocs.length) % imageDocs.length,
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="font-bold">{t("loading_building")}</p>
            </div>
        );
    }

    if (!building) return null;

    const FALLBACK_IMG =
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200";

    // Find first image for hero
    const heroImage =
        building.documents?.find((d: string) =>
            /\.(jpe?g|png|gif|webp|svg)$/i.test(d),
        ) ??
        `https://loremflickr.com/1200/400/${encodeURIComponent(building.terrain?.ville || "city")},building?lock=${building.id}`;

    const statutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        sur_plan: {
            label: "Sur plan",
            bg: "bg-blue-500",
            text: "text-white",
            dot: "bg-blue-300",
        },
        en_construction: {
            label: "En construction",
            bg: "bg-amber-500",
            text: "text-white",
            dot: "bg-amber-300",
        },
        livre: {
            label: "Livré",
            bg: "bg-emerald-500",
            text: "text-white",
            dot: "bg-emerald-300",
        },
    };

    const currentStatutCfg =
        statutConfig[building.statut] || statutConfig["sur_plan"];

    return (
        <div className="space-y-8 animate-fadeIn">
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
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground font-bold hover:bg-muted shadow-sm transition-colors"
                        onClick={() => setShowEditModal(true)}
                    >
                        <Edit3 size={18} />
                        {t("edit")}
                    </button>
                    {user?.role?.slug === "admin" && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 shadow-sm transition-colors"
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
                        className="w-full h-full object-cover opacity-60"
                        alt={building.nom}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMG;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute bottom-8 start-8 end-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            {user?.role?.slug === "admin" ? (
                                <div
                                    className="relative"
                                    ref={statutDropdownRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            !isUpdatingStatut &&
                                            setShowStatutDropdown((v) => !v)
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg transition-all ${
                                            currentStatutCfg.bg
                                        } ${currentStatutCfg.text} ${isUpdatingStatut ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
                                    >
                                        {isUpdatingStatut ? (
                                            <Loader2
                                                size={11}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${currentStatutCfg.dot} shrink-0`}
                                            />
                                        )}
                                        {currentStatutCfg.label}
                                        <ChevronDown
                                            size={11}
                                            className={`opacity-80 transition-transform duration-200 ${showStatutDropdown ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {showStatutDropdown && (
                                        <div className="absolute start-0 top-full mt-2 w-44 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-20 animate-fadeIn">
                                            {Object.entries(statutConfig).map(
                                                ([key, cfg]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            setShowStatutDropdown(
                                                                false,
                                                            );
                                                            handleStatutChange(
                                                                key,
                                                            );
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold transition-colors ${
                                                            building.statut ===
                                                            key
                                                                ? "bg-muted text-foreground"
                                                                : "text-muted-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.bg}`}
                                                        />
                                                        {cfg.label}
                                                        {building.statut ===
                                                            key && (
                                                            <svg
                                                                className="ms-auto w-4 h-4 text-emerald-500 shrink-0"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${currentStatutCfg.bg} ${currentStatutCfg.text} flex items-center gap-1.5`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${currentStatutCfg.dot}`}
                                    />
                                    {currentStatutCfg.label}
                                </span>
                            )}
                            {building.terrain && (
                                <span className="text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                    <MapPin size={12} />{" "}
                                    {building.terrain.ville} •{" "}
                                    {building.terrain.nom_projet}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black">
                            {building.nom}
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
                                {t("building_details")}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed italic">
                                {building.description ||
                                    t("no_description_provided")}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("floors")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {building.nombre_etages}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("total_units")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {building.appartements_count}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("sold")}
                                </p>
                                <p className="text-lg font-bold text-emerald-600">
                                    {building.appartements_vendus}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("available")}
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {building.appartements_count -
                                        building.appartements_vendus}
                                </p>
                            </div>
                        </div>

                        <section className="pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                                <span>
                                    {t("units")} ({t("appartements")})
                                </span>
                                {/* Future implementation: link to add appartement */}
                                <button className="text-sm text-emerald-600 font-bold hover:underline">
                                    + {t("add_unit")}
                                </button>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {building.appartements?.length > 0 ? (
                                    building.appartements.map((apt: any) => (
                                        <div
                                            key={apt.id}
                                            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-emerald-200 transition-colors shadow-sm cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/appartements/${apt.id}`,
                                                )
                                            }
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                                    <Layers size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">
                                                        {t("appartement")}{" "}
                                                        {apt.numero}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t("floor")} {apt.etage}{" "}
                                                        • {apt.chambres}{" "}
                                                        {t("rooms")}•{" "}
                                                        {apt.surface}m²
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        apt.statut === "vendu"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            : apt.statut ===
                                                                "reserve"
                                                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {apt.statut}
                                                </span>
                                                <ChevronRight
                                                    size={18}
                                                    className="text-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic py-4">
                                        {t("no_results")}
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                                <span>{t("docs_and_media")}</span>
                                <button
                                    onClick={() => setShowDocModal(true)}
                                    className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    {t("add_document")}
                                </button>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {building.documents?.map(
                                    (docUrl: string, index: number) => {
                                        const name =
                                            docUrl.split("/").pop() ||
                                            "Document";
                                        const isImage =
                                            /\.(jpe?g|png|gif|webp|svg)$/i.test(
                                                docUrl,
                                            );

                                        return (
                                            <div
                                                key={index}
                                                className="group relative bg-card border border-border rounded-2xl p-4 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`shrink-0 ${isImage ? "cursor-pointer" : ""}`}
                                                        onClick={() => {
                                                            if (isImage) {
                                                                const idx =
                                                                    imageDocs.indexOf(
                                                                        docUrl,
                                                                    );
                                                                setSelectedImageIndex(
                                                                    idx,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {isImage ? (
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted/50">
                                                                <img
                                                                    src={docUrl}
                                                                    alt={name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                                                <File
                                                                    size={28}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="font-bold text-foreground truncate mb-0.5"
                                                            title={name}
                                                        >
                                                            {name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                            <span>DOC</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={docUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                            title={t(
                                                                "view_details",
                                                            )}
                                                        >
                                                            <Eye size={16} />
                                                        </a>
                                                        <button
                                                            onClick={(e) =>
                                                                handleDeleteDocument(
                                                                    e,
                                                                    docUrl,
                                                                )
                                                            }
                                                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title={t("delete")}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="p-6 bg-muted/50 rounded-2xl border border-border space-y-6">
                            <h4 className="font-bold text-foreground">
                                {t("traceability")}
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground shadow-sm">
                                    {building.created_by_name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("") || "?"}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("created_by")}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {building.created_by_name ||
                                            t("unknown")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-sm">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("creation_date")}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {new Date(
                                            building.created_at,
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

                        {building.date_debut && (
                            <div className="p-6 bg-muted/50 rounded-2xl border border-border space-y-4">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <Calendar
                                        size={18}
                                        className="text-emerald-500"
                                    />
                                    Calendrier
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            Début travaux
                                        </p>
                                        <p className="text-sm font-bold text-foreground">
                                            {new Date(
                                                building.date_debut,
                                            ).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {building.date_livraison && (
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                Livraison prévue
                                            </p>
                                            <p className="text-sm font-bold text-emerald-600">
                                                {new Date(
                                                    building.date_livraison,
                                                ).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-6 bg-emerald-900 rounded-2xl text-white space-y-4 shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText
                                    size={20}
                                    className="text-emerald-400"
                                />
                                <h4 className="font-bold">
                                    {t("quick_actions")}
                                </h4>
                            </div>
                            <button
                                className="w-full py-3 bg-emerald-800 dark:bg-emerald-900/50 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                onClick={() => alert(t("generating_contract"))}
                            >
                                {t("generate_progress")}
                            </button>
                            <button
                                className="w-full py-3 bg-card text-emerald-900 dark:text-emerald-400 hover:bg-muted rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                onClick={() => alert("Ouverture du plan...")}
                            >
                                {t("view_layout_plan")}
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditImmeubleModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdate}
                immeuble={building}
            />

            {/* Document Upload Modal */}
            {showDocModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <FileText
                                    className="text-emerald-500"
                                    size={20}
                                />
                                Ajouter un document
                            </h2>
                            <button
                                onClick={() => setShowDocModal(false)}
                                className="p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleDocUpload}
                            className="p-8 space-y-6"
                        >
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block tracking-wide">
                                    Fichiers à importer
                                </label>
                                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors bg-muted/30">
                                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Images, PDF, Word…
                                    </p>
                                    <input
                                        type="file"
                                        multiple
                                        required
                                        onChange={(e) =>
                                            setDocFiles(e.target.files)
                                        }
                                        className="block w-full text-sm text-muted-foreground
                                            file:me-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-emerald-50 dark:file:bg-emerald-900/20 file:text-emerald-600 dark:file:text-emerald-400
                                            hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/40 cursor-pointer"
                                    />
                                </div>
                                {docFiles && docFiles.length > 0 && (
                                    <p className="mt-2 text-xs text-emerald-600 font-semibold text-center">
                                        {docFiles.length} fichier(s)
                                        sélectionné(s)
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDocModal(false)}
                                    className="flex-1 py-3.5 border border-border rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isUploadingDocs ||
                                        !docFiles ||
                                        docFiles.length === 0
                                    }
                                    className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploadingDocs ? (
                                        <>
                                            <Loader2
                                                className="animate-spin"
                                                size={18}
                                            />
                                            Envoi…
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Importer
                                        </>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedImageIndex(null)}
                >
                    <button
                        className="absolute top-6 end-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                        onClick={() => setSelectedImageIndex(null)}
                    >
                        <X size={28} />
                    </button>

                    {imageDocs.length > 1 && (
                        <button
                            className="absolute start-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                            onClick={handlePrevImage}
                        >
                            <ChevronLeft size={36} />
                        </button>
                    )}

                    <div
                        className="relative max-w-5xl max-h-[85vh] w-full px-16 flex justify-center items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {imageDocs[selectedImageIndex] && (
                            <img
                                src={imageDocs[selectedImageIndex]}
                                alt="Building document preview"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
                                referrerPolicy="no-referrer"
                            />
                        )}

                        <div className="absolute -bottom-12 start-0 end-0 text-center text-white/70 text-sm font-medium tracking-wide">
                            {selectedImageIndex + 1} / {imageDocs.length}
                        </div>
                    </div>

                    {imageDocs.length > 1 && (
                        <button
                            className="absolute end-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                            onClick={handleNextImage}
                        >
                            <ChevronRight size={36} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImmeubleDetails;
