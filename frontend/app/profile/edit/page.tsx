"use client";

import { useRouter } from "next/navigation";
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
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { JobSeeker } from "@/types/user-types";
import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TimeSlot {
    start: string;
    end: string;
}

interface AvailableSchedule {
    [key: string]: TimeSlot;
}

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

const profileFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    preferredJobType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
    availableSchedule: z.record(z.object({
        start: z.string(),
        end: z.string()
    })),
    skills: z.array(z.string()),
    currentlyLookingForJob: z.boolean(),
    openToUrgentJobs: z.boolean(),
    lastMinuteAvailability: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
    const router = useRouter();
    const { currentUser, loading: isLoadingUser } = useCurrentUser();
    const utils = trpc.useUtils();
    const [openSkills, setOpenSkills] = useState(false);

    const jobSeeker = currentUser?.role === "jobseeker" ? (currentUser as JobSeeker) : null;

    const defaultSchedule: AvailableSchedule = {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
    };

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: jobSeeker?.profile?.name || "",
            address: jobSeeker?.profile?.address || "",
            gender: (jobSeeker?.profile?.gender as "MALE" | "FEMALE" | "OTHER") || "OTHER",
            mobile: jobSeeker?.profile?.mobile || "",
            description: jobSeeker?.profile?.description || "",
            preferredJobType: (jobSeeker?.profile?.preferredJobType as "REMOTE" | "ONSITE" | "HYBRID") || "REMOTE",
            availableSchedule: jobSeeker?.profile?.availableSchedule ? JSON.parse(jobSeeker.profile.availableSchedule) : defaultSchedule,
            skills: jobSeeker?.profile?.skills ? jobSeeker.profile.skills.split(", ") : [],
            currentlyLookingForJob: jobSeeker?.profile?.currentlyLookingForJob ?? true,
            openToUrgentJobs: jobSeeker?.profile?.openToUrgentJobs ?? false,
            lastMinuteAvailability: jobSeeker?.profile?.lastMinuteAvailability ?? false,
        },
    });

    const { mutate: updateProfile, isPending: isUpdating } = trpc.user.updateJobSeekerProfile.useMutation({
        onSuccess: () => {
            toast.success("Profile updated successfully");
            utils.user.getMe.invalidate();
            router.push("/dashboard/jobseeker");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile");
        },
    });

    if (isLoadingUser) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!jobSeeker) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg font-medium">Access denied. Only jobseekers can edit their profile.</p>
            </div>
        );
    }

    function onSubmit(data: ProfileFormValues) {
        if (!jobSeeker) return;
        
        updateProfile({
            id: jobSeeker.id,
            profile: {
                ...data,
                availableSchedule: JSON.stringify(data.availableSchedule),
                skills: data.skills.join(", "),
            },
        });
    }

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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
                <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
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
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl>
                                    <Input {...field} type="tel" />
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
                        name="preferredJobType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Job Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select job type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="REMOTE">Remote</SelectItem>
                                        <SelectItem value="ONSITE">On-site</SelectItem>
                                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="availableSchedule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Available Schedule</FormLabel>
                                <div className="space-y-4">
                                    {Object.entries(field.value).map(([day, schedule]) => (
                                        <div key={day} className="flex items-center gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={true}
                                                    onCheckedChange={() => {
                                                        const newSchedule = { ...field.value };
                                                        if (newSchedule[day]) {
                                                            delete newSchedule[day];
                                                        } else {
                                                            newSchedule[day] = { start: "09:00", end: "17:00" };
                                                        }
                                                        field.onChange(newSchedule);
                                                    }}
                                                />
                                                <Label className="capitalize min-w-[100px]">{day}</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={schedule.start}
                                                    onValueChange={(value) => {
                                                        const newSchedule = { ...field.value };
                                                        newSchedule[day] = { ...schedule, start: value };
                                                        field.onChange(newSchedule);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Start time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeOptions.map((time) => (
                                                            <SelectItem key={`${day}-start-${time}`} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <span>to</span>
                                                <Select
                                                    value={schedule.end}
                                                    onValueChange={(value) => {
                                                        const newSchedule = { ...field.value };
                                                        newSchedule[day] = { ...schedule, end: value };
                                                        field.onChange(newSchedule);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="End time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeOptions.map((time) => (
                                                            <SelectItem key={`${day}-end-${time}`} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skills</FormLabel>
                                <Popover open={openSkills} onOpenChange={setOpenSkills}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openSkills}
                                            className="w-full justify-between"
                                        >
                                            {field.value.length > 0
                                                ? `${field.value.length} skills selected`
                                                : "Select skills..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
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
                                                            const newSkills = field.value.includes(skill)
                                                                ? field.value.filter((s) => s !== skill)
                                                                : [...field.value, skill];
                                                            field.onChange(newSkills);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value.includes(skill) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {skill}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {field.value.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {field.value.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    field.onChange(field.value.filter((s) => s !== skill));
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

                    <FormField
                        control={form.control}
                        name="currentlyLookingForJob"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currently Looking for Job</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    defaultValue={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="text-lg font-medium">Job Availability Preferences</h3>
                        
                        <FormField
                            control={form.control}
                            name="openToUrgentJobs"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Open to Urgent Jobs</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Indicate if you're available for urgent job opportunities
                                        </div>
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
                            name="lastMinuteAvailability"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Last-Minute Availability</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Indicate if you can take on last-minute job opportunities
                                        </div>
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
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 