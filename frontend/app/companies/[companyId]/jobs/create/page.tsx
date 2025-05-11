"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const commonSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
];

// Define the Zod schema based on NewJob and backend validation
const createJobFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
    jobType: z.enum(jobTypeEnum.enumValues).optional(),
    jobCategory: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE"]),
    experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
    minimumWeeklyHourCommitment: z.coerce.number().int().positive().optional(),
    requiredSkills: z.array(z.string()).optional(),
    isUrgent: z.boolean(),
    companyId: z.string().uuid("Invalid company ID"),
}).refine(
    (data) => !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin,
    {
        message: "Maximum salary must be greater than or equal to minimum salary",
        path: ["salaryMax"],
    }
);

type CreateJobFormValues = z.infer<typeof createJobFormSchema>;

interface CreateJobPageProps {
    params: { companyId: string };
}

export default function CreateJobPage({ params }: CreateJobPageProps) {
    const { companyId } = params;
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openSkills, setOpenSkills] = useState(false);

    const form = useForm<CreateJobFormValues>({
        resolver: zodResolver(createJobFormSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            salaryMin: undefined,
            salaryMax: undefined,
            jobType: undefined,
            jobCategory: "FULL_TIME",
            experienceLevel: undefined,
            minimumWeeklyHourCommitment: undefined,
            requiredSkills: [],
            isUrgent: false,
            companyId: companyId,
        },
    });

    const onSubmit = async (data: CreateJobFormValues) => {
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
            router.push(`/dashboard/company`);
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
                    Fill in the details below to publish a new job listing for your company.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., San Francisco, CA or Remote" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="salaryMin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Salary (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 70000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="salaryMax"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Salary (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 100000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="jobCategory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                            <SelectItem value="FREELANCE">Freelance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jobType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Work Type (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select work type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {jobTypeEnum.enumValues.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience Level (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select experience level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {experienceLevelEnum.enumValues.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="minimumWeeklyHourCommitment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Weekly Hours (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 20" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requiredSkills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Required Skills</FormLabel>
                                <Popover open={openSkills} onOpenChange={setOpenSkills}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openSkills}
                                                className="w-full justify-between"
                                            >
                                                {(field.value?.length ?? 0) > 0
                                                    ? `${field.value?.length} skills selected`
                                                    : "Select skills..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search skills..." />
                                            <CommandEmpty>No skills found.</CommandEmpty>
                                            <CommandGroup>
                                                {commonSkills.map((skill) => (
                                                    <CommandItem
                                                        key={skill}
                                                        onSelect={() => {
                                                            const currentSkills = field.value ?? [];
                                                            const newSkills = currentSkills.includes(skill)
                                                                ? currentSkills.filter((s) => s !== skill)
                                                                : [...currentSkills, skill];
                                                            field.onChange(newSkills);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value?.includes(skill)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {skill}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {(field.value?.length ?? 0) > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {field.value?.map((skill) => (
                                            <div
                                                key={skill}
                                                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm cursor-pointer"
                                                onClick={() => {
                                                    field.onChange(
                                                        field.value?.filter((s) => s !== skill) ?? []
                                                    );
                                                }}
                                            >
                                                {skill} ×
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isUrgent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Urgent Hiring</FormLabel>
                                    <FormDescription>
                                        Mark this job as urgent to highlight it in search results
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <input type="hidden" {...form.register("companyId")} />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Post Job"}
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    );
}

// Ensure you have a way to share/define these enums, e.g., in @/lib/enums.ts
// For example:
// export const jobTypeEnum = { name: "job_type", enumValues: ["REMOTE", "ONSITE", "HYBRID"] as const };
// export const experienceLevelEnum = { name: "experience_level", enumValues: ["ENTRY", "MID", "SENIOR", "LEAD"] as const };
// The above lines are for informational purposes and should be in @/lib/enums.ts
