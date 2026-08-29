import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    users: number;
    departments: number;
    roles: number;
    requests: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
}

interface AuthUser {
    id: number;
    name: string;
    department?: {
        id: number;
        name: string;
        code: string;
    } | null;
    roles?: {
        id: number;
        name: string;
    }[];
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
    stats: DashboardStats;
}

export default function Dashboard() {
    const { auth, stats } = usePage<PageProps>().props;

    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div>
                    <p className="text-sm font-medium text-blue-600">LGU Operations</p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Good day, {user.name}</h1>

                    <p className="mt-1 text-sm text-slate-500">Municipal Operations Dashboard</p>
                </div>

                {/* ====================================================== */}
                {/* USER INFORMATION */}
                {/* ====================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Current User</p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">{user.name}</p>

                            {user.department && <p className="mt-1 text-xs text-slate-500">{user.department.name}</p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user.roles?.map((role) => (
                                <span key={role.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    {role.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* ORGANIZATION STATISTICS */}
                {/* ====================================================== */}

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">Organization</h2>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard title="Users" value={stats.users} />

                        <StatCard title="Departments" value={stats.departments} />

                        <StatCard title="Roles" value={stats.roles} />
                    </div>
                </div>

                {/* ====================================================== */}
                {/* OPERATIONS STATISTICS */}
                {/* ====================================================== */}

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">Operations</h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <StatCard title="Requests" value={stats.requests} />

                        <StatCard title="Pending" value={stats.pending} />

                        <StatCard title="In Progress" value={stats.in_progress} />

                        <StatCard title="Completed" value={stats.completed} />

                        <StatCard title="Overdue" value={stats.overdue} />
                    </div>
                </div>

                {/* ====================================================== */}
                {/* MAIN CONTENT */}
                {/* ====================================================== */}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Requests */}

                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Recent Requests</h2>

                            <p className="mt-1 text-xs text-slate-500">Latest requests across the municipality</p>
                        </div>

                        <div className="p-5">
                            <div className="flex min-h-48 items-center justify-center text-center">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">No requests yet</p>

                                    <p className="mt-1 text-xs text-slate-400">Requests will appear here.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}

                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>

                            <p className="mt-1 text-xs text-slate-500">Latest activity across LGU Operations</p>
                        </div>

                        <div className="p-5">
                            <div className="flex min-h-48 items-center justify-center text-center">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">No recent activity</p>

                                    <p className="mt-1 text-xs text-slate-400">System activity will appear here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* SYSTEM STATUS */}
                {/* ====================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-900">System Operational</p>

                            <p className="mt-0.5 text-xs text-slate-500">LGU Operations platform is running normally.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{title}</p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
    );
}
