import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    User,
    Building2,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    Layers,
    CheckCircle2,
    Search,
    Loader2,
} from "lucide-react";
import { contractService } from "../api/contractService";
import { clientService } from "../api/clientService";
import { Client, Immeuble, Appartement, Terrain } from "../types";
import axios from "axios";

const CreateContract: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // -- Autocomplete Sub-component --
    const Autocomplete = ({
        label,
        onSelect,
        fetchOptions,
        initialValue = "",
        placeholder = "",
        icon: Icon,
    }: any) => {
        const [query, setQuery] = useState("");
        const [options, setOptions] = useState<any[]>([]);
        const [isOpen, setIsOpen] = useState(false);
        const [isFetching, setIsFetching] = useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        useEffect(() => {
            const timer = setTimeout(async () => {
                if (query.length < 1) {
                    setOptions([]);
                    return;
                }
                setIsFetching(true);
                try {
                    const results = await fetchOptions(query);
                    setOptions(results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsFetching(false);
                }
            }, 400);

            return () => clearTimeout(timer);
        }, [query]);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <Icon
                            className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className={`w-full ${Icon ? "ps-11" : "px-4"} pe-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium dark:text-white`}
                    />
                    {isFetching && (
                        <Loader2
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
                            size={18}
                        />
                    )}
                    {!isFetching && (
                        <Search
                            className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-300"
                            size={16}
                        />
                    )}
                </div>

                {isOpen && options.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 scrollbar-none animate-slideDown">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    onSelect(opt.id, opt);
                                    setQuery(
                                        opt.nom ||
                                            opt.numero ||
                                            opt.nom_projet ||
                                            opt.full_name ||
                                            "",
                                    );
                                    setIsOpen(false);
                                }}
                                className="w-full text-start px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors flex flex-col gap-0.5"
                            >
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {opt.nom ||
                                        opt.nom_projet ||
                                        (opt.numero
                                            ? `${t("appartement")} ${opt.numero}`
                                            : "") ||
                                        opt.full_name}
                                </span>
                                {(opt.cin || opt.surface || opt.ville) && (
                                    <span className="text-[10px] text-slate-500 font-medium opacity-70">
                                        {opt.cin ? `CIN: ${opt.cin}` : ""}
                                        {opt.surface ? `${opt.surface} m²` : ""}
                                        {opt.ville ? ` • ${opt.ville}` : ""}
                                        {opt.etage !== undefined
                                            ? ` • ${t("floor")} ${opt.etage}`
                                            : ""}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                {isOpen &&
                    query.length > 2 &&
                    options.length === 0 &&
                    !isFetching && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 text-center text-slate-400 text-sm animate-slideDown">
                            {t("no_results")} "{query}"
                        </div>
                    )}
            </div>
        );
    };

    const [clients, setClients] = useState<Client[]>([]);
    const [terrains, setTerrains] = useState<Terrain[]>([]);
    const [immeubles, setImmeubles] = useState<Immeuble[]>([]);
    const [appartements, setAppartements] = useState<Appartement[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [clientId, setClientId] = useState("");
    const [targetType, setTargetType] = useState<
        "Appartement" | "Immeuble" | "Terrain"
    >("Appartement");
    const [targetId, setTargetId] = useState("");
    const [totalPrice, setTotalPrice] = useState<string>("");

    // Payment Config
    const [paymentMode, setPaymentMode] = useState<"cash" | "tranches">("cash"); // payment form mode

    const [schedules, setSchedules] = useState<
        { label: string; amount: string; due_date: string }[]
    >([]);

    const selectedClient = clients.find(
        (c) => String(c.id) === String(clientId),
    );

    const prop =
        targetType === "Appartement"
            ? appartements.find((a) => String(a.id) === String(targetId))
            : targetType === "Immeuble"
              ? immeubles.find((i) => String(i.id) === String(targetId))
              : terrains.find((t) => String(t.id) === String(targetId));

    useEffect(() => {
        if (prop) {
            const price =
                (prop as any).prix_total || (prop as any).prix_achat || "";
            setTotalPrice(String(price));
        }
    }, [prop]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [cls, terrs, imms, apps] = await Promise.all([
                clientService.getClients(),
                axios
                    .get("/api/terrains?paginate=false")
                    .then((r) =>
                        Array.isArray(r.data) ? r.data : r.data.data,
                    ),
                axios
                    .get("/api/immeubles?paginate=false")
                    .then((r) =>
                        Array.isArray(r.data) ? r.data : r.data.data,
                    ),
                axios
                    .get("/api/appartements?paginate=false")
                    .then((r) =>
                        Array.isArray(r.data) ? r.data : r.data.data,
                    ),
            ]);
            setClients(cls);
            setTerrains(terrs);
            setImmeubles(imms);
            // Filter only available ones for sell
            setAppartements(
                apps.filter((a: Appartement) => a.statut === "disponible"),
            );
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSchedule = () => {
        setSchedules([
            ...schedules,
            {
                label: `Tranche ${schedules.length + 1}`,
                amount: "",
                due_date: "",
            },
        ]);
    };

    const removeSchedule = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const updateSchedule = (index: number, field: string, value: string) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        setSchedules(updated);
    };

    const schedulesTotal = schedules.reduce(
        (sum, s) => sum + (parseFloat(s.amount) || 0),
        0,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMode === "tranches") {
            const price = parseFloat(totalPrice);
            if (Math.abs(schedulesTotal - price) > 0.01) {
                alert(
                    "Le total des échéances doit être égal au prix total de vente.",
                );
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const numPrice = parseFloat(totalPrice);
            const payload = {
                client_id: clientId,
                target_type: `App\\Models\\${targetType}`,
                target_id: targetId,
                total_sale_price: numPrice,
                status: "active",
                payment_config: {
                    mode: "virement", // Default to virement, user can change later on encaissements
                    type: paymentMode === "cash" ? "totalite" : "tranches",
                },
                schedules:
                    paymentMode === "tranches"
                        ? schedules.map((s) => ({
                              label: s.label,
                              amount: parseFloat(s.amount),
                              due_date: s.due_date,
                          }))
                        : [],
            };

            const created = await contractService.createContract(payload);
            navigate(`/dashboard/contracts/${created.id}`);
        } catch (error: any) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Erreur lors de la création du contrat.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading)
        return (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">
                Chargement des données...
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <ArrowLeft
                        className="text-slate-600 dark:text-slate-400"
                        size={20}
                    />
                </button>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {t("new_contract_title")}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* section: Informations de base */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <User className="text-emerald-500" />{" "}
                        {t("client_info_property")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Selection */}
                        <div className="space-y-2">
                            <Autocomplete
                                label={t("clients")}
                                placeholder={t("search_client_placeholder")}
                                icon={User}
                                onSelect={(id: string, item: any) => {
                                    setClientId(id);
                                    if (
                                        !clients.find(
                                            (c) => String(c.id) === String(id),
                                        )
                                    ) {
                                        setClients((prev) => [...prev, item]);
                                    }
                                }}
                                fetchOptions={async (q: string) => {
                                    const res = await axios.get(
                                        `/api/clients?search=${q}`,
                                    );
                                    return Array.isArray(res.data)
                                        ? res.data
                                        : res.data.data;
                                }}
                            />

                            {selectedClient && (
                                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl animate-slideDown overflow-hidden">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-800/30 flex-shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-emerald-900 dark:text-emerald-400">
                                                {selectedClient.nom}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-emerald-700 dark:text-emerald-500/70 font-medium">
                                                <p>
                                                    <span className="opacity-60">
                                                        CIN:
                                                    </span>{" "}
                                                    {selectedClient.cin}
                                                </p>
                                                <p>
                                                    <span className="opacity-60">
                                                        {t("phone")}:
                                                    </span>{" "}
                                                    {selectedClient.telephone}
                                                </p>
                                                {selectedClient.email && (
                                                    <p className="sm:col-span-2">
                                                        <span className="opacity-60">
                                                            Email:
                                                        </span>{" "}
                                                        {selectedClient.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property Type Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
                                {t("property_type")}
                            </label>
                            <select
                                value={targetType}
                                onChange={(e) => {
                                    setTargetType(e.target.value as any);
                                    setTargetId("");
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium dark:text-white"
                            >
                                <option value="Appartement">
                                    {t("appartements")}
                                </option>
                                <option value="Immeuble">
                                    {t("immeubles")}
                                </option>
                                <option value="Terrain">{t("terrains")}</option>
                            </select>
                        </div>

                        {/* Property Selection (Autocomplete) */}
                        <div className="space-y-2">
                            <Autocomplete
                                label={t("property_to_sell")}
                                placeholder={t("search_placeholder")}
                                icon={Building2}
                                onSelect={(id: string, item: any) => {
                                    setTargetId(id);
                                    if (
                                        targetType === "Appartement" &&
                                        !appartements.find(
                                            (a) => String(a.id) === String(id),
                                        )
                                    ) {
                                        setAppartements((prev) => [
                                            ...prev,
                                            item,
                                        ]);
                                    } else if (
                                        targetType === "Immeuble" &&
                                        !immeubles.find(
                                            (i) => String(i.id) === String(id),
                                        )
                                    ) {
                                        setImmeubles((prev) => [...prev, item]);
                                    } else if (
                                        targetType === "Terrain" &&
                                        !terrains.find(
                                            (t) => String(t.id) === String(id),
                                        )
                                    ) {
                                        setTerrains((prev) => [...prev, item]);
                                    }
                                }}
                                fetchOptions={async (q: string) => {
                                    let url = "";
                                    if (targetType === "Appartement")
                                        url = `/api/appartements?search=${q}&statut=disponible&paginate=false`;
                                    else if (targetType === "Immeuble")
                                        url = `/api/immeubles?search=${q}&paginate=false`;
                                    else
                                        url = `/api/terrains?search=${q}&paginate=false`;

                                    const res = await axios.get(url);
                                    return Array.isArray(res.data)
                                        ? res.data
                                        : res.data.data;
                                }}
                            />

                            {prop && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl animate-slideDown overflow-hidden">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800/30 flex-shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="space-y-1 text-blue-900 dark:text-blue-400">
                                            <p className="text-sm font-black">
                                                {targetType === "Appartement"
                                                    ? `${t("appartement")} ${(prop as Appartement).numero}`
                                                    : targetType === "Immeuble"
                                                      ? (prop as Immeuble).nom
                                                      : (prop as Terrain)
                                                            .nom_projet}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-blue-700 dark:text-blue-500/70 font-medium">
                                                <p>
                                                    <span className="opacity-60">
                                                        {t("surface")}:
                                                    </span>{" "}
                                                    {(prop as any).surface ||
                                                        "—"}{" "}
                                                    m²
                                                </p>
                                                <p>
                                                    <span className="opacity-60">
                                                        {t("price")}:
                                                    </span>{" "}
                                                    <span className="font-black">
                                                        {(
                                                            (prop as any)
                                                                .prix_total ||
                                                            (prop as any)
                                                                .prix_achat ||
                                                            0
                                                        ).toLocaleString()}{" "}
                                                        {t("currency")}
                                                    </span>
                                                </p>
                                                {targetType ===
                                                    "Appartement" && (
                                                    <p>
                                                        <span className="opacity-60">
                                                            {t("floor")}:
                                                        </span>{" "}
                                                        {
                                                            (
                                                                prop as Appartement
                                                            ).etage
                                                        }
                                                    </p>
                                                )}
                                                {targetType === "Terrain" && (
                                                    <p>
                                                        <span className="opacity-60">
                                                            {t("city")}:
                                                        </span>{" "}
                                                        {
                                                            (prop as Terrain)
                                                                .ville
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sale Price (Manual/Auto) */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
                                {t("total_sales_price")} (MAD)
                            </label>
                            <div className="relative">
                                <DollarSign
                                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                    size={18}
                                />
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={totalPrice}
                                    onChange={(e) =>
                                        setTotalPrice(e.target.value)
                                    }
                                    placeholder="Ex: 850000"
                                    className="w-full ps-11 pe-4 py-3 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 rounded-xl font-black text-emerald-900 dark:text-emerald-400 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* section: Mode de paiement */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <Layers className="text-emerald-500" />{" "}
                        {t("payment_method")}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setPaymentMode("cash")}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${paymentMode === "cash" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500/50 text-slate-500 dark:text-slate-400"}`}
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${paymentMode === "cash" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                            >
                                <DollarSign size={24} />
                            </div>
                            <span className="font-bold">{t("cash_100")}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPaymentMode("tranches");
                                if (schedules.length === 0) addSchedule();
                            }}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${paymentMode === "tranches" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500/50 text-slate-500 dark:text-slate-400"}`}
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${paymentMode === "tranches" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                            >
                                <Calendar size={24} />
                            </div>
                            <span className="font-bold">
                                {t("custom_schedule")}
                            </span>
                        </button>
                    </div>

                    {paymentMode === "tranches" && (
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {t("define_payments")}
                                </h3>
                                <button
                                    type="button"
                                    onClick={addSchedule}
                                    className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700/50"
                                >
                                    <Plus size={14} /> {t("add_installment")}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {schedules.map((schedule, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 items-start bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative group"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">
                                                {t("label")}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={schedule.label}
                                                onChange={(e) =>
                                                    updateSchedule(
                                                        index,
                                                        "label",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 font-semibold dark:text-white"
                                                placeholder="Ex: Réservation"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">
                                                {t("amount")} (MAD)
                                            </label>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={schedule.amount}
                                                onChange={(e) =>
                                                    updateSchedule(
                                                        index,
                                                        "amount",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 font-black dark:text-white"
                                                placeholder="Montant"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">
                                                {t("due_date")}
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={schedule.due_date}
                                                onChange={(e) =>
                                                    updateSchedule(
                                                        index,
                                                        "due_date",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 font-medium dark:text-white"
                                            />
                                        </div>
                                        {schedules.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSchedule(index)
                                                }
                                                className="mt-6 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/50 px-2 text-sm">
                                <span className="font-bold text-slate-500 dark:text-slate-400">
                                    {t("total_installments")}:
                                </span>
                                <span
                                    className={`font-black text-lg ${Math.abs(schedulesTotal - (parseFloat(totalPrice) || 0)) > 0.01 ? "text-red-500" : "text-emerald-500 dark:text-emerald-400 flex items-center gap-2"}`}
                                >
                                    {Math.abs(
                                        schedulesTotal -
                                            (parseFloat(totalPrice) || 0),
                                    ) <= 0.01 && <CheckCircle2 size={18} />}
                                    {schedulesTotal.toLocaleString()} /{" "}
                                    {parseFloat(
                                        totalPrice || "0",
                                    ).toLocaleString()}{" "}
                                    MAD
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-4 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex-1 transition-colors"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-4 rounded-xl font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 disabled:opacity-50 flex-[2]"
                    >
                        {isSubmitting
                            ? t("generating_contract")
                            : t("generate_contract")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateContract;
