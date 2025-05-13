import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "../../backend/src/routes/index"; // Import the AppRouter type

// API endpoints
export const apiUrl = "http://localhost:8000/trpc";

// Create React hooks
export const trpc = createTRPCReact<AppRouter>();

// Direct client for non-React usage - using httpLink for better compatibility
export const trpcClient = createTRPCClient<any>({
    links: [
        httpLink({
            url: apiUrl,
            fetch: (url, options) => {
                const token = localStorage.getItem("authToken");
                return fetch(url, {
                    ...options,
                    credentials: "include",
                    headers: {
                        ...options?.headers,
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });
            },
        }),
    ],
});

// Helper for making tRPC requests - improved version
export async function fetchTrpc<T>(path: string, input?: any): Promise<T> {
    // Split the path to determine if it's a query or mutation
    const [namespace, procedure] = path.split(".");

    // Determine if this is likely a mutation based on common mutation method names
    const isMutation =
        procedure?.startsWith("create") ||
        procedure?.startsWith("update") ||
        procedure?.startsWith("delete") ||
        procedure?.startsWith("add") ||
        procedure === "signup" ||
        procedure === "login";

    console.log(
        `Calling ${path}${
            isMutation ? " as mutation" : " as query"
        } with input:`,
        input
    );

    const token = localStorage.getItem("authToken");

    if (isMutation) {
        // Use POST for mutations
        const response = await fetch(`${apiUrl}/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: "include",
            // Important: Don't wrap the input in another object
            body: JSON.stringify(input),
        });

        const data = await response.json();
        console.log(`${path} response:`, data);

        if (!response.ok) {
            const errorMsg =
                data.error?.message ||
                data.error ||
                `Error performing ${path} mutation: ${response.status}`;
            console.log("Error details:", data);
            throw new Error(errorMsg);
        }

        return data.result?.data as T;
    } else {
        // Use GET for queries
        const url = input
            ? `${apiUrl}/${path}?input=${encodeURIComponent(
                  JSON.stringify(input)
              )}`
            : `${apiUrl}/${path}`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: "include",
        });

        let data;
        try {
            data = await response.json();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            throw new Error(
                `Failed to parse response from ${path}: ${errorMessage}`
            );
        }

        console.log(`${path} response:`, data);

        if (!response.ok) {
            const errorMsg =
                data.error?.message ||
                data.error ||
                `Error fetching data from ${path}: ${response.status}`;
            console.log("Error details:", data);
            throw new Error(errorMsg);
        }

        return data.result?.data as T;
    }
}
