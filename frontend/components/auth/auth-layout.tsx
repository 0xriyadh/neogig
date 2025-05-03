"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
    children: React.ReactNode;
    showSignup?: boolean;
}

export function AuthLayout({ children, showSignup = true }: AuthLayoutProps) {
    const [mounted, setMounted] = useState(false);

    // Handle hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Left panel - Illustration/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md" />
                <div className="z-10 flex flex-col items-center justify-center space-y-8 px-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h1 className="text-4xl font-bold text-white">
                            NeoGig
                        </h1>
                        <p className="text-xl text-white/80">
                            Find your perfect career match
                        </p>
                    </div>
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex flex-col space-y-2 rounded-lg bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                            <p className="text-sm italic">
                                "NeoGig completely transformed our hiring
                                process. We found skilled developers within
                                days!"
                            </p>
                            <p className="text-xs font-medium">
                                — Sarah Chen, CTO at TechCorp
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2 rounded-lg bg-white/10 p-4 text-left text-white backdrop-blur-sm">
                            <p className="text-sm italic">
                                "I found my dream job through NeoGig after
                                searching for months on other platforms."
                            </p>
                            <p className="text-xs font-medium">
                                — James Rodriguez, Software Engineer
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel - Auth form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-background px-6">
                <div className="w-full max-w-md">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">NeoGig</span>
                        </Link>
                        {showSignup && (
                            <div className="text-sm">
                                {showSignup === true ? (
                                    <>
                                        Already have an account?{" "}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                            asChild
                                        >
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        Don't have an account?{" "}
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                            asChild
                                        >
                                            <Link href="/signup">Sign up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
