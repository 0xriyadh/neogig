// Define simple type for common interfaces
export interface User {
    id: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

// API endpoints
export const apiUrl = "http://localhost:8000/trpc";

// Helper for making tRPC requests
export async function fetchTrpc<T>(path: string, input?: any): Promise<T> {
    const url = input
        ? `${apiUrl}/${path}?input=${encodeURIComponent(JSON.stringify(input))}`
        : `${apiUrl}/${path}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error fetching data");
    }

    return data.result.data as T;
}
