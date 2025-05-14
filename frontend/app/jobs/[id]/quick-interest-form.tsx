"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
    start: string;
    end: string;
}

interface AvailableSchedule {
    [key: string]: TimeSlot;
}

interface QuickInterestFormProps {
    jobId: string;
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

export function QuickInterestForm({ jobId }: QuickInterestFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");
    const [availableDays, setAvailableDays] = useState<AvailableSchedule>({
        saturday: { start: "09:00", end: "17:00" },
        sunday: { start: "09:00", end: "17:00" },
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
    });
    const [enabledDays, setEnabledDays] = useState<Record<string, boolean>>({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
    });
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [openSkills, setOpenSkills] = useState(false);
    const router = useRouter();
    const utils = trpc.useUtils();

    const submitInterest = trpc.application.submitInterest.useMutation({
        onSuccess: () => {
            toast.success("Interest Submitted");
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const { data: applications, isLoading: isApplicationsLoading } =
        trpc.application.getByJobIdAndUserId.useQuery(
            { jobId: jobId },
            { enabled: !!jobId }
        );

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        // Filter out disabled days and format the schedule
        const filteredSchedule = Object.entries(availableDays).reduce(
            (acc, [day, schedule]) => {
                if (enabledDays[day]) {
                    acc[day] = schedule;
                }
                return acc;
            },
            {} as AvailableSchedule
        );

        try {
            await submitInterest.mutateAsync({
                jobId,
                coverLetter,
            });
            utils.application.getByJobId.invalidate();
            utils.user.getMe.invalidate();
            router.push("/dashboard/jobseeker");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleTimeChange = (
        day: string,
        type: "start" | "end",
        value: string
    ) => {
        setAvailableDays((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            },
        }));
    };

    const handleDayToggle = (day: string) => {
        setEnabledDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

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
        <Card>
            <CardHeader>
                <CardTitle>Quick Interest Form</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="coverLetter">
                                Write about yourself in 500 words and why you
                                want to join this company
                            </Label>
                            <Textarea
                                id="coverLetter"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="min-h-[200px]"
                                placeholder="Share your background, experiences, and why you're interested in this position..."
                                disabled={
                                    isSubmitting ||
                                    isApplicationsLoading ||
                                    (applications && applications?.length > 0)
                                }
                            />
                            <div className="flex justify-end">
                                <span
                                    className={`text-xs ${
                                        coverLetter.length > 2500
                                            ? "text-red-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {coverLetter.length}/2500 characters
                                </span>
                            </div>
                        </div>
                        <Label>Your Availability</Label>
                        <div className="space-y-4">
                            {Object.entries(availableDays).map(
                                ([day, schedule]) => (
                                    <div
                                        key={day}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={enabledDays[day]}
                                                onCheckedChange={() =>
                                                    handleDayToggle(day)
                                                }
                                                disabled={
                                                    isSubmitting ||
                                                    isApplicationsLoading ||
                                                    (applications &&
                                                        applications?.length >
                                                            0)
                                                }
                                            />
                                            <Label className="capitalize min-w-[100px]">
                                                {day}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={schedule.start}
                                                onValueChange={(value) =>
                                                    handleTimeChange(
                                                        day,
                                                        "start",
                                                        value
                                                    )
                                                }
                                                disabled={
                                                    !enabledDays[day] ||
                                                    isSubmitting ||
                                                    isApplicationsLoading ||
                                                    (applications &&
                                                        applications?.length >
                                                            0)
                                                }
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Start time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map((time) => (
                                                        <SelectItem
                                                            key={`${day}-start-${time}`}
                                                            value={time}
                                                        >
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span>to</span>
                                            <Select
                                                value={schedule.end}
                                                onValueChange={(value) =>
                                                    handleTimeChange(
                                                        day,
                                                        "end",
                                                        value
                                                    )
                                                }
                                                disabled={
                                                    !enabledDays[day] ||
                                                    isSubmitting ||
                                                    isApplicationsLoading ||
                                                    (applications &&
                                                        applications?.length >
                                                            0)
                                                }
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="End time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map((time) => (
                                                        <SelectItem
                                                            key={`${day}-end-${time}`}
                                                            value={time}
                                                        >
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            isApplicationsLoading ||
                            (applications && applications?.length > 0) ||
                            coverLetter.length > 2500
                        }
                    >
                        {isSubmitting ? "Submitting..." : "Submit Interest"}
                    </Button>
                </form>
                {applications && applications?.length > 0 && (
                    <span className="text-xs text-gray-500">
                        You have already applied for this job
                    </span>
                )}
            </CardContent>
        </Card>
    );
}
