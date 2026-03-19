import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Home,
    Layers,
    MapPin,
    DollarSign,
    Building2,
    ChevronRight,
    ChevronDown,
    X,
    Filter,
    Layout,
    Grid,
    List,
    ChevronLeft,
    Maximize,
    DoorOpen,
} from "lucide-react";
import { appartementService } from "../api/appartementService";
import { Appartement, Immeuble } from "../types";
import { useAuth } from "../hooks/useAuth";
import CreateAppartementModal from "../components/appartements/CreateAppartementModal";
import EditAppartementModal from "../components/appartements/EditAppartementModal";
import axios from "axios";

const Appartements: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appartements, setAppartements] = useState<Appartement[]>([]);
    const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [immeubleFilter, setImmeubleFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const FALLBACK_IMG =
        "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=800";

    const getCardImage = (appartement: Appartement): string => {
        let docs: string[] = [];
        if (Array.isArray(appartement.documents)) {
            docs = appartement.documents as string[];
        } else if (
            typeof appartement.documents === "string" &&
            appartement.documents
        ) {
            try {
                docs = JSON.parse(appartement.documents);
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
    const [selectedAppartement, setSelectedAppartement] =
        useState<Appartement | null>(null);

    const fetchAppartements = async (page = 1) => {
        try {
            setIsLoading(true);
            const data = await appartementService.getAppartements({
                page,
                search: searchQuery,
                statut: statusFilter === "all" ? "" : statusFilter,
                immeuble_id: immeubleFilter === "all" ? "" : immeubleFilter,
            });
            if (data.data) {
                setAppartements(data.data);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                });
            } else {
                setAppartements(data);
            }
        } catch (error) {
            console.error("Failed to fetch appartements", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchImmeubles = async () => {
        try {
            const res = await axios.get("/api/immeubles?paginate=false");
            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];
            setImmeubles(data);
        } catch (error) {
            console.error("Failed to fetch immeubles", error);
        }
    };

    useEffect(() => {
        fetchAppartements(1);
        fetchImmeubles();
    }, [searchQuery, statusFilter, immeubleFilter]);

    const handleCreate = async (data: FormData) => {
        try {
            await appartementService.createAppartement(data);
            fetchAppartements(pagination.current_page);
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating appartement", error);
            alert("Une erreur est survenue.");
        }
    };

    const handleUpdate = async (id: string, data: FormData) => {
        try {
            await appartementService.updateAppartement(id, data);
            fetchAppartements(pagination.current_page);
            setShowEditModal(false);
            setSelectedAppartement(null);
        } catch (error) {
            console.error("Error updating appartement", error);
            alert("Une erreur est survenue.");
        }
    };

    const handleDelete = async (id: string) => {
        if (user?.role?.slug !== "admin") {
            alert("Seul un administrateur peut supprimer un appartement.");
            return;
        }
        if (
            window.confirm("Voulez-vous vraiment supprimer cet appartement ?")
        ) {
            try {
                await appartementService.deleteAppartement(id);
                fetchAppartements(pagination.current_page);
            } catch (error) {
                console.error("Error deleting appartement", error);
            }
        }
    };

    const statutConfig: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        disponible: {
            label: t("status_disponible"),
            bg: "bg-emerald-600",
            text: "text-white",
            dot: "bg-emerald-300",
        },
        reserve: {
            label: t("status_reserve"),
            bg: "bg-amber-600",
            text: "text-white",
            dot: "bg-amber-300",
        },
        vendu: {
            label: t("status_vendu"),
            bg: "bg-rose-600",
            text: "text-white",
            dot: "bg-rose-300",
        },
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("appartements")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("appartements_desc")}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    Ajouter un appartement
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={t("search_apartment")}
                        className="w-full ps-12 pe-4 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none shadow-sm transition-all placeholder:text-muted-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <Filter
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <select
                        className="ps-12 pe-10 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none shadow-sm transition-all appearance-none cursor-pointer font-bold min-w-[160px]"
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
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        size={16}
                    />
                </div>

                <div className="relative">
                    <Building2
                        className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <select
                        className="ps-12 pe-10 py-4 bg-card text-foreground border border-border rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none shadow-sm transition-all appearance-none cursor-pointer font-bold min-w-[160px]"
                        value={immeubleFilter}
                        onChange={(e) => setImmeubleFilter(e.target.value)}
                    >
                        <option value="all">{t("all_buildings")}</option>
                        {immeubles.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.nom}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
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
                        Chargement des appartements...
                    </p>
                </div>
            ) : appartements.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
                    <Home
                        className="mx-auto mb-4 text-muted-foreground/30"
                        size={48}
                    />
                    <p className="text-lg font-bold text-muted-foreground">
                        Aucun appartement trouvé
                    </p>
                    <p className="text-muted-foreground mt-2">
                        Essayez de modifier votre recherche.
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {appartements.map((apt) => (
                        <div
                            key={apt.id}
                            onClick={() =>
                                navigate(`/dashboard/appartements/${apt.id}`)
                            }
                            className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden cursor-pointer relative"
                        >
                            <div className="h-48 bg-muted relative overflow-hidden">
                                <img
                                    src={getCardImage(apt)}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={apt.numero}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            FALLBACK_IMG;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute top-4 start-4 bg-white/95 dark:bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-slate-700 dark:text-foreground flex items-center gap-2 shadow-lg">
                                    <Layers
                                        size={12}
                                        className="text-emerald-500"
                                    />
                                    ÉTAGE {apt.etage}
                                </div>
                                <div
                                    className={`absolute top-4 end-4 px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 ${statutConfig[apt.statut]?.bg || "bg-slate-700"} ${statutConfig[apt.statut]?.text || "text-white"} backdrop-blur-md transition-colors`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${statutConfig[apt.statut]?.dot || "bg-white"}`}
                                    />
                                    {statutConfig[
                                        apt.statut
                                    ]?.label.toUpperCase() ||
                                        apt.statut.toUpperCase()}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors truncate max-w-[200px]">
                                            Appartement {apt.numero}
                                        </h3>
                                        <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest flex items-center gap-1">
                                            <Building2 size={12} />
                                            {apt.immeuble?.nom || "Indépendant"}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-100 dark:border-emerald-800">
                                        {apt.surface} m²
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <DoorOpen
                                            size={14}
                                            className="text-emerald-500"
                                        />
                                        <span className="font-bold">
                                            {apt.chambres} Chambres
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <DollarSign
                                            size={14}
                                            className="text-emerald-500"
                                        />
                                        <span className="font-bold">
                                            {Number(
                                                apt.prix_total,
                                            ).toLocaleString()}{" "}
                                            DH
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                                            {apt.creator?.full_name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "?"}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            <p className="font-bold text-foreground">
                                                {apt.creator?.full_name ||
                                                    "Agent"}
                                            </p>
                                            <p>
                                                {apt.client?.nom ||
                                                    "Client non assigné"}
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
                        className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all group min-h-[250px]"
                    >
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all shadow-sm border border-border">
                            <Plus size={28} />
                        </div>
                        <span className="font-bold text-sm">
                            Ajouter un appartement
                        </span>
                    </button>
                </div>
            ) : (
                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-start border-collapse">
                        <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                            <tr>
                                <th className="px-8 py-5">Appartement</th>
                                <th className="px-8 py-5">Immeuble</th>
                                <th className="px-8 py-5">Étage / Surface</th>
                                <th className="px-8 py-5">Chambres</th>
                                <th className="px-8 py-5">Prix</th>
                                <th className="px-8 py-5">Statut</th>
                                <th className="px-8 py-5 text-end">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {appartements.map((apt) => (
                                <tr
                                    key={apt.id}
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/appartements/${apt.id}`,
                                        )
                                    }
                                    className="hover:bg-muted/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-black border border-border group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-all">
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    N° {apt.numero}
                                                </p>
                                                <p className="text-[10px] font-black text-muted-foreground mt-0.5 tracking-wider uppercase">
                                                    REF:{" "}
                                                    {apt.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 font-semibold text-foreground">
                                            <Building2
                                                className="text-emerald-500"
                                                size={14}
                                            />
                                            {apt.immeuble?.nom || "-"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-foreground">
                                            Étage {apt.etage}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {apt.surface} m²
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-muted-foreground">
                                        {apt.chambres} ch.
                                    </td>
                                    <td className="px-8 py-5 font-bold text-emerald-600">
                                        {Number(
                                            apt.prix_total,
                                        ).toLocaleString()}{" "}
                                        DH
                                    </td>
                                    <td className="px-8 py-5">
                                        <span
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 w-fit ${statutConfig[apt.statut]?.bg || "bg-slate-700"} ${statutConfig[apt.statut]?.text || "text-white"}`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${statutConfig[apt.statut]?.dot || "bg-white/50"}`}
                                            />
                                            {statutConfig[apt.statut]?.label ||
                                                apt.statut}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-end">
                                        <div className="flex items-center justify-end gap-2 pe-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        `/dashboard/appartements/${apt.id}`,
                                                    );
                                                }}
                                                className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all"
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
                        Affichage de{" "}
                        <span className="text-foreground font-bold">
                            {appartements.length}
                        </span>{" "}
                        sur{" "}
                        <span className="text-foreground font-bold">
                            {pagination.total}
                        </span>{" "}
                        appartements
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                fetchAppartements(pagination.current_page - 1)
                            }
                            disabled={pagination.current_page === 1}
                            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-500/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {Array.from(
                            { length: pagination.last_page },
                            (_, i) => i + 1,
                        ).map((p) => (
                            <button
                                key={p}
                                onClick={() => fetchAppartements(p)}
                                className={`min-w-[40px] h-10 rounded-xl font-black text-sm transition-all ${
                                    pagination.current_page === p
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                        : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                fetchAppartements(pagination.current_page + 1)
                            }
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-500/50 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            <CreateAppartementModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreate}
            />

            <EditAppartementModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedAppartement(null);
                }}
                onSave={handleUpdate}
                appartement={selectedAppartement}
            />
        </div>
    );
};

export default Appartements;
