import { trpc } from "@/lib/trpc";
import { User } from "@/types/user-types";

export const useCurrentUser = () => {
    const query = trpc.user.getMe.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
    });

    return {
        ...query,
        currentUser: query.data as User | undefined,
    };
};
