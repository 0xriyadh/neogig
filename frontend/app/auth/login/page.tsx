"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { fetchTrpc } from "@/lib/trpc";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginValues) {
        setIsLoading(true);
        setError(null);

        try {
            console.log("Submitting login data:", data);
            // Call the login API using the fetchTrpc helper
            const response = await fetchTrpc<{ user: any; token: string }>(
                "auth.login",
                data
            );
            console.log("Login response:", response);

            // Store token in localStorage or httpOnly cookie (handled by the API)
            if (response && response.token) {
                localStorage.setItem("auth_token", response.token);
            }

            // Redirect to dashboard based on user role
            if (response?.user?.role === "applicant") {
                router.push("/dashboard/jobseeker");
            } else {
                router.push("/dashboard/company");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            const errorMessage = err.message || "Invalid email or password";
            setError(errorMessage);

            // If we get a 405 error, display a more helpful message
            if (errorMessage.includes("405")) {
                setError(
                    "The server rejected the login request. Please check API configuration."
                );
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout showSignup={false}>
            <Card className="border-none shadow-none p-8">
                <CardHeader className="space-y-1 px-0">
                    <CardTitle className="text-2xl font-bold">
                        Welcome back
                    </CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="name@example.com"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <p className="text-sm font-medium text-destructive">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
