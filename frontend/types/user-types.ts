export interface User {
    id: string;
    email: string;
    role: string;
    profileCompleted: boolean;
}

export interface JobSeekerProfile {
    name: string;
    address: string;
    gender: string;
    mobile: string;
    description: string;
    preferredJobType: "REMOTE" | "ONSITE" | "HYBRID";
    availableSchedule?: string;
    skills?: string;
    currentlyLookingForJob: boolean;
    openToUrgentJobs: boolean;
    lastMinuteAvailability: boolean;
}

export interface JobApplication {
    id: string;
    status: "PENDING" | "REVIEWED" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "WITHDRAWN";
    appliedAt: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
}

export interface SavedJob {
    id: string;
    savedAt: string;
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
    };
}

export interface JobSeeker extends User {
    profile: JobSeekerProfile;
    applications: JobApplication[];
    savedJobs: SavedJob[];
}

export interface Company extends User {
    name: string;
    location: string;
    phone: string;
    industry: string;
    description: string;
    registrationDate: string;
}
