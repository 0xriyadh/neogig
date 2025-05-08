"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { fetchTrpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";

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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the job seeker schema based on backend requirements
const jobSeekerSchema = z.object({
    address: z.string().optional(),
    gender: z.string().optional(),
    mobile: z.string().optional(),
    description: z.string().optional(),
    preferredJobType: z.enum(["REMOTE", "ONSITE", "HYBRID"], {
        required_error: "Please select your preferred job type",
    }),
    currentlyLookingForJob: z.boolean(),
});

type JobSeekerValues = z.infer<typeof jobSeekerSchema>;

export function JobSeekerOnboarding() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    const form = useForm<JobSeekerValues>({
        resolver: zodResolver(jobSeekerSchema),
        defaultValues: {
            address: "",
            gender: "",
            mobile: "",
            description: "",
            preferredJobType: "REMOTE",
            currentlyLookingForJob: true,
        },
    });

    async function onSubmit(data: JobSeekerValues) {
        setIsLoading(true);
        setError(null);

        try {
            // Get the user ID from auth context
            const userId = user?.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Use the fetchTrpc helper to call the create job seeker mutation
            await fetchTrpc("jobSeeker.create", {
                userId,
                ...data,
            });

            // Redirect to the dashboard
            router.push("/dashboard/jobseeker");
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
                        Complete your profile
                    </CardTitle>
                    <CardDescription>
                        Tell us more about yourself to help find the perfect job
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
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="step2"
                                onClick={() => setStep(2)}
                                disabled={isLoading}
                            >
                                Preferences
                            </TabsTrigger>
                            <TabsTrigger
                                value="step3"
                                onClick={() => setStep(3)}
                                disabled={isLoading}
                            >
                                Summary
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
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="123 Main St, City, Country"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Gender
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
                                                                <SelectValue placeholder="Select your gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">
                                                                Male
                                                            </SelectItem>
                                                            <SelectItem value="female">
                                                                Female
                                                            </SelectItem>
                                                            <SelectItem value="non-binary">
                                                                Non-binary
                                                            </SelectItem>
                                                            <SelectItem value="prefer-not-to-say">
                                                                Prefer not to
                                                                say
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Mobile Number
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
                                            name="preferredJobType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Preferred Job Type
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
                                                                <SelectValue placeholder="Select job type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="REMOTE">
                                                                Remote
                                                            </SelectItem>
                                                            <SelectItem value="ONSITE">
                                                                On-site
                                                            </SelectItem>
                                                            <SelectItem value="HYBRID">
                                                                Hybrid
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Professional Summary
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Briefly describe your skills, experience, and career goals..."
                                                            className="min-h-[120px]"
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
                                                Profile Summary
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Address:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "address"
                                                        ) || "Not provided"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Gender:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "gender"
                                                        ) || "Not provided"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Mobile:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "mobile"
                                                        ) || "Not provided"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="text-muted-foreground">
                                                        Preferred Job Type:
                                                    </span>
                                                    <span>
                                                        {form.getValues(
                                                            "preferredJobType"
                                                        )}
                                                    </span>
                                                </div>
                                                {form.getValues(
                                                    "description"
                                                ) && (
                                                    <div className="mt-2">
                                                        <span className="text-muted-foreground">
                                                            Professional
                                                            Summary:
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

                                        <div className="flex justify-between">
                                            {step > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setStep(step - 1)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    Previous
                                                </Button>
                                            )}
                                            {step < 3 ? (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setStep(step + 1)
                                                    }
                                                    disabled={isLoading}
                                                    className={
                                                        step > 1
                                                            ? "ml-auto"
                                                            : ""
                                                    }
                                                >
                                                    Next
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="ml-auto"
                                                >
                                                    {isLoading
                                                        ? "Saving..."
                                                        : "Complete Profile"}
                                                </Button>
                                            )}
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
