"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    name: string;
    email: string;
    role: "jobseeker" | "employer" | "admin";
} | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // For now, check local storage for a token
                // In a real app, you'd verify the token with your backend
                const token = localStorage.getItem("authToken");
                if (token) {
                    // Mock user data - replace with actual API call to get user data
                    const userData = JSON.parse(
                        localStorage.getItem("userData") || "null"
                    );
                    setUser(userData);
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            // Mock login - replace with actual API call
            // const response = await fetchTrpc("auth.login", { email, password });

            // Mock successful login
            const mockUser = {
                id: "user-123",
                name: "Jane Doe",
                email: email,
                role: "jobseeker" as const,
            };

            // Store auth token and user data
            localStorage.setItem("authToken", "mock-jwt-token");
            localStorage.setItem("userData", JSON.stringify(mockUser));

            setUser(mockUser);

            // Redirect based on user role
            if (mockUser.role === "jobseeker") {
                router.push("/dashboard/jobseeker");
            } else if (mockUser.role === "employer") {
                router.push("/dashboard/employer");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setUser(null);
        router.push("/auth/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
