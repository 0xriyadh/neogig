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
import { Loader2, ArrowLeft } from "lucide-react";
import { JobSeeker } from "@/types/user-types";
import { Switch } from "@/components/ui/switch";

const profileFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    preferredJobType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
    availableSchedule: z.string(),
    currentlyLookingForJob: z.boolean(),
    openToUrgentJobs: z.boolean(),
    lastMinuteAvailability: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
    const router = useRouter();
    const { currentUser, loading: isLoadingUser } = useCurrentUser();
    const utils = trpc.useUtils();

    const jobSeeker = currentUser?.role === "jobseeker" ? (currentUser as JobSeeker) : null;

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: jobSeeker?.profile?.name || "",
            address: jobSeeker?.profile?.address || "",
            gender: (jobSeeker?.profile?.gender as "MALE" | "FEMALE" | "OTHER") || "OTHER",
            mobile: jobSeeker?.profile?.mobile || "",
            description: jobSeeker?.profile?.description || "",
            preferredJobType: (jobSeeker?.profile?.preferredJobType as "REMOTE" | "ONSITE" | "HYBRID") || "REMOTE",
            availableSchedule: jobSeeker?.profile?.availableSchedule || "",
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
            },
        });
    }

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
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Monday-Friday, 9 AM - 5 PM" />
                                </FormControl>
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