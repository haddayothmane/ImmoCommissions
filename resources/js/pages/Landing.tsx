import React, { useState, useEffect } from "react";
import {
    Building2,
    Users,
    CreditCard,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Menu,
    X,
    PlayCircle,
    BarChart3,
    Map as MapIcon,
    ChevronRight,
    Star,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll for sticky navbar glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.title = "Immocommissions - Modern Real Estate CRM";
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
            {/* Navigation */}
            <nav
                className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800" : "bg-transparent"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center shrink-0">
                            <Building2 className="nav-logo h-8 w-8 text-emerald-500 me-2" />
                            <span className="font-bold text-xl tracking-tight text-white">
                                Immocommissions
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-8 items-center">
                            <a
                                href="#features"
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                How it Works
                            </a>
                            <a
                                href="#testimonials"
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Testimonials
                            </a>
                            <a
                                href="#pricing"
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Pricing
                            </a>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/auth"
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/auth"
                                state={{ isSignUp: true }}
                                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                            >
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="text-slate-300 hover:text-white"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800 absolute w-full px-4 pt-2 pb-6 space-y-2">
                        <a
                            href="#features"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                            How it Works
                        </a>
                        <a
                            href="#pricing"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                            Pricing
                        </a>
                        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col space-y-3">
                            <Link
                                to="/login"
                                className="block text-center px-4 py-2 text-slate-300 border border-slate-700 rounded-md hover:bg-slate-800"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="block text-center px-4 py-2 bg-emerald-500 text-slate-950 rounded-md font-medium hover:bg-emerald-400"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-[20%] start-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
                <div className="absolute top-[30%] -end-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 me-2 animate-pulse"></span>
                            ImmoCommissions 2.0 is now live
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                            Streamline Your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Real Estate Agency
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            The comprehensive, multi-tenant CRM designed for
                            modern real estate professionals. Manage your
                            properties, clients, and automate commissions in one
                            secure, beautiful workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                to="/auth"
                                state={{ isSignUp: true }}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all group"
                            >
                                Start Free Trial
                                <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#demo"
                                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500 text-base font-medium rounded-xl text-white transition-all backdrop-blur-sm"
                            >
                                <PlayCircle className="me-2 h-5 w-5 text-slate-400" />
                                Book a Demo
                            </a>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                            No credit card required • 14-day free trial
                        </p>
                    </div>

                    {/* Dashboard Placeholder/Mockup */}
                    <div className="mt-20 relative mx-auto w-full max-w-6xl rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2 lg:p-4 backdrop-blur-xl shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
                        <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner relative">
                            {/* Fake Browser Chrome */}
                            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                                <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                            </div>
                            {/* Fake UI Content */}
                            <div className="p-6 grid grid-cols-12 gap-6 opacity-90 h-[400px] lg:h-[600px] bg-gradient-to-b from-slate-900 to-slate-950">
                                {/* Sidebar mock */}
                                <div className="hidden lg:col-span-2 lg:flex flex-col space-y-4 border-r border-slate-800/50 pe-4">
                                    <div className="h-8 w-3/4 rounded bg-slate-800/60 mb-8"></div>
                                    <div className="h-4 w-full rounded bg-emerald-500/20"></div>
                                    <div className="h-4 w-5/6 rounded bg-slate-800/50"></div>
                                    <div className="h-4 w-4/6 rounded bg-slate-800/50"></div>
                                    <div className="h-4 w-full rounded bg-slate-800/50"></div>
                                </div>
                                {/* Main Content mock */}
                                <div className="col-span-12 lg:col-span-10 flex flex-col space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="h-8 w-48 rounded bg-slate-800/80"></div>
                                        <div className="h-8 w-32 rounded bg-emerald-500/80"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-32 rounded-xl bg-slate-800/40 border border-slate-800 p-4 flex flex-col justify-between">
                                            <div className="h-4 w-1/2 bg-slate-700/50 rounded"></div>
                                            <div className="h-8 w-3/4 bg-emerald-500/40 rounded"></div>
                                        </div>
                                        <div className="h-32 rounded-xl bg-slate-800/40 border border-slate-800 p-4 flex flex-col justify-between">
                                            <div className="h-4 w-1/2 bg-slate-700/50 rounded"></div>
                                            <div className="h-8 w-3/4 bg-blue-500/40 rounded"></div>
                                        </div>
                                        <div className="h-32 rounded-xl bg-slate-800/40 border border-slate-800 p-4 flex flex-col justify-between">
                                            <div className="h-4 w-1/2 bg-slate-700/50 rounded"></div>
                                            <div className="h-8 w-3/4 bg-purple-500/40 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-slate-800/30 border border-slate-800 mt-4 p-4">
                                        {/* Chart mock */}
                                        <div className="h-full w-full flex items-end space-x-2">
                                            {[
                                                40, 70, 45, 90, 65, 80, 50, 100,
                                                75, 85,
                                            ].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-emerald-500/20 rounded-t-md hover:bg-emerald-500/40 transition-colors"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Overlay gradient to fade out bottom */}
                            <div className="absolute bottom-0 start-0 end-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-900/50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Everything an agency needs
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Stop juggling endless spreadsheets. Immocommissions
                            brings your inventory, clients, contracts, and
                            revenue together intuitively.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<MapIcon className="h-7 w-7 text-cyan-400" />}
                            title="Complete Inventory Management"
                            description="Easily track and manage different property types, including Buildings (Immeubles) and Land (Terrains) with rich media and specifications."
                            delay="0"
                        />
                        <FeatureCard
                            icon={
                                <Users className="h-7 w-7 text-emerald-400" />
                            }
                            title="Client & Contract CRM"
                            description="A detailed dashboard for client profiles, active contracts, and comprehensive property schedules to maintain perfect client relations."
                            delay="100"
                        />
                        <FeatureCard
                            icon={
                                <BarChart3 className="h-7 w-7 text-purple-400" />
                            }
                            title="Financial Tracking"
                            description="Track client payment schedules, transaction statuses, and instantly calculate agent commissions automatically with high accuracy."
                            delay="200"
                        />
                        <FeatureCard
                            icon={
                                <ShieldCheck className="h-7 w-7 text-rose-400" />
                            }
                            title="Agency Multi-Tenancy"
                            description="Each real estate agency gets its own secure workspace with a robust roles and permissions system for fine-grained access control."
                            delay="300"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Split Section */}
            <section
                id="how-it-works"
                className="py-24 overflow-hidden border-t border-slate-800/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700">
                                Workflow Automation
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                Contracts to{" "}
                                <span className="text-emerald-400">
                                    Commissions
                                </span>{" "}
                                smoothly.
                            </h2>
                            <p className="text-lg text-slate-400">
                                Forget manual calculations. Our engine
                                automatically structures payment schedules,
                                tracks incoming transactions, and calculates
                                complex agent commissions without missing a
                                cent.
                            </p>

                            <ul className="space-y-5">
                                {[
                                    "Add properties and link them directly to clients.",
                                    "Generate binding contracts directly in the system.",
                                    "Track installments and automatically update ledger status.",
                                ].map((item, i) => (
                                    <li key={i} className="flex flex-start">
                                        <div className="flex-shrink-0 mt-1">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <p className="ms-3 text-slate-300">
                                            {item}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                                >
                                    Explore full capabilities
                                    <ChevronRight className="ms-1 h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full relative">
                            {/* Decorative background glow */}
                            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>

                            {/* UI Mockup Card */}
                            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-2xl relative">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center">
                                        <CreditCard className="me-2 h-5 w-5 text-emerald-400" />
                                        Payment Schedule
                                    </h3>
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                        Active
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        {
                                            date: "Oct 15, 2026",
                                            amount: "$5,000",
                                            status: "Paid",
                                            statusClass:
                                                "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                                        },
                                        {
                                            date: "Nov 15, 2026",
                                            amount: "$5,000",
                                            status: "Pending",
                                            statusClass:
                                                "text-amber-400 bg-amber-500/10 border-amber-500/20",
                                        },
                                        {
                                            date: "Dec 15, 2026",
                                            amount: "$5,000",
                                            status: "Upcoming",
                                            statusClass:
                                                "text-slate-400 bg-slate-800 border-slate-700",
                                        },
                                    ].map((row, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded bg-slate-800 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">
                                                        Suite 4B Installment
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {row.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-end flex items-center space-x-4">
                                                <span className="text-sm font-medium text-white">
                                                    {row.amount}
                                                </span>
                                                <span
                                                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${row.statusClass}`}
                                                >
                                                    {row.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section
                id="testimonials"
                className="py-24 bg-slate-900 border-t border-slate-800/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Trusted by top agencies
                        </h2>
                        <p className="text-slate-400">
                            See what our partners are saying about the platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Immocommissions changed how our agency runs. The automatic commission tracking alone saved us 15 hours a week.",
                                author: "Sarah Jenkins",
                                role: "Managing Director, Skyline Realty",
                            },
                            {
                                quote: "Before this, separating permissions across our regional offices was a nightmare. The multi-tenancy architecture is flawless.",
                                author: "David Chen",
                                role: "Operations Head, Metro Estates",
                            },
                            {
                                quote: "The interface is gorgeous. Our agents actually enjoy logging in to update their client contracts and view their pipelines.",
                                author: "Elena Rodriguez",
                                role: "Principal Broker, Vue Properties",
                            },
                        ].map((testimonial, i) => (
                            <div
                                key={i}
                                className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/50 transition-colors relative isolate"
                            >
                                <div className="absolute text-7xl text-slate-700/30 top-4 start-6 -z-10 font-serif">
                                    "
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="h-4 w-4 text-amber-400 fill-amber-400 me-1"
                                        />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-6 relative z-10 font-medium leading-relaxed">
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <h4 className="font-semibold text-white">
                                        {testimonial.author}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute bottom-0 start-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Start free, upgrade as your agency grows. No hidden
                            fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                        {/* Starter */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Starter
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Perfect for small teams starting out.
                            </p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">
                                    $49
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Up to 5 Agents",
                                    "Basic Inventory Management",
                                    "Client CRM",
                                    "Email Support",
                                ].map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center text-sm text-slate-300"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 me-3" />{" "}
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full py-3 px-4 border border-slate-700 hover:bg-slate-800 text-center rounded-xl text-sm font-medium transition-colors"
                            >
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Pro - Highlighted */}
                        <div className="bg-slate-800 border-2 border-emerald-500 rounded-3xl p-8 transform md:-translate-y-4 shadow-2xl relative shadow-emerald-500/10">
                            <div className="absolute top-0 start-1/2 -translate-x-1/2 -mt-4 bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Pro
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                For growing real estate agencies.
                            </p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-white">
                                    $129
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Up to 25 Agents",
                                    "Advanced Contract Management",
                                    "Automated Commissions",
                                    "Role & Permission System",
                                    "Priority Support",
                                ].map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center text-sm text-white"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 me-3" />{" "}
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center rounded-xl font-semibold transition-colors shadow-lg"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Enterprise
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                For large brokerages and franchises.
                            </p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">
                                    $299
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Unlimited Agents",
                                    "Multi-Office Workspaces",
                                    "Custom Branding",
                                    "API Access",
                                    "Dedicated Account Manager",
                                ].map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center text-sm text-slate-300"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 me-3" />{" "}
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/contact"
                                className="block w-full py-3 px-4 border border-slate-700 hover:bg-slate-800 text-center rounded-xl text-sm font-medium transition-colors"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-800 border-opacity-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-1">
                            <div className="flex flex-shrink-0 items-center shrink-0 mb-4">
                                <Building2 className="h-6 w-6 text-emerald-500 me-2" />
                                <span className="font-bold text-lg tracking-tight text-white">
                                    Immocommissions
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm font-light mb-6">
                                The modern operating system for real estate
                                agencies across the world.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">
                                Product
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Roles & Security
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Changelog
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">
                                Company
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-emerald-400 transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">
                                Stay updated
                            </h4>
                            <form className="mt-2 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full"
                                />
                                <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg px-4 py-2 text-sm transition-colors whitespace-nowrap"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm">
                            &copy; {new Date().getFullYear()} Immocommissions.
                            All rights reserved.
                        </p>
                        <div className="flex space-x-4 text-sm text-slate-500">
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    delay,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: string;
}) {
    return (
        <div
            className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 group backdrop-blur-sm"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
