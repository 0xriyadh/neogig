"use client";

import { fetchTrpc, User } from "../../lib/trpc";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    // Use React Query with our helper function
    const { data, isLoading, error } = useQuery({
        queryKey: ["users"],
        queryFn: () => fetchTrpc<User[]>("user.getAll"),
    });

    // Update state when data changes
    useEffect(() => {
        if (data) {
            setUsers(data);
        }
    }, [data]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Users</h1>

            {isLoading && <p>Loading users...</p>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Error:{" "}
                    {error instanceof Error
                        ? error.message
                        : "An error occurred"}
                </div>
            )}

            {!isLoading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Role</th>
                                <th className="py-2 px-4 border-b">
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="py-2 px-4 border-b">
                                            {user.id}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {user.email}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {user.role}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {user.createdAt
                                                ? new Date(
                                                      user.createdAt
                                                  ).toLocaleString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-4 px-4 text-center"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
