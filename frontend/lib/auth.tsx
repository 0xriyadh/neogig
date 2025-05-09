"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchTrpc } from "./trpc";
import { User } from "@/types/user-types";

// Define the expected response type from the login API call
type LoginResponse = {
    user: NonNullable<User>; // User should not be null upon successful login
    token: string;
};

type AuthContextType = {
    user: User;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
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
            // Actual API call with type assertion
            const response = await fetchTrpc<LoginResponse>("auth.login", {
                email,
                password,
            });

            // Assuming the response contains the user and token
            const { user: apiUser, token } = response;

            // Store auth token and user data
            localStorage.setItem("authToken", token);
            localStorage.setItem("userData", JSON.stringify(apiUser));

            setUser(apiUser);
            console.log("sdfgsffs", apiUser);

            // Redirect based on user role
            if (apiUser.role === "jobseeker") {
                router.push("/dashboard/jobseeker");
            } else if (apiUser.role === "company") {
                router.push("/dashboard/company");
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
                user: user as User,
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
