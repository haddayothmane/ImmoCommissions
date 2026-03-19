import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User as UserIcon,
    Edit3,
    Trash2,
    Share2,
    ExternalLink,
    Square,
    Coins,
    Activity,
    ChevronRight,
    ChevronDown,
    FileText,
    Plus,
    Eye,
    Download,
    File as FileIcon,
    X,
    ChevronLeft,
    Layout,
    Loader2,
    Building2,
    Building,
} from "lucide-react";
import { Terrain, Immeuble } from "../types";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import CreateImmeubleModal from "../components/immeubles/CreateImmeubleModal";

const ItemDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [terrain, setTerrain] = React.useState<Terrain | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState<
        number | null
    >(null);
    const [showForm, setShowForm] = React.useState(false);
    const [showDocModal, setShowDocModal] = React.useState(false);
    const [docFiles, setDocFiles] = React.useState<FileList | null>(null);
    const [isUploadingDocs, setIsUploadingDocs] = React.useState(false);
    const [isUpdatingStatut, setIsUpdatingStatut] = React.useState(false);
    const [showStatutDropdown, setShowStatutDropdown] = React.useState(false);
    const [showAddImmeubleModal, setShowAddImmeubleModal] =
        React.useState(false);
    const statutDropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
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
    const [formData, setFormData] = React.useState({
        id: "",
        nom_projet: "",
        ville: "",
        quartier: "",
        surface: "",
        prix_achat: "",
        statut: "disponible" as any,
        description: "",
    });

    // Document URLs removed – API endpoint deleted.

    // Pre-calculate image documents for the gallery
    const docs = terrain?.documents ? terrain.documents : [];
    const imageDocs = docs.filter((doc: string) => {
        const ext = doc.split(".").pop()?.toLowerCase();
        return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "");
    });

    const isLightBoxOpen = selectedImageIndex !== null;
    const currentImageUrl =
        isLightBoxOpen && imageDocs[selectedImageIndex]
            ? imageDocs[selectedImageIndex]
            : "";

    const FALLBACK_IMG =
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200";
    const heroImage = imageDocs[0] ?? FALLBACK_IMG;

    const handleKeyDown = React.useCallback(
        (e: KeyboardEvent) => {
            if (!isLightBoxOpen) return;
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
        [isLightBoxOpen, imageDocs.length],
    );

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    React.useEffect(() => {
        const fetchTerrain = async () => {
            try {
                const response = await axios.get(`/api/terrains/${id}`);
                setTerrain(response.data);

                // Document fetch removed – endpoint no longer exists.
            } catch (error) {
                console.error("Failed to fetch terrain", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTerrain();
    }, [id]);

    const handleDelete = async () => {
        if (user?.role?.slug !== "admin") {
            alert(t("admin_only_delete_terrain"));
            return;
        }

        if (!confirm(t("confirm_delete_terrain"))) {
            return;
        }

        try {
            await axios.delete(`/api/terrains/${id}`);
            navigate("/dashboard/inventory");
        } catch (error) {
            console.error("Failed to delete terrain", error);
            alert(t("error_occured"));
        }
    };

    const handleStatutChange = async (newStatut: string) => {
        if (!terrain || newStatut === terrain.statut) return;
        setIsUpdatingStatut(true);
        try {
            const payload = new FormData();
            payload.append("nom_projet", terrain.nom_projet || "");
            payload.append("ville", terrain.ville || "");
            payload.append("quartier", terrain.quartier || "");
            payload.append("surface", String(Number(terrain.surface)));
            payload.append("prix_achat", String(Number(terrain.prix_achat)));
            payload.append("statut", newStatut);
            if (terrain.description)
                payload.append("description", terrain.description);
            payload.append("_method", "PUT");
            await axios.post(`/api/terrains/${id}`, payload);
            setTerrain({ ...terrain, statut: newStatut as any });
        } catch (error) {
            console.error("Failed to update statut", error);
            alert(t("error_occured"));
        } finally {
            setIsUpdatingStatut(false);
        }
    };

    const statutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        disponible: {
            label: "Disponible",
            bg: "bg-emerald-500",
            text: "text-white",
            dot: "bg-emerald-300",
        },
        vendu: {
            label: "Vendu",
            bg: "bg-slate-700",
            text: "text-white",
            dot: "bg-slate-400",
        },
        en_cours: {
            label: "En cours",
            bg: "bg-amber-500",
            text: "text-white",
            dot: "bg-amber-300",
        },
        reserve: {
            label: "Réservé",
            bg: "bg-blue-500",
            text: "text-white",
            dot: "bg-blue-300",
        },
    };
    const currentStatutCfg =
        statutConfig[terrain?.statut ?? ""] ?? statutConfig["disponible"];

    const handleDocUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docFiles || docFiles.length === 0) return;
        setIsUploadingDocs(true);
        try {
            const payload = new FormData();
            // Keep all current terrain fields unchanged
            payload.append("nom_projet", terrain!.nom_projet || "");
            payload.append("ville", terrain!.ville || "");
            payload.append("quartier", terrain!.quartier || "");
            payload.append("surface", String(Number(terrain!.surface)));
            payload.append("prix_achat", String(Number(terrain!.prix_achat)));
            payload.append("statut", terrain!.statut || "disponible");
            if (terrain!.description)
                payload.append("description", terrain!.description);
            payload.append("_method", "PUT");
            Array.from(docFiles).forEach((file) =>
                payload.append("files[]", file),
            );
            await axios.post(`/api/terrains/${id}`, payload);
            const response = await axios.get(`/api/terrains/${id}`);
            setTerrain(response.data);
            setShowDocModal(false);
            setDocFiles(null);
        } catch (error) {
            console.error("Failed to upload documents", error);
            alert(t("error_occured"));
        } finally {
            setIsUploadingDocs(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append("nom_projet", formData.nom_projet);
            payload.append("ville", formData.ville);
            payload.append("quartier", formData.quartier);
            payload.append("surface", String(Number(formData.surface)));
            payload.append("prix_achat", String(Number(formData.prix_achat)));
            payload.append("statut", formData.statut);
            if (formData.description) {
                payload.append("description", formData.description);
            }

            // For Laravel PUT with FormData
            payload.append("_method", "PUT");

            const form = e.currentTarget as HTMLFormElement;
            const filesInput = form.querySelector(
                'input[name="files"]',
            ) as HTMLInputElement | null;
            if (filesInput && filesInput.files) {
                Array.from(filesInput.files).forEach((file) => {
                    payload.append("files[]", file);
                });
            }

            await axios.post(`/api/terrains/${id}`, payload);

            // Re-fetch the terrain data
            const response = await axios.get(`/api/terrains/${id}`);
            setTerrain(response.data);

            setShowForm(false);
        } catch (error) {
            console.error("Failed to update terrain", error);
            alert(t("error_occured"));
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

    const handleDeleteDocument = async (
        e: React.MouseEvent,
        docUrl: string,
    ) => {
        e.stopPropagation();
        if (!confirm(t("confirm_delete_doc"))) return;

        try {
            await axios.delete(`/api/terrains/${id}/documents`, {
                data: { file_url: docUrl },
            });

            // Refresh
            const response = await axios.get(`/api/terrains/${id}`);
            setTerrain(response.data);
        } catch (error) {
            console.error("Failed to delete document", error);
            alert(t("error_deleting_doc"));
        }
    };

    const handleImmeubleSave = async (data: FormData) => {
        try {
            await axios.post("/api/immeubles", data);
            // Re-fetch the terrain data to get updated list of immeubles
            const response = await axios.get(`/api/terrains/${id}`);
            setTerrain(response.data);
            setShowAddImmeubleModal(false);
        } catch (error) {
            console.error("Failed to add immeuble", error);
            alert("Erreur lors de l'ajout de l'immeuble.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-500">{t("loading_data")}</p>
            </div>
        );
    }

    if (!terrain) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">{t("no_results")}</p>
                <button
                    onClick={() => navigate("/dashboard/inventory")}
                    className="mt-4 text-emerald-600 font-bold underline"
                >
                    {t("back_to_inventory")}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard/inventory")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-emerald-600 transition-colors font-semibold group"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    {t("back_to_inventory")}
                </button>
                <div className="flex gap-3">
                    <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted shadow-sm transition-colors">
                        <Share2 size={18} />
                    </button>
                    <button
                        onClick={() => {
                            setFormData({
                                id: terrain.id ? String(terrain.id) : "",
                                nom_projet: terrain.nom_projet || "",
                                ville: terrain.ville || "",
                                quartier: terrain.quartier || "",
                                surface: terrain.surface
                                    ? String(terrain.surface)
                                    : "",
                                prix_achat: terrain.prix_achat
                                    ? String(terrain.prix_achat)
                                    : "",
                                statut: terrain.statut || "disponible",
                                description: terrain.description || "",
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground font-bold hover:bg-muted shadow-sm transition-colors"
                    >
                        <Edit3 size={18} />
                        {t("edit")}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 shadow-sm transition-colors"
                    >
                        <Trash2 size={18} />
                        {t("delete")}
                    </button>
                </div>
            </div>

            {/* Main Info Card */}
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
                <div className="relative h-64 md:h-80 bg-slate-900">
                    <img
                        src={heroImage}
                        className="w-full h-full object-cover opacity-60"
                        alt={terrain.nom_projet}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMG;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute bottom-8 start-8 end-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Statut badge – clickable for admin */}
                            {user?.role?.slug === "admin" ? (
                                <div
                                    className="relative"
                                    ref={statutDropdownRef}
                                >
                                    {/* Badge / trigger */}
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

                                    {/* Custom dropdown panel */}
                                    {showStatutDropdown && (
                                        <div className="absolute start-0 top-full mt-2 w-44 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-fadeIn">
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
                                                            terrain.statut ===
                                                            key
                                                                ? "bg-muted text-foreground"
                                                                : "text-muted-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.bg}`}
                                                        />
                                                        {cfg.label}
                                                        {terrain.statut ===
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
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${currentStatutCfg.bg} ${currentStatutCfg.text}`}
                                >
                                    {currentStatutCfg.label}
                                </span>
                            )}
                            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={12} /> {terrain.ville} •{" "}
                                {terrain.quartier}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black">
                            {terrain.nom_projet}
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
                                {t("terrain_details")}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {terrain.description
                                    ? terrain.description
                                    : terrain.quartier
                                      ? `Situé à ${terrain.quartier}, ce terrain de ${terrain.nom_projet} est une opportunité exceptionnelle.`
                                      : `Le projet ${terrain.nom_projet} à ${terrain.ville} offre de nombreuses opportunités.`}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("surface")}
                                </p>
                                <p className="text-lg font-bold text-foreground flex items-baseline gap-1">
                                    {terrain.surface?.toLocaleString()}{" "}
                                    <span className="text-xs text-muted-foreground">
                                        m²
                                    </span>
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("purchase_price")}
                                </p>
                                <p className="text-lg font-bold text-foreground flex items-baseline gap-1">
                                    {(terrain.prix_achat
                                        ? terrain.prix_achat / 1000000
                                        : 0
                                    ).toFixed(1)}
                                    M{" "}
                                    <span className="text-xs text-muted-foreground">
                                        MAD
                                    </span>
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("immeubles")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {terrain.immeubles_count || 0}
                                </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                    {t("units")}
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {terrain.appartements_count || 0}
                                </p>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <section className="pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
                                <span>{t("docs_and_media")}</span>
                                <button
                                    onClick={() => {
                                        setDocFiles(null);
                                        setShowDocModal(true);
                                    }}
                                    className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    {t("add_document")}
                                </button>
                            </h3>

                            {docs && docs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {docs.map((doc: string, idx: number) => {
                                        const url = doc;
                                        const name =
                                            doc.split("/").pop() ||
                                            `Document ${idx + 1}`;
                                        const ext = doc
                                            .split(".")
                                            .pop()
                                            ?.toLowerCase();
                                        const isImage = [
                                            "jpg",
                                            "jpeg",
                                            "png",
                                            "gif",
                                            "webp",
                                            "svg",
                                        ].includes(ext ?? "");

                                        // Find index in imageDocs if it's an image
                                        const imageIndex = isImage
                                            ? imageDocs.indexOf(doc)
                                            : -1;

                                        return (
                                            <div
                                                key={idx}
                                                className="group relative bg-card border border-border rounded-2xl p-4 hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                                                onClick={() => {
                                                    if (
                                                        isImage &&
                                                        imageIndex !== -1
                                                    ) {
                                                        setSelectedImageIndex(
                                                            imageIndex,
                                                        );
                                                    } else if (!isImage) {
                                                        window.open(
                                                            url,
                                                            "_blank",
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Icon/Thumbnail */}
                                                    <div className="shrink-0">
                                                        {isImage ? (
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted/50">
                                                                <img
                                                                    src={url}
                                                                    alt={name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                                                <FileIcon
                                                                    size={28}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
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

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={url}
                                                            download
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors flex items-center justify-center"
                                                            title={t(
                                                                "download",
                                                            )}
                                                        >
                                                            <Download
                                                                size={16}
                                                            />
                                                        </a>
                                                        {user?.role?.slug ===
                                                            "admin" && (
                                                            <button
                                                                onClick={(e) =>
                                                                    handleDeleteDocument(
                                                                        e,
                                                                        url,
                                                                    )
                                                                }
                                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
                                                                title={t(
                                                                    "delete",
                                                                )}
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/50 border border-border rounded-2xl">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        {t("no_docs_yet")}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="pt-8 border-t border-border">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Building2
                                        size={20}
                                        className="text-emerald-500"
                                    />
                                    {t("immeubles_rattaches")}
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowAddImmeubleModal(true)
                                    }
                                    className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    {t("add_building")}
                                </button>
                            </div>

                            {terrain.immeubles &&
                            terrain.immeubles.length > 0 ? (
                                <div className="space-y-3">
                                    {terrain.immeubles.map((immeuble) => (
                                        <div
                                            key={immeuble.id}
                                            onClick={() =>
                                                navigate(
                                                    `/immeubles/${immeuble.id}`,
                                                )
                                            }
                                            className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-colors">
                                                    <Building size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                                                        {immeuble.nom}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {immeuble.nombre_etages}{" "}
                                                        {t("floors")} •{" "}
                                                        {t(
                                                            `status_${immeuble.statut}`,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-muted/50 rounded-lg text-muted-foreground group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/50 border border-border rounded-2xl border-dashed">
                                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {t("no_buildings")}
                                    </p>
                                    <button
                                        onClick={() =>
                                            setShowAddImmeubleModal(true)
                                        }
                                        className="mt-3 text-sm text-emerald-600 font-bold hover:underline"
                                    >
                                        Créer le premier immeuble
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="p-6 bg-muted/50 rounded-2xl border border-border space-y-6">
                            <h4 className="font-bold text-foreground">
                                Traçabilité
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground shadow-sm">
                                    {terrain.created_by_name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("") || "?"}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Créé par
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {terrain.creator?.full_name ||
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
                                        Date de création
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {new Date(
                                            terrain.created_at,
                                        ).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-900 rounded-2xl text-white space-y-4 shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText
                                    size={20}
                                    className="text-emerald-400"
                                />
                                <h4 className="font-bold">Actions rapides</h4>
                            </div>
                            <button className="w-full py-3 bg-emerald-800 dark:bg-emerald-900/50 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                Générer Fiche PDF
                            </button>
                            <button className="w-full py-3 bg-card text-emerald-900 dark:text-emerald-400 hover:bg-muted rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                Consulter Plan Cadastral
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightBoxOpen && (
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
                        {currentImageUrl && (
                            <img
                                src={currentImageUrl}
                                alt="Terrain document"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                referrerPolicy="no-referrer"
                            />
                        )}

                        <div className="absolute -bottom-12 start-0 end-0 text-center text-white/70 text-sm font-medium tracking-wide">
                            {selectedImageIndex! + 1} / {imageDocs.length}
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn border border-border">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Layout className="text-emerald-500" />
                                Modifier le terrain
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleSave}
                            className="p-8 space-y-5 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                        {t("project_name")}
                                    </label>
                                    <div className="relative">
                                        <Layout
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="text"
                                            className="w-full ps-10 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                            value={formData.nom_projet}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nom_projet: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                        {t("city")}
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="text"
                                            className="w-full ps-10 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                            value={formData.ville}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ville: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                        {t("neighborhood")}
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <input
                                            type="text"
                                            className="w-full ps-10 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                            value={formData.quartier}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    quartier: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                        {t("surface")}
                                    </label>
                                    <div className="relative">
                                        <Square
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="number"
                                            className="w-full ps-10 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                            value={formData.surface}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    surface: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                        {t("purchase_price")}
                                    </label>
                                    <div className="relative">
                                        <Coins
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="number"
                                            className="w-full ps-10 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                            value={formData.prix_achat}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    prix_achat: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1">
                                    {t("description")}
                                </label>
                                <textarea
                                    className="w-full ps-4 pe-4 py-3 bg-muted/30 border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-foreground placeholder:text-muted-foreground"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3.5 border border-border rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                                >
                                    {t("save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Upload Modal */}
            {showDocModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
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
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
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
                                            file:bg-emerald-50 file:text-emerald-600
                                            dark:file:bg-emerald-900/20 dark:file:text-emerald-400
                                            hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/40 cursor-pointer"
                                    />
                                </div>
                                {docFiles && docFiles.length > 0 && (
                                    <p className="mt-2 text-xs text-emerald-600 font-semibold">
                                        {docFiles.length} fichier
                                        {docFiles.length > 1 ? "s" : ""}{" "}
                                        sélectionné
                                        {docFiles.length > 1 ? "s" : ""}
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
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

            <CreateImmeubleModal
                isOpen={showAddImmeubleModal}
                onClose={() => setShowAddImmeubleModal(false)}
                onSave={handleImmeubleSave}
                defaultTerrainId={id}
            />
        </div>
    );
};

export default ItemDetails;
