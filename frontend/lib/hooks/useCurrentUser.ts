import { trpc } from "@/lib/trpc";
import { JobSeeker, Company } from "@/types/user-types";
import { useAuth } from "@/lib/auth";

interface JobSeekerProfile {
    id: string;
    email: string;
    role: string;
    profileCompleted: boolean;
    profile: {
        name: string;
        address: string;
        gender: string;
        preferredJobType: string;
        description: string;
    };
    applications: {
        id: string;
        status: "PENDING" | "REVIEWED" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "WITHDRAWN";
        appliedAt: string;
        job: {
            id: string;
            title: string;
            company: string;
        };
    }[];
    savedJobs: {
        id: string;
        savedAt: string;
        job: {
            id: string;
            title: string;
            company: string;
            location: string;
        };
    }[];
}

export const useCurrentUser = () => {
    const { user } = useAuth();
    const query = trpc.user.getMe.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
    });

    return {
        ...query,
        currentUser:
            user?.role === "jobseeker"
                ? (query?.data as JobSeekerProfile | undefined)
                : (query?.data as Company | undefined),
        loading: query.isLoading,
    };
};
