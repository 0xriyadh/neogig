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
    CardFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the company schema based on backend requirements
const companySchema = z.object({
    location: z.string().optional(),
    phone: z.string().optional(),
    industry: z.enum(
        ["TECH", "AGRI", "HEALTH", "FINANCE", "EDUCATION", "OTHER"],
        {
            required_error: "Please select your industry",
        }
    ),
    description: z
        .string()
        .min(1, { message: "Company description is required" }),
    registrationDate: z.string().optional(),
});

type CompanyValues = z.infer<typeof companySchema>;

export default function CompanyOnboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    const form = useForm<CompanyValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            location: "",
            phone: "",
            industry: "TECH",
            description: "",
            registrationDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        },
    });

    async function onSubmit(data: CompanyValues) {
        setIsLoading(true);
        setError(null);

        try {
            // Get the user ID from local storage or cookies
            const userId = "user-id"; // Replace with actual user ID retrieval

            // Use the fetchTrpc helper to call the create company mutation
            await fetchTrpc("company.create", {
                userId,
                ...data,
            });

            // Redirect to the dashboard
            router.push("/dashboard/company");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Complete your company profile
                    </CardTitle>
                    <CardDescription>
                        Tell us more about your company to attract the right
                        talent
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="step1"
                        value={`step${step}`}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger
                                value="step1"
                                onClick={() => setStep(1)}
                                disabled={isLoading}
                            >
                                Company Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="step2"
                                onClick={() => setStep(2)}
                                disabled={isLoading}
                            >
                                Description
                            </TabsTrigger>
                            <TabsTrigger
                                value="step3"
                                onClick={() => setStep(3)}
                                disabled={isLoading}
                            >
                                Review
                            </TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <TabsContent value="step1">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Company Location
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="123 Business St, City, Country"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Company Phone
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+1 (555) 000-0000"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="industry"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Industry
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select your industry" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="TECH">
                                                                Technology
                                                            </SelectItem>
                                                            <SelectItem value="AGRI">
                                                                Agriculture
                                                            </SelectItem>
                                                            <SelectItem value="HEALTH">
                                                                Healthcare
                                                            </SelectItem>
                                                            <SelectItem value="FINANCE">
                                                                Finance
                                                            </SelectItem>
                                                            <SelectItem value="EDUCATION">
                                                                Education
                                                            </SelectItem>
                                                            <SelectItem value="OTHER">
                                                                Other
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="registrationDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Registration Date
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="button"
                                            className="w-full"
                                            onClick={() => setStep(2)}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="step2">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Company Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your company's mission, values, and what makes it a great place to work..."
                                                            className="min-h-[200px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setStep(1)}
                                                className="flex-1"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="flex-1"
                                            >
                                                Continue
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="step3">
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-muted p-4">
                                            <h3 className="font-medium mb-2">
                                                Company Profile Summary
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Location:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "location"
                                                        ) || "Not provided"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Phone:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "phone"
                                                        ) || "Not provided"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Industry:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "industry"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Registration Date:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "registrationDate"
                                                        )}
                                                    </span>
                                                </div>
                                                {form.getValues(
                                                    "description"
                                                ) && (
                                                    <div className="mt-2">
                                                        <span className="text-muted-foreground">
                                                            Company Description:
                                                        </span>
                                                        <p className="mt-1">
                                                            {form.getValues(
                                                                "description"
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {error && (
                                            <p className="text-sm font-medium text-destructive">
                                                {error}
                                            </p>
                                        )}

                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setStep(2)}
                                                className="flex-1"
                                                disabled={isLoading}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Completing Setup..."
                                                    : "Complete Setup"}
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </form>
                        </Form>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
