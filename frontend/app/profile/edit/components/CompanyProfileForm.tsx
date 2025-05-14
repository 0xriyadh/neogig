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
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Company } from "@/types/user-types";
import { Switch } from "@/components/ui/switch";

const companyFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(5, "Address must be at least 5 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    contactEmail: z.string().email("Invalid email address"),
    industry: z.enum([
        "TECH",
        "AGRI",
        "HEALTH",
        "FINANCE",
        "EDUCATION",
        "OTHER",
    ]),
    companySize: z
        .string()
        .min(2, "Company size must be at least 2 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    registrationDate: z.string().min(4, "Registration date must be 4 digits"),
    activelyHiring: z.boolean(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyProfileFormProps {
    company: Company;
}

export default function CompanyProfileForm({
    company,
}: CompanyProfileFormProps) {
    const router = useRouter();
    const utils = trpc.useUtils();

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: company?.profile?.name || "",
            location: company?.profile?.location || "",
            phone: company?.profile?.phone || "",
            contactEmail: company?.profile?.contactEmail || "",
            industry:
                (company?.profile?.industry as
                    | "TECH"
                    | "AGRI"
                    | "HEALTH"
                    | "FINANCE"
                    | "EDUCATION"
                    | "OTHER") || "OTHER",
            companySize: company?.profile?.companySize || "",
            description: company?.profile?.description || "",
            website: company?.profile?.website || "",
            registrationDate: company?.profile?.registrationDate || "",
            activelyHiring: company?.profile?.activelyHiring ?? false,
        },
    });

    const { mutate: updateProfile, isPending: isUpdating } =
        trpc.company.update.useMutation({
            onSuccess: () => {
                toast.success("Company profile updated successfully");
                utils.user.getMe.invalidate();
                router.push("/dashboard/company");
            },
            onError: (error) => {
                toast.error(
                    error.message || "Failed to update company profile"
                );
            },
        });

    function onSubmit(data: CompanyFormValues) {
        updateProfile({
            userId: company.id,
            ...data,
        });
    }

    return (
        <>
            <div className="mb-8 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Edit Company Profile</h1>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" />
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
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="url"
                                        placeholder="https://example.com"
                                    />
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
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Tell us about your company..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Industry</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
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
                            name="companySize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Size</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select company size" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1-10">
                                                1-10 employees
                                            </SelectItem>
                                            <SelectItem value="11-50">
                                                11-50 employees
                                            </SelectItem>
                                            <SelectItem value="51-200">
                                                51-200 employees
                                            </SelectItem>
                                            <SelectItem value="201-500">
                                                201-500 employees
                                            </SelectItem>
                                            <SelectItem value="501-1000">
                                                501-1000 employees
                                            </SelectItem>
                                            <SelectItem value="1001+">
                                                1001+ employees
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="registrationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Founded Year</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="e.g. 2010"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="activelyHiring"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-full">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Actively Hiring
                                        </FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Are you currently looking to hire
                                            new talent?
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
                            {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
