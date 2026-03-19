import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
} from "react";
import axios from "axios";
import { Employee, Agency } from "../types";

interface User {
    id: string;
    name: string;
    email: string;
    role_id?: string;
    role?: {
        id: string;
        slug: string;
        name: string;
    };
    agence_id?: string;
}

// Configure axios for token-based auth
const token = localStorage.getItem("auth_token");
if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

interface AuthContextType {
    user: User | null;
    employee: Employee | null;
    agency: Agency | null;
    isLoading: boolean;
    permissions: string[];
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        name: string,
        password?: string,
        passwordConfirmation?: string,
    ) => Promise<void>;
    signOut: () => Promise<void>;
    hasAgency: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [agency, setAgency] = useState<Agency | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        const currentToken = localStorage.getItem("auth_token");
        if (!currentToken) {
            setUser(null);
            setAgency(null);
            setEmployee(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get("/api/user");
            setUser(response.data.user);
            setAgency(response.data.agency);
            setEmployee(response.data.employee);
            setPermissions(response.data.permissions || []);
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem("auth_token");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
            setAgency(null);
            setEmployee(null);
            setPermissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signIn = async (email: string, password = "password") => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });
            const { access_token, user: userData } = response.data;

            localStorage.setItem("auth_token", access_token);
            axios.defaults.headers.common["Authorization"] =
                `Bearer ${access_token}`;

            // Update local state immediately for smoother transition
            setUser(userData);

            // Still refresh to get agency/employee details
            await refreshUser();

            // Redirection logic based on whether they have an agency
            if (userData.agence_id) {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/onboarding";
            }
        } catch (error) {
            console.error("Sign in failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (
        email: string,
        name: string,
        password = "password",
        password_confirmation = "password",
    ) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/register", {
                email,
                name,
                password,
                password_confirmation,
            });
            const { access_token, user: userData } = response.data;

            localStorage.setItem("auth_token", access_token);
            axios.defaults.headers.common["Authorization"] =
                `Bearer ${access_token}`;

            setUser(userData);
            await refreshUser();
            window.location.href = "/onboarding";
        } catch (error) {
            console.error("Sign up failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await axios.post("/api/logout");
        } catch (error) {
            console.error("Sign out failed", error);
        } finally {
            localStorage.removeItem("auth_token");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
            setEmployee(null);
            setAgency(null);
            setPermissions([]);
            window.location.href = "/";
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                employee,
                agency,
                isLoading,
                permissions,
                signIn,
                signUp,
                signOut,
                hasAgency: !!(user?.agence_id || agency),
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
