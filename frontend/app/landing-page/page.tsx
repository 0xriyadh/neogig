import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero section */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                        Find Your Perfect Career Match
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Connect with top companies and talented job seekers on
                        our advanced job matching platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Button asChild size="lg" className="text-base">
                            <Link href="/auth/signup">Create Account</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="text-base"
                        >
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="bg-muted py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-card rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary h-6 w-6"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                                Create Your Profile
                            </h3>
                            <p className="text-muted-foreground">
                                Sign up and create a detailed profile showcasing
                                your skills and experience.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary h-6 w-6"
                                >
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line
                                        x1="12"
                                        y1="22.08"
                                        x2="12"
                                        y2="12"
                                    ></line>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                                Discover Opportunities
                            </h3>
                            <p className="text-muted-foreground">
                                Explore job listings from top companies that
                                match your skills and preferences.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-primary h-6 w-6"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                                Apply and Connect
                            </h3>
                            <p className="text-muted-foreground">
                                Apply for positions with a single click and
                                connect directly with employers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background py-8 border-t">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground">
                        © 2025 NeoGig. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
