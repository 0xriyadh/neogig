"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { jobContractTypeEnum, jobTypeEnum } from "@/lib/enums";

const experienceLevels = [
    { id: "entry", label: "Entry Level" },
    { id: "mid", label: "Mid Level" },
    { id: "senior", label: "Senior Level" },
    { id: "lead", label: "Lead" },
];

export function JobFilters() {
    const [selectedJobTypes, setSelectedJobTypes] = useQueryState("jobTypes", {
        defaultValue: [],
        parse: (value) => value.split(",").filter(Boolean),
        serialize: (value) => value.join(","),
    });

    const [location, setLocation] = useQueryState("location", {
        defaultValue: "",
    });

    const [selectedJobContractType, setSelectedJobContractType] = useQueryState(
        "jobContractType",
        {
            defaultValue: "",
        }
    );

    const [showUrgentOnly, setShowUrgentOnly] = useQueryState("urgent", {
        defaultValue: false,
        parse: (value) => value === "true",
        serialize: (value) => value.toString(),
    });

    const [experienceLevel, setExperienceLevel] = useQueryState("experience", {
        defaultValue: "",
    });

    const [salaryRange, setSalaryRange] = useQueryState("salary", {
        defaultValue: { min: 0, max: 100000 },
        parse: (value) => {
            const [min, max] = value.split("-").map(Number);
            return { min, max };
        },
        serialize: (value) => `${value.min}-${value.max}`,
    });

    const [openSkills, setOpenSkills] = useState(false);

    const handleJobTypeChange = useCallback(
        (typeId: string, checked: boolean) => {
            setSelectedJobTypes((prev) => {
                if (checked) {
                    return [...prev, typeId];
                }
                return prev.filter((id) => id !== typeId);
            });
        },
        [setSelectedJobTypes]
    );

    const handleSalaryChange = useCallback(
        (value: number[]) => {
            setSalaryRange({ min: value[0], max: value[1] });
        },
        [setSalaryRange]
    );

    const handleMinSalaryChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const min = Number(e.target.value);
            setSalaryRange((prev) => ({ ...prev, min }));
        },
        [setSalaryRange]
    );

    const handleMaxSalaryChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const max = Number(e.target.value);
            setSalaryRange((prev) => ({ ...prev, max }));
        },
        [setSalaryRange]
    );

    const resetFilters = useCallback(() => {
        setSelectedJobTypes([]);
        setExperienceLevel("");
        setSalaryRange({ min: 0, max: 100000 });
        setLocation("");
        setSelectedJobContractType("");
        setShowUrgentOnly(false);
    }, [
        setSelectedJobTypes,
        setExperienceLevel,
        setSalaryRange,
        setLocation,
        setSelectedJobContractType,
        setShowUrgentOnly,
    ]);

    return (
        <Card className="p-4">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <p className="text-sm text-muted-foreground">
                        Filter jobs based on your preferences
                    </p>
                </div>

                <Separator />

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetFilters}
                >
                    Reset Filters
                </Button>

                <Separator />

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="Enter city, state, or remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Work Contract Type</Label>
                        <RadioGroup
                            value={selectedJobContractType}
                            onValueChange={setSelectedJobContractType}
                        >
                            {jobContractTypeEnum.map((type) => (
                                <div
                                    key={type}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem value={type} id={type} />
                                    <Label htmlFor={type}>{type}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Job Type</Label>
                        <div className="space-y-2">
                            {jobTypeEnum.map((type) => (
                                <div
                                    key={type}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={type}
                                        checked={selectedJobTypes.includes(
                                            type
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleJobTypeChange(
                                                type,
                                                checked as boolean
                                            )
                                        }
                                    />
                                    <Label htmlFor={type}>{type}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <RadioGroup
                            value={experienceLevel}
                            onValueChange={setExperienceLevel}
                        >
                            {experienceLevels.map((level) => (
                                <div
                                    key={level.id}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem
                                        value={level.id}
                                        id={level.id}
                                    />
                                    <Label htmlFor={level.id}>
                                        {level.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Salary Range (in thousands)</Label>
                        <Slider
                            value={[salaryRange.min, salaryRange.max]}
                            onValueChange={handleSalaryChange}
                            max={100000}
                            step={10}
                            className="py-4"
                        />
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                className="h-8"
                                value={salaryRange.min}
                                onChange={handleMinSalaryChange}
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                className="h-8"
                                value={salaryRange.max}
                                onChange={handleMaxSalaryChange}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="urgent-jobs"
                            checked={showUrgentOnly}
                            onCheckedChange={setShowUrgentOnly}
                        />
                        <Label htmlFor="urgent-jobs">
                            Show urgent jobs only
                        </Label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
