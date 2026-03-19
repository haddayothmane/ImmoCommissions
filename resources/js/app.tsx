import React from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import "./i18n";

// Components
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Inventory from "./pages/Inventory";
import ItemDetails from "./pages/ItemDetails";
import Immeubles from "./pages/Immeubles";
import ImmeubleDetails from "./pages/ImmeubleDetails";
import Appartements from "./pages/Appartements";
import AppartementDetails from "./pages/AppartementDetails";
import Contracts from "./pages/Contracts";
import CreateContract from "./pages/CreateContract";
import ContractDetails from "./pages/ContractDetails";
import Employees from "./pages/Employees";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Roles from "./pages/Roles";
import Unauthorized from "./pages/Unauthorized";
import Paiements from "./pages/Paiements";
import Commissions from "./pages/Commissions";
import CommissionDetails from "./pages/CommissionDetails";
import Landing from "./pages/Landing";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user, isLoading } = useAuth();
    if (isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    if (!user) return <Landing />;
    return <>{children}</>;
};

const PermissionRoute: React.FC<{
    children: React.ReactNode;
    permission?: string;
    role?: string;
}> = ({ children, permission, role }) => {
    const { user, permissions, isLoading } = useAuth();

    if (isLoading) return null;
    if (!user) return <Navigate to="/auth" />;

    if (role && user.role?.slug !== role) {
        return <Navigate to="/unauthorized" />;
    }

    if (permission && !permissions.includes(permission)) {
        return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/landing" element={<Landing />} />

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Navigate to="/dashboard" replace />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/onboarding"
                        element={
                            <PrivateRoute>
                                <Onboarding />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route
                            path="clients"
                            element={
                                <PermissionRoute permission="manage_clients">
                                    <Clients />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="clients/:id"
                            element={
                                <PermissionRoute permission="manage_clients">
                                    <ClientDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="contracts"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <Contracts />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="contracts/new"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <CreateContract />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="contracts/:id"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <ContractDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="inventory"
                            element={
                                <PermissionRoute permission="manage_terrains">
                                    <Inventory />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="inventory/:id"
                            element={
                                <PermissionRoute permission="manage_terrains">
                                    <ItemDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="immeubles"
                            element={
                                <PermissionRoute permission="manage_immeubles">
                                    <Immeubles />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="immeubles/:id"
                            element={
                                <PermissionRoute permission="manage_immeubles">
                                    <ImmeubleDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="appartements"
                            element={
                                <PermissionRoute permission="manage_immeubles">
                                    <Appartements />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="appartements/:id"
                            element={
                                <PermissionRoute permission="manage_immeubles">
                                    <AppartementDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="paiements"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <Paiements />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="commissions"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <Commissions />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="commissions/:id"
                            element={
                                <PermissionRoute permission="manage_contracts">
                                    <CommissionDetails />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="employees"
                            element={
                                <PermissionRoute permission="manage_users">
                                    <Employees />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="roles"
                            element={
                                <PermissionRoute role="admin">
                                    <Roles />
                                </PermissionRoute>
                            }
                        />
                        <Route path="unauthorized" element={<Unauthorized />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;

import { ThemeProvider } from "./components/ThemeProvider";

const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(
        <ThemeProvider defaultTheme="light" storageKey="immocommissions-theme">
            <App />
        </ThemeProvider>,
    );
}
