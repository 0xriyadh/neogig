"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import {
    JobType,
    ExperienceLevel,
    JobContractType,
    Schedule,
    TimeSlot,
} from "@/types/job";
import { Switch } from "@/components/ui/switch";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

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

const allWeekDays = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
];

const jobFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    jobType: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
    probableSchedule: z
        .record(
            z.object({
                start: z.string(),
                end: z.string(),
            })
        )
        .optional(),
    jobContractType: z.enum(["PART_TIME", "CONTRACT"]),
    experienceLevel: z.enum(["ENTRY", "MID", "SENIOR"]).optional(),
    minimumWeeklyHourCommitment: z.number().optional(),
    requiredSkills: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isUrgent: z.boolean().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const utils = trpc.useUtils();
    const [openSkills, setOpenSkills] = useState(false);

    const jobId = params.id as string;

    const { data: jobData, isLoading: isLoadingJob } =
        trpc.job.getById.useQuery({ id: jobId }, { enabled: !!jobId });

    const defaultSchedule: Schedule = {
        saturday: { start: "09:00", end: "17:00" },
        sunday: { start: "09:00", end: "17:00" },
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
    };

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            salaryMin: 0,
            salaryMax: 0,
            jobType: "REMOTE" as JobType,
            probableSchedule: defaultSchedule,
            jobContractType: "PART_TIME" as JobContractType,
            experienceLevel: "ENTRY" as ExperienceLevel,
            minimumWeeklyHourCommitment: 0,
            requiredSkills: [],
            isActive: true,
            isUrgent: false,
        },
    });

    useEffect(() => {
        if (jobData) {
            form.reset({
                title: jobData.title || "",
                description: jobData.description || "",
                location: jobData.location || "",
                salaryMin: jobData.salaryMin || 0,
                salaryMax: jobData.salaryMax || 0,
                jobType: jobData.jobType || "REMOTE",
                probableSchedule: jobData.probableSchedule
                    ? Object(jobData.probableSchedule)
                    : defaultSchedule,
                jobContractType: jobData.jobContractType,
                experienceLevel: jobData.experienceLevel || "ENTRY",
                minimumWeeklyHourCommitment:
                    jobData.minimumWeeklyHourCommitment || 0,
                requiredSkills: jobData.requiredSkills || [],
                isActive: jobData.isActive ?? true,
                isUrgent: jobData.isUrgent ?? false,
            });
        }
    }, [jobData]);

    const { mutate: updateJob, isPending: isUpdating } =
        trpc.job.update.useMutation({
            onSuccess: () => {
                toast.success("Job updated successfully");
                utils.job.getById.invalidate({ id: jobId });
                utils.job.getByCompanyId.invalidate({ userId: user?.id });
                router.push(`/dashboard/company`);
            },
            onError: (error) => {
                toast.error(error.message || "Failed to update job");
            },
        });

    if (isLoadingJob) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-medium">
                    Job not found or you do not have permission to edit it.
                </p>
                <Button variant="link" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    // Authorization: Check if the current user is the owner of the company
    if (user?.id !== jobData.companyId) {
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <p className="text-lg font-medium">
                    Access Denied. You are not authorized to edit this job.
                </p>
                <Button
                    variant="link"
                    onClick={() => router.push("/dashboard/company")}
                >
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    function onSubmit(data: JobFormValues) {
        console.log(data);
        updateJob({
            id: jobId,
            ...data,
        });
    }

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                times.push(time);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-8 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Edit Job</h1>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
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
                                <FormLabel>Location (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                    <FormLabel>
                                        Minimum Salary (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || 0}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? 0
                                                        : parseFloat(
                                                              e.target.value
                                                          )
                                                )
                                            }
                                        />
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
                                    <FormLabel>
                                        Maximum Salary (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || 0}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? 0
                                                        : parseFloat(
                                                              e.target.value
                                                          )
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="jobType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
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
                        name="jobContractType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Contract Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select contract type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PART_TIME">
                                            Part-time
                                        </SelectItem>
                                        <SelectItem value="CONTRACT">
                                            Contract
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Experience Level (Optional)
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select experience level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ENTRY">
                                            Entry
                                        </SelectItem>
                                        <SelectItem value="MID">
                                            Mid-level
                                        </SelectItem>
                                        <SelectItem value="SENIOR">
                                            Senior
                                        </SelectItem>
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
                                <FormLabel>
                                    Minimum Weekly Hour Commitment (Optional)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? 0
                                                    : parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="probableSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Probable Schedule (Optional)
                                </FormLabel>
                                <div className="space-y-4">
                                    {allWeekDays.map((day) => {
                                        const currentDaySchedule =
                                            field.value?.[day];
                                        return (
                                            <div
                                                key={day}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={
                                                            !!currentDaySchedule
                                                        }
                                                        onCheckedChange={() => {
                                                            const newSchedule =
                                                                {
                                                                    ...(field.value ||
                                                                        {}),
                                                                };
                                                            if (
                                                                currentDaySchedule
                                                            ) {
                                                                delete newSchedule[
                                                                    day
                                                                ];
                                                            } else {
                                                                newSchedule[
                                                                    day
                                                                ] = {
                                                                    start: "09:00",
                                                                    end: "17:00",
                                                                };
                                                            }
                                                            field.onChange(
                                                                newSchedule
                                                            );
                                                        }}
                                                    />
                                                    <Label className="capitalize min-w-[100px]">
                                                        {day}
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={
                                                            currentDaySchedule?.start
                                                        }
                                                        disabled={
                                                            !currentDaySchedule
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            const newSchedule =
                                                                {
                                                                    ...(field.value ||
                                                                        {}),
                                                                };
                                                            newSchedule[day] = {
                                                                ...(currentDaySchedule as TimeSlot),
                                                                start: value,
                                                            };
                                                            field.onChange(
                                                                newSchedule
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue placeholder="Start time" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {timeOptions.map(
                                                                (time) => (
                                                                    <SelectItem
                                                                        key={`${day}-start-${time}`}
                                                                        value={
                                                                            time
                                                                        }
                                                                    >
                                                                        {time}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <span>to</span>
                                                    <Select
                                                        value={
                                                            currentDaySchedule?.end
                                                        }
                                                        disabled={
                                                            !currentDaySchedule
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            const newSchedule =
                                                                {
                                                                    ...(field.value ||
                                                                        {}),
                                                                };
                                                            newSchedule[day] = {
                                                                ...(currentDaySchedule as TimeSlot),
                                                                end: value,
                                                            };
                                                            field.onChange(
                                                                newSchedule
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue placeholder="End time" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {timeOptions.map(
                                                                (time) => (
                                                                    <SelectItem
                                                                        key={`${day}-end-${time}`}
                                                                        value={
                                                                            time
                                                                        }
                                                                    >
                                                                        {time}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requiredSkills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Required Skills (Optional)
                                </FormLabel>
                                <Popover
                                    open={openSkills}
                                    onOpenChange={setOpenSkills}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openSkills}
                                            className="w-full justify-between"
                                        >
                                            {(field.value?.length || 0) > 0
                                                ? `${field.value?.length} skills selected`
                                                : "Select skills..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search skills..." />
                                            <CommandEmpty>
                                                No skills found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {commonSkills.map((skill) => (
                                                    <CommandItem
                                                        key={skill}
                                                        onSelect={() => {
                                                            const currentSkills =
                                                                field.value ||
                                                                [];
                                                            const newSkills =
                                                                currentSkills.includes(
                                                                    skill
                                                                )
                                                                    ? currentSkills.filter(
                                                                          (s) =>
                                                                              s !==
                                                                              skill
                                                                      )
                                                                    : [
                                                                          ...currentSkills,
                                                                          skill,
                                                                      ];
                                                            field.onChange(
                                                                newSkills
                                                            );
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (
                                                                    field.value ||
                                                                    []
                                                                ).includes(
                                                                    skill
                                                                )
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
                                {(field.value?.length || 0) > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(field.value || []).map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    field.onChange(
                                                        (
                                                            field.value || []
                                                        ).filter(
                                                            (s) => s !== skill
                                                        )
                                                    );
                                                }}
                                            >
                                                {skill} ×
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="text-lg font-medium">Job Status</h3>
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Is this job currently active and
                                            accepting applications?
                                        </p>
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
                        <FormField
                            control={form.control}
                            name="isUrgent"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Urgent</FormLabel>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Is this an urgent hiring need?
                                        </p>
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
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
