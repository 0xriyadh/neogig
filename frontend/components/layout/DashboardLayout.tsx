"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react"; // Assuming you might want a user icon later
import { useAuth } from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { logout } = useAuth();
    const { currentUser } = useCurrentUser();

    const handleLogout = () => {
        logout();
        
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-background border-b sticky top-0 z-50">
                <div className="container mx-auto h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        NeoGig
                    </Link>
                    <nav className="flex items-center gap-4">
                        {!currentUser ? (
                            <Link href="/auth/login">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Login
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="cursor-pointer"
                            >
                                Logout
                            </Button>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-grow container mx-auto py-2">{children}</main>
            <footer className="bg-background border-t">
                <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} NeoGig. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
