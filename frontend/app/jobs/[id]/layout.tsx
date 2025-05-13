import { ReactNode } from "react";
export const metadata = {
    title: "Job Details | NeoGig",
    description: "View detailed information about the job posting",
};
export default function JobLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}

