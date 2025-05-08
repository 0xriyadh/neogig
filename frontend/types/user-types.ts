export interface User {
    id: string;
    email: string;
    role: string;
    profileCompleted: boolean;
}

export interface JobSeeker extends User {
    name: string;
    address: string;
    gender: string;
    mobile: string;
    description: string;
    preferredJobType: string;
    availableSchedule: string;
    currentlyLookingForJob: boolean;
}

export interface Company extends User {
    name: string;
    location: string;
    phone: string;
    industry: string;
    description: string;
    registrationDate: string;
}
