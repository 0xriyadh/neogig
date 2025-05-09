import { trpc } from "@/lib/trpc";
import { JobSeeker, Company } from "@/types/user-types";
import { useAuth } from "@/lib/auth";
export const useCurrentUser = () => {
    const { user } = useAuth();
    const query = trpc.user.getMe.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
    });

    return {
        ...query,
        currentUser:
            user?.role === "jobseeker"
                ? (query?.data as JobSeeker | undefined)
                : (query?.data as Company | undefined),
        loading: query.isLoading,
    };
};
