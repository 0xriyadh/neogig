"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/auth/auth-layout";

// Define the signup schema based on backend requirements
const signupSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    role: z.enum(["applicant", "company"], {
        required_error: "Please select a user type",
    }),
    name: z.string().min(1, { message: "Name cannot be empty" }),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameLabel, setNameLabel] = useState("Name");

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "applicant",
            name: "",
        },
    });

    const selectedRole = form.watch("role");
    useEffect(() => {
        setNameLabel(selectedRole === "company" ? "Company Name" : "Full Name");
    }, [selectedRole]);

    async function onSubmit(data: SignupValues) {
        setIsLoading(true);
        setError(null);

        try {
            console.log("Submitting signup data:", data);
            // Use the fetchTrpc helper to call the signup mutation
            const response = await fetchTrpc("auth.signup", data);
            console.log("Signup response:", response);

            // Redirect to the onboarding page with the user role
            router.push(`/onboarding/${data.role}`);
        } catch (err: any) {
            console.error("Signup error:", err);
            const errorMessage =
                err.message || "An error occurred during signup";
            setError(errorMessage);

            // If we get a 405 error, display a more helpful message
            if (errorMessage.includes("405")) {
                setError(
                    "The server rejected the signup request. Please check API configuration."
                );
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout>
            <Card className="border-none shadow-none p-8">
                <CardHeader className="space-y-1 px-0">
                    <CardTitle className="text-2xl font-bold">
                        Create an account
                    </CardTitle>
                    <CardDescription>
                        Choose your account type to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Tabs defaultValue="applicant" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger
                                value="applicant"
                                onClick={() =>
                                    form.setValue("role", "applicant")
                                }
                            >
                                Job Seeker
                            </TabsTrigger>
                            <TabsTrigger
                                value="company"
                                onClick={() => form.setValue("role", "company")}
                            >
                                Company
                            </TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{nameLabel}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        selectedRole ===
                                                        "company"
                                                            ? "Your Company Inc."
                                                            : "John Doe"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                    {isLoading
                                        ? "Creating account..."
                                        : "Create account"}
                                </Button>
                            </form>
                        </Form>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
