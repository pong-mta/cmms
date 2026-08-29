import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

                    <p className="mt-1 text-sm text-gray-500">Welcome to your dashboard.</p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Users</p>

                        <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Departments</p>

                        <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Assets</p>

                        <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Pending</p>

                        <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Welcome</h2>

                        <p className="mt-2 text-sm text-gray-500">Your application dashboard is ready.</p>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>

                        <p className="mt-2 text-sm text-gray-500">No recent activity.</p>
                    </div>
                </div>

                {/* System Status */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">System Status</h2>

                    <div className="mt-4 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                        <span className="text-sm text-gray-600">System operational</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
