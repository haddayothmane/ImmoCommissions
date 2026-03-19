import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Filter,
    MapPin,
    Square,
    ChevronRight,
    ChevronLeft,
    X,
    Coins,
    Layout,
    Trash2,
    Grid,
    List,
    Layers,
} from "lucide-react";
import axios from "axios";
import { Terrain, Immeuble, Appartement } from "../types";
import { useAuth } from "../hooks/useAuth";

const Inventory: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, employee } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<
        "terrains" | "immeubles" | "appartements"
    >("terrains");
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [terrains, setTerrains] = useState<Terrain[]>([]);
    const [terrainPagination, setTerrainPagination] = useState<{
        current_page: number;
        last_page: number;
        total: number;
    }>({ current_page: 1, last_page: 1, total: 0 });
    const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
    const [appartements, setAppartements] = useState<Appartement[]>([]);

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatut, setFilterStatut] = useState("");
    const [filterVille, setFilterVille] = useState("");

    // Derived filtered list
    // Note: Terrains are now filtered server-side.
    // filteredTerrains is kept for consistency with other tabs if needed,
    // but the terrains array itself is already filtered by the API.
    const filteredTerrains = terrains;

    const filteredImmeubles = immeubles.filter((i) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            i.nom.toLowerCase().includes(q) ||
            (i.terrain?.nom_projet || "").toLowerCase().includes(q);
        const matchesStatut = !filterStatut || i.statut === filterStatut;
        return matchesSearch && matchesStatut;
    });

    const filteredAppartements = appartements.filter((a) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            a.numero.toLowerCase().includes(q) ||
            (a.immeuble?.nom || "").toLowerCase().includes(q);
        const matchesStatut = !filterStatut || a.statut === filterStatut;
        return matchesSearch && matchesStatut;
    });

    const terrainStatutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        disponible: {
            label: t("status_disponible"),
            bg: "bg-emerald-500/10",
            text: "text-emerald-600",
            dot: "bg-emerald-500",
        },
        vendu: {
            label: t("status_vendu"),
            bg: "bg-slate-500/10",
            text: "text-slate-600",
            dot: "bg-slate-500",
        },
        en_cours: {
            label: t("status_en_construction"),
            bg: "bg-amber-500/10",
            text: "text-amber-600",
            dot: "bg-amber-500",
        },
        reserve: {
            label: t("status_reserve"),
            bg: "bg-blue-500/10",
            text: "text-blue-600",
            dot: "bg-blue-500",
        },
    };

    const immeubleStatutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        sur_plan: {
            label: t("status_sur_plan"),
            bg: "bg-blue-500/10",
            text: "text-blue-600",
            dot: "bg-blue-500",
        },
        en_construction: {
            label: t("status_en_construction"),
            bg: "bg-amber-500/10",
            text: "text-amber-600",
            dot: "bg-amber-500",
        },
        livre: {
            label: t("status_livre"),
            bg: "bg-emerald-500/10",
            text: "text-emerald-600",
            dot: "bg-emerald-500",
        },
    };

    const appartementStatutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        disponible: {
            label: t("status_disponible"),
            bg: "bg-emerald-500/10",
            text: "text-emerald-600",
            dot: "bg-emerald-500",
        },
        vendu: {
            label: t("status_vendu"),
            bg: "bg-red-500/10",
            text: "text-red-600",
            dot: "bg-red-500",
        },
        reserve: {
            label: t("status_reserve"),
            bg: "bg-blue-500/10",
            text: "text-blue-600",
            dot: "bg-blue-500",
        },
    };

    // Unique villes for the filter dropdown
    const uniqueVilles = Array.from(
        new Set(terrains.map((t) => t.ville).filter(Boolean)),
    );

    const FALLBACK_IMG =
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800";

    /** Returns the first uploaded image URL for a terrain, or the fallback. */
    const getCardImage = (terrain: Terrain): string => {
        let docs: string[] = [];
        if (Array.isArray(terrain.documents)) {
            docs = terrain.documents as string[];
        } else if (typeof terrain.documents === "string" && terrain.documents) {
            try {
                docs = JSON.parse(terrain.documents);
            } catch {
                /* ignore */
            }
        }
        const img = docs.find((d) => /\.(jpe?g|png|gif|webp|svg)$/i.test(d));
        if (!img) return FALLBACK_IMG;
        // index() returns raw paths; prepend /storage/ if not already a URL
        return img.startsWith("http") || img.startsWith("/storage")
            ? img
            : `/storage/${img}`;
    };

    const fetchTerrains = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/terrains", {
                params: {
                    page,
                    search: searchQuery,
                    statut: filterStatut,
                    ville: filterVille,
                },
            });
            // Laravel's paginate returns { data: [], current_page: 1, ... }
            if (response.data.data) {
                setTerrains(response.data.data);
                setTerrainPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                });
            } else {
                setTerrains(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch terrains", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchImmeubles = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/immeubles");
            setImmeubles(response.data);
        } catch (error) {
            console.error("Failed to fetch immeubles", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAppartements = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/appartements");
            setAppartements(response.data);
        } catch (error) {
            console.error("Failed to fetch appartements", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === "terrains") fetchTerrains(1);
        if (activeTab === "immeubles") fetchImmeubles();
        if (activeTab === "appartements") fetchAppartements();
    }, [activeTab, searchQuery, filterStatut, filterVille]);

    const [formData, setFormData] = useState({
        id: "",
        nom_projet: "",
        ville: "",
        quartier: "",
        surface: "",
        prix_achat: "",
        statut: "disponible" as any,
        description: "",
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Build a FormData payload so we can send description + files
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
            // Attach any selected files (input name="files")
            const form = e.currentTarget as HTMLFormElement;
            const filesInput = form.querySelector(
                'input[name="files"]',
            ) as HTMLInputElement | null;
            if (filesInput && filesInput.files) {
                Array.from(filesInput.files).forEach((file) => {
                    payload.append("files[]", file);
                });
            }

            if (formData.id) {
                await axios.put(`/api/terrains/${formData.id}`, payload);
            } else {
                await axios.post("/api/terrains", payload);
            }

            await fetchTerrains(terrainPagination.current_page);
            setShowForm(false);
            // Reset the form, including description
            setFormData({
                id: "",
                nom_projet: "",
                ville: "",
                quartier: "",
                surface: "",
                prix_achat: "",
                statut: "disponible",
                description: "",
            });
        } catch (error) {
            console.error("Failed to save terrain", error);
            alert(t("error_saving_terrain"));
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (user?.role?.slug !== "admin") {
            alert(t("admin_only_delete_terrain"));
            return;
        }

        if (!confirm(t("confirm_delete_terrain"))) {
            return;
        }

        try {
            await axios.delete(`/api/terrains/${id}`);
            await fetchTerrains(terrainPagination.current_page);
        } catch (error) {
            console.error("Failed to delete terrain", error);
            alert(t("error_occured"));
        }
    };

    const inputClasses =
        "w-full ps-10 pe-4 py-3 bg-card border border-border rounded-xl text-sm transition-all duration-200 focus:bg-card focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none placeholder:text-muted-foreground";
    const labelClasses =
        "text-xs font-bold text-muted-foreground uppercase mb-1.5 block tracking-wide ms-1";

    return (
        <div className="space-y-6 animate-fadeIn relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("inventory")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("inventory_desc")}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    {t("add_terrain")}
                </button>
            </div>

            {/* Tabs */}
            <div className="hidden border-b border-border">
                {(["terrains"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-4 text-sm font-bold transition-all relative ${
                            activeTab === tab
                                ? "text-emerald-600"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t(tab).toUpperCase()}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 start-0 end-0 h-1 bg-emerald-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 relative min-w-[180px]">
                        <Search
                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder={t("search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={inputClasses}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                            showFilters || filterStatut || filterVille
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-muted text-muted-foreground hover:bg-accent border-border"
                        }`}
                    >
                        <Filter size={18} />
                        {t("filters")}
                        {(filterStatut || filterVille) && (
                            <span className="ms-1 w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                {
                                    [filterStatut, filterVille].filter(Boolean)
                                        .length
                                }
                            </span>
                        )}
                    </button>
                    {(filterStatut || filterVille) && (
                        <button
                            onClick={() => {
                                setFilterStatut("");
                                setFilterVille("");
                            }}
                            className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                        >
                            {t("reset")}
                        </button>
                    )}

                    <div className="flex items-center bg-card p-1 rounded-xl ms-auto border border-border">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === "grid"
                                    ? "bg-muted text-emerald-600 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === "list"
                                    ? "bg-muted text-emerald-600 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Expandable filter panel */}
                {showFilters && (
                    <div className="px-4 pb-4 pt-0 border-t border-border flex flex-wrap gap-4">
                        <div className="flex flex-col gap-1 min-w-[180px]">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-3">
                                {t("status")}
                            </label>
                            <select
                                value={filterStatut}
                                onChange={(e) =>
                                    setFilterStatut(e.target.value)
                                }
                                className="ps-3 pe-8 py-2.5 bg-card text-foreground border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">{t("all_statuses")}</option>
                                <optgroup label={t("terrains")}>
                                    <option value="disponible">
                                        {t("status_disponible")}
                                    </option>
                                    <option value="vendu">
                                        {t("status_vendu")}
                                    </option>
                                    <option value="en_cours">
                                        {t("status_en_construction")}
                                    </option>
                                    <option value="reserve">
                                        {t("status_reserve")}
                                    </option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 min-w-[180px]">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">
                                {t("city")}
                            </label>
                            <select
                                value={filterVille}
                                onChange={(e) => setFilterVille(e.target.value)}
                                className="ps-3 pe-8 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">{t("all_cities")}</option>
                                {uniqueVilles.map((v) => (
                                    <option key={v} value={v}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border shadow-sm animate-pulse">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">
                        {t("loading_data")}
                    </p>
                </div>
            ) : (
                <>
                    {(activeTab === "terrains"
                        ? filteredTerrains
                        : activeTab === "immeubles"
                          ? filteredImmeubles
                          : filteredAppartements
                    ).length === 0 && (
                        <div className="text-center py-16 bg-card rounded-3xl border border-border shadow-sm">
                            <Search
                                className="mx-auto mb-3 text-muted-foreground"
                                size={40}
                            />
                            <p className="text-lg font-bold text-foreground">
                                {t("no_results")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t("try_changing_search")}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterStatut("");
                                    setFilterVille("");
                                }}
                                className="mt-4 text-sm font-bold text-emerald-600 hover:underline"
                            >
                                {t("reset_filters")}
                            </button>
                        </div>
                    )}

                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeTab === "terrains" &&
                                filteredTerrains.map((terrain) => (
                                    <div
                                        key={terrain.id}
                                        onClick={() =>
                                            navigate(
                                                `/dashboard/inventory/${terrain.id}`,
                                            )
                                        }
                                        className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden cursor-pointer relative"
                                    >
                                        <div className="h-44 bg-muted relative overflow-hidden">
                                            <img
                                                src={getCardImage(
                                                    terrain as any,
                                                )}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={terrain.nom_projet}
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = FALLBACK_IMG;
                                                }}
                                            />
                                            <div className="absolute top-4 start-4 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-foreground flex items-center gap-2 shadow-lg">
                                                <MapPin
                                                    size={12}
                                                    className="text-emerald-500"
                                                />
                                                {terrain.ville.toUpperCase()}
                                            </div>
                                            <div
                                                className={`absolute top-4 end-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-lg backdrop-blur-md ${
                                                    terrainStatutConfig[
                                                        terrain.statut
                                                    ]?.bg || "bg-emerald-500/10"
                                                } ${
                                                    terrainStatutConfig[
                                                        terrain.statut
                                                    ]?.text ||
                                                    "text-emerald-600"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        terrainStatutConfig[
                                                            terrain.statut
                                                        ]?.dot ||
                                                        "bg-emerald-500"
                                                    }`}
                                                />
                                                {terrainStatutConfig[
                                                    terrain.statut
                                                ]?.label.toUpperCase() ||
                                                    terrain.statut.toUpperCase()}
                                            </div>

                                            {user?.role?.slug === "admin" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleDelete(
                                                            e,
                                                            terrain.id,
                                                        );
                                                    }}
                                                    className="absolute bottom-4 end-4 p-2 bg-background/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-10"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                                                {terrain.nom_projet}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5 font-medium">
                                                <Square
                                                    size={14}
                                                    className="text-muted-foreground"
                                                />{" "}
                                                {terrain.surface.toLocaleString()}{" "}
                                                m² • {terrain.quartier}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                                                        {t("purchase_price")}
                                                    </p>
                                                    <p className="text-xl font-black text-emerald-600">
                                                        {(
                                                            terrain.prix_achat /
                                                            1000000
                                                        ).toFixed(1)}
                                                        M{" "}
                                                        <span className="text-xs font-bold text-muted-foreground">
                                                            {t("currency")}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-muted text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>

                                            {/* Traçabilité */}
                                            {terrain.created_by_name && (
                                                <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                                                        {terrain.created_by_name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </div>
                                                    <div className="text-[10px] leading-tight text-muted-foreground">
                                                        <p>
                                                            {t("created_by")}{" "}
                                                            <span className="font-bold text-foreground">
                                                                {
                                                                    terrain.created_by_name
                                                                }
                                                            </span>
                                                        </p>
                                                        <p>
                                                            {t("at")}{" "}
                                                            {new Date(
                                                                terrain.created_at,
                                                            ).toLocaleDateString(
                                                                i18n.language ===
                                                                    "ar"
                                                                    ? "ar-MA"
                                                                    : "fr-FR",
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            {activeTab === "immeubles" &&
                                filteredImmeubles.map((immeuble) => (
                                    <div
                                        key={immeuble.id}
                                        onClick={() =>
                                            navigate(
                                                `/immeubles/${immeuble.id}`,
                                            )
                                        }
                                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden cursor-pointer relative"
                                    >
                                        <div className="h-44 bg-muted relative overflow-hidden">
                                            <img
                                                src={getCardImage(
                                                    immeuble as any,
                                                )}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={immeuble.nom}
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = FALLBACK_IMG;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            <div
                                                className={`absolute top-4 start-4 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 ${immeubleStatutConfig[immeuble.statut]?.bg || "bg-blue-500/10"} ${immeubleStatutConfig[immeuble.statut]?.text || "text-blue-600"}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${immeubleStatutConfig[immeuble.statut]?.dot || "bg-blue-500"}`}
                                                />
                                                {immeubleStatutConfig[
                                                    immeuble.statut
                                                ]?.label.toUpperCase() ||
                                                    immeuble.statut.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                                                {immeuble.nom}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5 font-medium">
                                                <Layers
                                                    size={14}
                                                    className="text-muted-foreground"
                                                />{" "}
                                                {immeuble.nombre_etages}{" "}
                                                {t("etages")}•{" "}
                                                {immeuble.terrain?.nom_projet ||
                                                    t("independent")}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                                                        {t("details")}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground">
                                                        {immeuble.description?.substring(
                                                            0,
                                                            50,
                                                        )}
                                                        ...
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-muted text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {activeTab === "appartements" &&
                                filteredAppartements.map((apt) => (
                                    <div
                                        key={apt.id}
                                        onClick={() =>
                                            navigate(
                                                `/dashboard/inventory/${apt.id}`,
                                            )
                                        }
                                        className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden cursor-pointer relative"
                                    >
                                        <div className="h-44 bg-muted relative overflow-hidden flex items-center justify-center">
                                            <Layers
                                                size={64}
                                                className="text-muted/50"
                                            />
                                            <div className="absolute top-4 start-4 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-foreground flex items-center gap-2 shadow-lg">
                                                {t("floor").toUpperCase()}{" "}
                                                {apt.etage}
                                            </div>
                                            <div
                                                className={`absolute top-4 end-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-lg backdrop-blur-md ${appartementStatutConfig[apt.statut]?.bg || "bg-emerald-500/10"} ${appartementStatutConfig[apt.statut]?.text || "text-emerald-600"}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${appartementStatutConfig[apt.statut]?.dot || "bg-emerald-500"}`}
                                                />
                                                {appartementStatutConfig[
                                                    apt.statut
                                                ]?.label.toUpperCase() ||
                                                    apt.statut.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                                                {t("appartement")} {apt.numero}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5 font-medium">
                                                <Square
                                                    size={14}
                                                    className="text-muted-foreground"
                                                />{" "}
                                                {apt.surface} m² •{" "}
                                                {apt.chambres} {t("rooms")}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                                                        {t("total_price")}
                                                    </p>
                                                    <p className="text-xl font-black text-foreground font-mono">
                                                        {Number(
                                                            apt.prix_total,
                                                        ).toLocaleString()}
                                                        <span className="text-xs ms-1">
                                                            {t("currency")}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-muted text-muted-foreground rounded-xl group-hover:bg-foreground group-hover:text-background transition-all shadow-sm">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {/* Add Card Placeholder */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowForm(true);
                                }}
                                className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all group min-h-[350px]"
                            >
                                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:scale-110 transition-all shadow-sm border border-border">
                                    <Plus size={28} />
                                </div>
                                <span className="font-bold text-sm">
                                    {t("add")}{" "}
                                    {activeTab === "terrains"
                                        ? t("terrain_small")
                                        : activeTab === "immeubles"
                                          ? t("immeuble_small")
                                          : t("appartement_small")}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden text-sm">
                            <table className="w-full text-start border-collapse">
                                <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                                    {activeTab === "terrains" ? (
                                        <tr>
                                            <th className="px-8 py-5">
                                                {t("project")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("location")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("surface")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("price")}
                                            </th>
                                            <th className="px-8 py-5 text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                    ) : activeTab === "immeubles" ? (
                                        <tr>
                                            <th className="px-8 py-5">
                                                {t("building")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("terrain")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("floors")}
                                            </th>
                                            <th className="px-8 py-5 text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-8 py-5">
                                                {t("number")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("surface")}
                                            </th>
                                            <th className="px-8 py-5">
                                                {t("price")}
                                            </th>
                                            <th className="px-8 py-5 text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activeTab === "terrains" &&
                                        filteredTerrains.map((terrain) => (
                                            <tr
                                                key={terrain.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/inventory/${terrain.id}`,
                                                    )
                                                }
                                                className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-8 py-5 font-bold text-foreground">
                                                    {terrain.nom_projet}
                                                </td>
                                                <td className="px-8 py-5 text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin
                                                            size={14}
                                                            className="text-emerald-500"
                                                        />
                                                        {terrain.ville} •{" "}
                                                        {terrain.quartier}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 font-medium text-muted-foreground">
                                                    {terrain.surface} m²
                                                </td>
                                                <td className="px-8 py-5 font-bold text-emerald-600">
                                                    {(
                                                        terrain.prix_achat /
                                                        1000000
                                                    ).toFixed(1)}
                                                    M {t("currency")}
                                                </td>
                                                <td className="px-8 py-5 text-end">
                                                    <ChevronRight
                                                        size={18}
                                                        className="ms-auto text-muted-foreground group-hover:text-emerald-600"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    {activeTab === "immeubles" &&
                                        filteredImmeubles.map((i) => (
                                            <tr
                                                key={i.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/immeubles/${i.id}`,
                                                    )
                                                }
                                                className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-8 py-5 font-bold text-foreground">
                                                    {i.nom}
                                                </td>
                                                <td className="px-8 py-5 text-muted-foreground">
                                                    {i.terrain?.nom_projet ||
                                                        t("independent")}
                                                </td>
                                                <td className="px-8 py-5 font-medium text-muted-foreground">
                                                    {i.nombre_etages}{" "}
                                                    {t("floors").toLowerCase()}
                                                </td>
                                                <td className="px-8 py-5 text-end">
                                                    <ChevronRight
                                                        size={18}
                                                        className="ms-auto text-muted-foreground group-hover:text-emerald-600"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    {activeTab === "appartements" &&
                                        filteredAppartements.map((a) => (
                                            <tr
                                                key={a.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/inventory/${a.id}`,
                                                    )
                                                }
                                                className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-8 py-5 font-bold text-foreground">
                                                    {t("number")} {a.numero}
                                                </td>
                                                <td className="px-8 py-5 font-medium text-muted-foreground">
                                                    {a.surface} m²
                                                </td>
                                                <td className="px-8 py-5 font-bold text-foreground font-mono">
                                                    {Number(
                                                        a.prix_total,
                                                    ).toLocaleString()}{" "}
                                                    MAD
                                                </td>
                                                <td className="px-8 py-5 text-end">
                                                    <ChevronRight
                                                        size={18}
                                                        className="ms-auto text-muted-foreground group-hover:text-foreground"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                    <tr
                                        onClick={() => setShowForm(true)}
                                        className="hover:bg-emerald-50/30 transition-colors group cursor-pointer border-t-2 border-dashed border-slate-50"
                                    >
                                        <td
                                            colSpan={6}
                                            className="px-8 py-4 text-center text-slate-400 font-bold group-hover:text-emerald-600"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Plus size={16} />
                                                {t("add")}{" "}
                                                {activeTab === "terrains"
                                                    ? t("terrain_small")
                                                    : activeTab === "immeubles"
                                                      ? t("immeuble_small")
                                                      : t("appartement_small")}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Pagination for Terrains */}
                    {activeTab === "terrains" &&
                        terrainPagination.last_page > 1 && (
                            <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
                                <p className="text-sm font-medium text-slate-500">
                                    {t("showing")}{" "}
                                    <span className="text-slate-900 font-bold">
                                        {terrains.length}
                                    </span>{" "}
                                    {t("showing_out_of")}{" "}
                                    <span className="text-slate-900 font-bold">
                                        {terrainPagination.total}
                                    </span>{" "}
                                    {t("terrains").toLowerCase()}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            fetchTerrains(
                                                terrainPagination.current_page -
                                                    1,
                                            )
                                        }
                                        disabled={
                                            terrainPagination.current_page === 1
                                        }
                                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {Array.from(
                                        { length: terrainPagination.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter((p) => {
                                            const curr =
                                                terrainPagination.current_page;
                                            return (
                                                p === 1 ||
                                                p ===
                                                    terrainPagination.last_page ||
                                                Math.abs(p - curr) <= 1
                                            );
                                        })
                                        .map((p, i, arr) => (
                                            <React.Fragment key={p}>
                                                {i > 0 &&
                                                    arr[i - 1] !== p - 1 && (
                                                        <span className="px-2 text-slate-300">
                                                            ...
                                                        </span>
                                                    )}
                                                <button
                                                    onClick={() =>
                                                        fetchTerrains(p)
                                                    }
                                                    className={`min-w-[40px] h-10 rounded-xl font-black text-sm transition-all ${
                                                        terrainPagination.current_page ===
                                                        p
                                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                                            : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        ))}

                                    <button
                                        onClick={() =>
                                            fetchTerrains(
                                                terrainPagination.current_page +
                                                    1,
                                            )
                                        }
                                        disabled={
                                            terrainPagination.current_page ===
                                            terrainPagination.last_page
                                        }
                                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                </>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scaleIn">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Layout className="text-emerald-500" />
                                {t("add_terrain")}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className={labelClasses}>
                                        {t("project_name")}
                                    </label>
                                    <div className="relative">
                                        <Layout
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses}
                                            value={formData.nom_projet}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nom_projet: e.target.value,
                                                })
                                            }
                                            placeholder={t(
                                                "placeholder_project",
                                            )}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        {t("city")}
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses}
                                            value={formData.ville}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ville: e.target.value,
                                                })
                                            }
                                            placeholder={t("placeholder_city")}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        {t("neighborhood")}
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            type="text"
                                            className={inputClasses}
                                            value={formData.quartier}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    quartier: e.target.value,
                                                })
                                            }
                                            placeholder={t(
                                                "placeholder_neighborhood",
                                            )}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        {t("surface")}
                                    </label>
                                    <div className="relative">
                                        <Square
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="number"
                                            className={inputClasses}
                                            value={formData.surface}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    surface: e.target.value,
                                                })
                                            }
                                            placeholder="m²"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        {t("purchase_price")}
                                    </label>
                                    <div className="relative">
                                        <Coins
                                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <input
                                            required
                                            type="number"
                                            className={inputClasses}
                                            value={formData.prix_achat}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    prix_achat: e.target.value,
                                                })
                                            }
                                            placeholder="MAD"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Description field */}
                            <div className="col-span-2">
                                <label className={labelClasses}>
                                    {t("description")}
                                </label>
                                <textarea
                                    className={inputClasses}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder={t("placeholder_description")}
                                    rows={3}
                                />
                            </div>
                            {/* File upload field */}
                            <div className="col-span-2">
                                <label className={labelClasses}>
                                    {t("upload_files")}
                                </label>
                                <input
                                    type="file"
                                    name="files"
                                    multiple
                                    className="block w-full text-sm text-slate-500
                                           file:me-4 file:py-2 file:px-4
                                           file:rounded-full file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-emerald-50 file:text-emerald-600
                                           hover:file:bg-emerald-100"
                                />
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
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
        </div>
    );
};

export default Inventory;
