"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchTrpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { jobTypeEnum, experienceLevelEnum } from "@/lib/enums";
import { useRouter } from "next/navigation"; // For navigation

// Define the Zod schema based on NewJob and backend validation
// Match this with createJobInputSchema from backend/src/models/job.models.ts
const createJobFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
    jobType: z.enum(jobTypeEnum.enumValues).optional(),
    experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
    minimumWeeklyHourCommitment: z.coerce.number().int().positive().optional(),
    companyId: z.string().uuid("Invalid company ID"),
});

type CreateJobFormValues = z.infer<typeof createJobFormSchema>;

interface CreateJobPageProps {
    params: { companyId: string };
}

export default function CreateJobPage({ params }: CreateJobPageProps) {
    const { companyId } = params;
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateJobFormValues>({
        resolver: zodResolver(createJobFormSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            salaryMin: undefined,
            salaryMax: undefined,
            jobType: undefined,
            experienceLevel: undefined,
            minimumWeeklyHourCommitment: undefined,
            companyId: companyId,
        },
    });

    useEffect(() => {
        if (companyId) {
            form.setValue("companyId", companyId);
        }
        // Reset form if companyId changes (e.g. navigating between different company create job pages directly)
        // Or simply rely on defaultValues for initial load.
        // For simplicity, let's ensure companyId is set if it changes.
        // No need to reset the entire form on companyId change if other fields should persist during such navigation (though unlikely scenario)
    }, [companyId, form]);

    const onSubmit: SubmitHandler<CreateJobFormValues> = async (data) => {
        if (!companyId) {
            toast.error("Company ID is missing. Cannot create job.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...data, companyId };
            console.log("Submitting job creation payload:", payload);

            await fetchTrpc("job.create", payload);

            toast.success("Job posting created successfully.");
            form.reset();
            // Navigate to a relevant page, e.g., company dashboard or job list
            router.push(`/dashboard/company`); // Adjust this URL as needed
        } catch (error: any) {
            console.error("Failed to create job:", error);
            toast.error(error.message || "An unexpected error occurred.", {
                description: "Error creating job",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto p-4 md:p-8 max-w-2xl">
            <div className="space-y-2 mb-6">
                <h1 className="text-3xl font-bold">Post a New Job</h1>
                <p className="text-muted-foreground">
                    Fill in the details below to publish a new job listing for
                    your company.
                </p>
            </div>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 p-6 border rounded-lg shadow-sm bg-card"
            >
                <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                        id="title"
                        {...form.register("title")}
                        placeholder="e.g., Software Engineer"
                        className="mt-1"
                    />
                    {form.formState.errors.title && (
                        <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.title.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe the role, responsibilities, and requirements..."
                        className="mt-1 min-h-[100px]"
                    />
                    {form.formState.errors.description && (
                        <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.description.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        {...form.register("location")}
                        placeholder="e.g., San Francisco, CA or Remote"
                        className="mt-1"
                    />
                    {form.formState.errors.location && (
                        <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.location.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="salaryMin">
                            Minimum Salary (Optional)
                        </Label>
                        <Input
                            id="salaryMin"
                            type="number"
                            {...form.register("salaryMin")}
                            placeholder="e.g., 70000"
                            className="mt-1"
                        />
                        {form.formState.errors.salaryMin && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.salaryMin.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="salaryMax">
                            Maximum Salary (Optional)
                        </Label>
                        <Input
                            id="salaryMax"
                            type="number"
                            {...form.register("salaryMax")}
                            placeholder="e.g., 100000"
                            className="mt-1"
                        />
                        {form.formState.errors.salaryMax && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.salaryMax.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="jobType">Job Type (Optional)</Label>
                        <Select
                            onValueChange={(value) =>
                                form.setValue("jobType", value as any)
                            }
                            defaultValue={form.getValues("jobType")}
                        >
                            <SelectTrigger id="jobType" className="mt-1">
                                <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                                {jobTypeEnum.enumValues.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.jobType && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.jobType.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="experienceLevel">
                            Experience Level (Optional)
                        </Label>
                        <Select
                            onValueChange={(value) =>
                                form.setValue("experienceLevel", value as any)
                            }
                            defaultValue={form.getValues("experienceLevel")}
                        >
                            <SelectTrigger
                                id="experienceLevel"
                                className="mt-1"
                            >
                                <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                                {experienceLevelEnum.enumValues.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.experienceLevel && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.experienceLevel.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="minimumWeeklyHourCommitment">
                        Minimum Weekly Hours (Optional)
                    </Label>
                    <Input
                        id="minimumWeeklyHourCommitment"
                        type="number"
                        {...form.register("minimumWeeklyHourCommitment")}
                        placeholder="e.g., 20"
                        className="mt-1"
                    />
                    {form.formState.errors.minimumWeeklyHourCommitment && (
                        <p className="text-sm text-red-500 mt-1">
                            {
                                form.formState.errors
                                    .minimumWeeklyHourCommitment.message
                            }
                        </p>
                    )}
                </div>

                {/* companyId is hidden and set via props/URL params */}
                <input type="hidden" {...form.register("companyId")} />

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()} // Navigate back or to a specific cancel page
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Post Job"}
                    </Button>
                </div>
            </form>
        </main>
    );
}

// Ensure you have a way to share/define these enums, e.g., in @/lib/enums.ts
// For example:
// export const jobTypeEnum = { name: "job_type", enumValues: ["REMOTE", "ONSITE", "HYBRID"] as const };
// export const experienceLevelEnum = { name: "experience_level", enumValues: ["ENTRY", "MID", "SENIOR", "LEAD"] as const };
// The above lines are for informational purposes and should be in @/lib/enums.ts
