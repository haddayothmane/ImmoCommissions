import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Building2,
    Layers,
    MapPin,
    Calendar,
    Edit3,
    Trash2,
    ChevronRight,
    ChevronDown,
    X,
    Filter,
    Layout,
    Grid,
    List,
    ChevronLeft,
} from "lucide-react";
import { immeubleService } from "../api/immeubleService";
import { Immeuble } from "../types";
import { useAuth } from "../hooks/useAuth";
import CreateImmeubleModal from "../components/immeubles/CreateImmeubleModal";
import EditImmeubleModal from "../components/immeubles/EditImmeubleModal";

const Immeubles: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [cityFilter, setCityFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const FALLBACK_IMG =
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800";

    const getCardImage = (immeuble: Immeuble): string => {
        let docs: string[] = [];
        if (Array.isArray(immeuble.documents)) {
            docs = immeuble.documents as string[];
        } else if (
            typeof immeuble.documents === "string" &&
            immeuble.documents
        ) {
            try {
                docs = JSON.parse(immeuble.documents);
            } catch {
                /* ignore */
            }
        }
        const img = docs.find((d) => /\.(jpe?g|png|gif|webp|svg)$/i.test(d));
        if (!img) return FALLBACK_IMG;
        return img.startsWith("http") || img.startsWith("/storage")
            ? img
            : `/storage/${img}`;
    };

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedImmeuble, setSelectedImmeuble] = useState<Immeuble | null>(
        null,
    );

    const fetchImmeubles = async (page = 1) => {
        try {
            setIsLoading(true);
            const data = await immeubleService.getImmeubles({
                page,
                search: searchQuery,
                statut: statusFilter === "all" ? "" : statusFilter,
                ville: cityFilter === "all" ? "" : cityFilter,
            });
            if (data.data) {
                setImmeubles(data.data);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                });
            } else {
                setImmeubles(data);
            }
        } catch (error) {
            console.error("Failed to fetch immeubles", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImmeubles(1);
    }, [searchQuery, statusFilter, cityFilter]);

    const handleCreate = async (data: FormData) => {
        try {
            await immeubleService.createImmeuble(data);
            fetchImmeubles(pagination.current_page);
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating immeuble", error);
            alert(t("error_occured"));
        }
    };

    const handleUpdate = async (id: string, data: FormData) => {
        try {
            await immeubleService.updateImmeuble(id, data);
            fetchImmeubles(pagination.current_page);
            setShowEditModal(false);
            setSelectedImmeuble(null);
        } catch (error) {
            console.error("Error updating immeuble", error);
            alert(t("error_occured"));
        }
    };

    const handleDelete = async (id: string) => {
        if (user?.role?.slug !== "admin") {
            alert(t("admin_only_delete_building"));
            return;
        }
        if (window.confirm(t("confirm_delete_building"))) {
            try {
                await immeubleService.deleteImmeuble(id);
                fetchImmeubles(pagination.current_page);
            } catch (error) {
                console.error("Error deleting immeuble", error);
            }
        }
    };

    const uniqueVilles = Array.from(
        new Set(immeubles.map((i) => i.terrain?.ville).filter(Boolean)),
    ).sort();

    // Note: Since we use server-side pagination/filtering,
    // filteredImmeubles is now just the immeubles array returned by the API.
    const filteredImmeubles = immeubles;

    const statutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        sur_plan: {
            label: t("status_sur_plan"),
            bg: "bg-indigo-600",
            text: "text-white",
            dot: "bg-indigo-300",
        },
        en_construction: {
            label: t("status_en_construction"),
            bg: "bg-amber-600",
            text: "text-white",
            dot: "bg-amber-300",
        },
        livre: {
            label: t("status_livre"),
            bg: "bg-emerald-600",
            text: "text-white",
            dot: "bg-emerald-300",
        },
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("immeubles")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("immeubles_desc")}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    {t("add_building")}
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={t("search_building")}
                        className="w-full ps-12 pe-4 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 outline-none shadow-sm transition-all placeholder:text-muted-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <Filter
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <select
                        className="ps-12 pe-10 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 outline-none shadow-sm transition-all appearance-none cursor-pointer font-bold min-w-[160px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">{t("all_statuses")}</option>
                        {Object.entries(statutConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>
                                {cfg.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                    />
                </div>

                <div className="relative">
                    <MapPin
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <select
                        className="ps-12 pe-10 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 outline-none shadow-sm transition-all appearance-none cursor-pointer font-bold min-w-[160px]"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        <option value="all">{t("all_cities")}</option>
                        {uniqueVilles.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                    />
                </div>

                <div className="flex items-center bg-card p-1 rounded-2xl border border-border shadow-sm">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 rounded-xl transition-all ${
                            viewMode === "grid"
                                ? "bg-muted text-emerald-600 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 rounded-xl transition-all ${
                            viewMode === "list"
                                ? "bg-muted text-emerald-600 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border shadow-sm animate-pulse">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium tracking-wide">
                        {t("loading_buildings")}
                    </p>
                </div>
            ) : filteredImmeubles.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
                    <Search
                        className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
                        size={48}
                    />
                    <p className="text-lg font-bold text-muted-foreground">
                        {t("no_buildings_found")}
                    </p>
                    <p className="text-slate-400 mt-2">
                        {t("try_refining_search")}
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredImmeubles.map((immeuble) => (
                        <div
                            key={immeuble.id}
                            onClick={() =>
                                navigate(`/dashboard/immeubles/${immeuble.id}`)
                            }
                            className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden cursor-pointer relative"
                        >
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                <img
                                    src={getCardImage(immeuble)}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={immeuble.nom}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            FALLBACK_IMG;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute top-4 start-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-slate-700 flex items-center gap-2 shadow-lg">
                                    <MapPin
                                        size={12}
                                        className="text-emerald-500"
                                    />
                                    {immeuble.terrain?.ville ||
                                        t("unspecified")}
                                </div>
                                <div
                                    className={`absolute top-4 end-4 px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 ${statutConfig[immeuble.statut]?.bg || "bg-slate-700"} ${statutConfig[immeuble.statut]?.text || "text-white"} backdrop-blur-md`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${statutConfig[immeuble.statut]?.dot || "bg-white"}`}
                                    />
                                    {statutConfig[
                                        immeuble.statut
                                    ]?.label.toUpperCase() ||
                                        immeuble.statut.toUpperCase()}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors truncate max-w-[200px]">
                                            {immeuble.nom}
                                        </h3>
                                        <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                            {immeuble.terrain?.nom_projet ||
                                                t("independent_building")}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-100 dark:border-emerald-800">
                                        {immeuble.nombre_etages} {t("etages")}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {immeuble.created_by_name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "?"}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            <p className="font-bold text-foreground">
                                                {immeuble.created_by_name ||
                                                    t("agent")}
                                            </p>
                                            <p>
                                                {new Date(
                                                    immeuble.created_at,
                                                ).toLocaleDateString(
                                                    i18n.language === "ar"
                                                        ? "ar-MA"
                                                        : "fr-FR",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-muted text-muted-foreground rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateModal(true);
                        }}
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all group min-h-[250px]"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:scale-110 transition-all shadow-sm border border-slate-100">
                            <Plus size={28} />
                        </div>
                        <span className="font-bold text-sm">
                            {t("add_building")}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-start border-collapse">
                        <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                            <tr>
                                <th className="px-8 py-5">{t("building")}</th>
                                <th className="px-8 py-5">{t("inventory")}</th>
                                <th className="px-8 py-5">{t("etages")}</th>
                                <th className="px-8 py-5">{t("status")}</th>
                                <th className="px-8 py-5">{t("delivery")}</th>
                                <th className="px-8 py-5 text-end">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {filteredImmeubles.map((immeuble) => (
                                <tr
                                    key={immeuble.id}
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/immeubles/${immeuble.id}`,
                                        )
                                    }
                                    className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-black border border-border group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    {immeuble.nom}
                                                </p>
                                                <p className="text-[10px] font-black text-muted-foreground mt-0.5 tracking-wider uppercase">
                                                    REF:{" "}
                                                    {immeuble.id.substring(
                                                        0,
                                                        8,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {immeuble.terrain ? (
                                            <div className="flex items-center gap-2">
                                                <Layout
                                                    className="text-emerald-500"
                                                    size={14}
                                                />
                                                <span className="font-semibold text-foreground">
                                                    {
                                                        immeuble.terrain
                                                            .nom_projet
                                                    }
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                {t("none")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-muted-foreground">
                                        {immeuble.nombre_etages}{" "}
                                        {t("etages").toLowerCase()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 w-fit ${statutConfig[immeuble.statut]?.bg || "bg-slate-700"} ${statutConfig[immeuble.statut]?.text || "text-white"}`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${statutConfig[immeuble.statut]?.dot || "bg-white/50"}`}
                                            />
                                            {statutConfig[immeuble.statut]
                                                ?.label || immeuble.statut}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium font-mono text-xs">
                                            <Calendar
                                                size={14}
                                                className="text-muted-foreground/70"
                                            />
                                            {immeuble.date_livraison
                                                ? new Date(
                                                      immeuble.date_livraison,
                                                  ).toLocaleDateString(
                                                      i18n.language === "ar"
                                                          ? "ar-MA"
                                                          : "fr-FR",
                                                  )
                                                : "-"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-end">
                                        <div className="flex items-center justify-end gap-2 pe-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        `/dashboard/immeubles/${immeuble.id}`,
                                                    );
                                                }}
                                                className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination UI */}
            {!isLoading && pagination.last_page > 1 && (
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm animate-fadeIn">
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("showing_total")}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                fetchImmeubles(pagination.current_page - 1)
                            }
                            disabled={pagination.current_page === 1}
                            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:hover:border-border"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {Array.from(
                            { length: pagination.last_page },
                            (_, i) => i + 1,
                        )
                            .filter((p) => {
                                const curr = pagination.current_page;
                                return (
                                    p === 1 ||
                                    p === pagination.last_page ||
                                    Math.abs(p - curr) <= 1
                                );
                            })
                            .map((p, i, arr) => (
                                <React.Fragment key={p}>
                                    {i > 0 && arr[i - 1] !== p - 1 && (
                                        <span className="px-2 text-muted-foreground/30">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => fetchImmeubles(p)}
                                        className={`min-w-[40px] h-10 rounded-xl font-black text-sm transition-all ${
                                            pagination.current_page === p
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                                                : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            onClick={() =>
                                fetchImmeubles(pagination.current_page + 1)
                            }
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:hover:border-border"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            <CreateImmeubleModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreate}
            />

            <EditImmeubleModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedImmeuble(null);
                }}
                onSave={handleUpdate}
                immeuble={selectedImmeuble}
            />
        </div>
    );
};

export default Immeubles;
