import Link from "next/link";

export default function Home() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">NeoGig Platform</h1>
            <div className="space-y-4">
                <Link
                    href="/users"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    View All Users
                </Link>
            </div>
        </div>
    );
}
