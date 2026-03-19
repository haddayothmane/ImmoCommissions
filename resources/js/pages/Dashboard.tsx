import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { dashboardService, DashboardStats } from "../api/dashboardService";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    TrendingUp,
    Home,
    Users,
    Wallet,
    Calendar,
    AlertTriangle,
} from "lucide-react";

const Dashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState<"day" | "month" | "year">(
        "month",
    );

    useEffect(() => {
        dashboardService
            .getStats()
            .then((data) => {
                setStats(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load stats", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading || !stats) {
        return (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
                {t("loading_dashboard")}
            </div>
        );
    }

    const statCards = [
        {
            label: t("stats_sales"),
            value: `${stats.total_sales.toLocaleString()} MAD`,
            icon: <Wallet className="text-emerald-500" />,
            trend: "+0%",
        },
        {
            label: t("stats_paid"),
            value: `${stats.total_paid.toLocaleString()} MAD`,
            icon: <TrendingUp className="text-blue-500" />,
            trend: "0%",
        },
        {
            label: t("stats_remaining"),
            value: `${stats.remaining.toLocaleString()} MAD`,
            icon: <Users className="text-purple-500" />,
            trend: "0%",
        },
        {
            label: t("stats_late"),
            value: stats.late_milestones.toString(),
            icon: <Home className="text-red-500" />,
            trend: "0%",
        },
    ];

    // Memoize chart data depending on period
    const chartData = (() => {
        if (!stats) return [];
        let data: { period: string; total: number }[] = [];
        if (chartPeriod === "day") data = stats.daily_payments;
        else if (chartPeriod === "month") data = stats.monthly_payments;
        else if (chartPeriod === "year") data = stats.yearly_payments;

        return data.length > 0 ? data : [{ period: t("none"), total: 0 }];
    })();

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("dashboard")}
                    </h1>
                    <p className="text-muted-foreground">{t("today")}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-card p-6 rounded-2xl border border-border shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-muted rounded-xl">
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {stat.label}
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                            {stat.value}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Sales Chart */}
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-foreground">
                            {t("paid_payments")}
                        </h3>
                        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                            <button
                                onClick={() => setChartPeriod("day")}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${chartPeriod === "day" ? "bg-white text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t("days")}
                            </button>
                            <button
                                onClick={() => setChartPeriod("month")}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${chartPeriod === "month" ? "bg-white text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t("months")}
                            </button>
                            <button
                                onClick={() => setChartPeriod("year")}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${chartPeriod === "year" ? "bg-white text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t("years")}
                            </button>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient
                                        id="colorSales"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#059669"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#059669"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="period"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow:
                                            "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#059669"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Late Milestones List */}
                {stats.late_milestones_list &&
                    stats.late_milestones_list.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle
                                        className="text-red-500"
                                        size={20}
                                    />
                                    {t("stats_late")}
                                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-1 px-3 rounded-full text-xs font-black">
                                        {stats.late_milestones_list.length}
                                    </span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-start border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            <th className="p-4 ps-0">
                                                {t("client")}
                                            </th>
                                            <th className="p-4">
                                                {t("contact")}
                                            </th>
                                            <th className="p-4">
                                                {t("milestone")}
                                            </th>
                                            <th className="p-4">
                                                {t("due_date_planned")}
                                            </th>
                                            <th className="p-4 text-end pe-0">
                                                {t("amount")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.late_milestones_list.map((m) => (
                                            <tr
                                                key={m.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/contracts/${m.contract_id}`,
                                                    )
                                                }
                                                className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                                            >
                                                <td className="p-4 ps-0 font-bold text-slate-900 dark:text-white">
                                                    {m.client_name}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {m.client_phone}
                                                </td>
                                                <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                                    {m.label}
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded">
                                                        <Calendar size={12} />
                                                        {new Date(
                                                            m.due_date,
                                                        ).toLocaleDateString(
                                                            i18n.language ===
                                                                "ar"
                                                                ? "ar-MA"
                                                                : "fr-FR",
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="p-4 pe-0 font-black text-slate-900 dark:text-white text-end">
                                                    {m.amount.toLocaleString()}{" "}
                                                    MAD
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Dashboard;
