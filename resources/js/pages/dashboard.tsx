import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    Archive,
    Bell,
    Building2,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    History,
    Package,
    Plus,
    Users,
    Wrench,
} from 'lucide-react';


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    phone: string;
    department_id: number | null;
    department?: Department | null;
    roles?: Role[];
}

interface DashboardStats {
    assets: number;
    maintenance: number;
    requests: number;
    pending: number;
    maintenance_due: number;
    overdue: number;
    completed: number;
}

interface MaintenanceItem {
    id: number;
    title?: string;
    status?: string;
    priority?: string;
    completed_at?: string | null;
    asset?: {
        id: number;
        asset_code: string;
        name: string;
    } | null;
}

interface PendingAction {
    id: number;
    title: string;
    description?: string;
    type?: string;
    href?: string;
}

interface DashboardProps {
    user: User;

    stats?: DashboardStats;

    recentMaintenance?: MaintenanceItem[];

    pendingActions?: PendingAction[];
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function Dashboard({
    user,
    stats,
    recentMaintenance = [],
    pendingActions = [],
}: DashboardProps) {

    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT
    |--------------------------------------------------------------------------
    */

    const departmentName =
        user.department?.name ??
        'No Department';

    const departmentCode =
        user.department?.code ??
        '';

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    const roleName =
        user.roles?.[0]?.name ??
        'User';

    const formattedRole =
        roleName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase(),
            );


    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    |
    | Defaults are zero until Laravel supplies real department statistics.
    |
    */

    const dashboardStats: DashboardStats = {
        assets: stats?.assets ?? 0,
        maintenance: stats?.maintenance ?? 0,
        requests: stats?.requests ?? 0,
        pending: stats?.pending ?? 0,
        maintenance_due: stats?.maintenance_due ?? 0,
        overdue: stats?.overdue ?? 0,
        completed: stats?.completed ?? 0,
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head
                title={`Dashboard | ${departmentName}`}
            />


            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>

                        <p className="text-sm font-medium text-blue-700">
                            LGU Operations Platform
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Good day, {user.name}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            {departmentName} Department Dashboard
                        </p>

                    </div>


                    {/* USER / NOTIFICATION */}

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >

                            <Bell className="h-5 w-5" />

                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

                        </button>


                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">

                                {user.name
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <div className="hidden sm:block">

                                <p className="text-xs font-semibold text-slate-900">
                                    {user.name}
                                </p>

                                <p className="text-[10px] text-slate-500">
                                    {departmentName}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT CARD */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1f3a] to-[#0b5cab] p-6 text-white shadow-lg">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/20">

                                {user.name
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <div>

                                <p className="text-xs font-medium text-blue-200">
                                    Department
                                </p>

                                <h2 className="mt-1 text-lg font-bold">
                                    {departmentName}
                                </h2>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-100">

                                    {departmentCode && (
                                        <span>
                                            {departmentCode}
                                        </span>
                                    )}

                                    <span className="text-blue-300">
                                        •
                                    </span>

                                    <span>
                                        {formattedRole}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10">

                            <p className="text-[10px] uppercase tracking-wider text-blue-200">
                                Mobile Number
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                                {user.phone}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT STATISTICS */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        title="Department Assets"
                        value={dashboardStats.assets}
                        description="Assets assigned to your department"
                        icon={
                            <Archive className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Maintenance"
                        value={dashboardStats.maintenance}
                        description="Maintenance activities"
                        icon={
                            <Wrench className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Requests"
                        value={dashboardStats.requests}
                        description="Maintenance requests"
                        icon={
                            <ClipboardList className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Pending Actions"
                        value={dashboardStats.pending}
                        description="Actions requiring attention"
                        icon={
                            <Clock3 className="h-5 w-5" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* SECONDARY STATISTICS */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SmallStatCard
                        title="Maintenance Due"
                        value={dashboardStats.maintenance_due}
                        icon={
                            <CalendarClock className="h-5 w-5" />
                        }
                    />


                    <SmallStatCard
                        title="Overdue"
                        value={dashboardStats.overdue}
                        icon={
                            <Clock3 className="h-5 w-5" />
                        }
                    />


                    <SmallStatCard
                        title="Completed"
                        value={dashboardStats.completed}
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* MAIN CONTENT */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                    {/* ================================================== */}
                    {/* RECENT MAINTENANCE */}
                    {/* ================================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                            <div>

                                <h3 className="font-semibold text-slate-900">
                                    Recent Maintenance
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Latest maintenance activity in your department
                                </p>

                            </div>


                            <Link
                                href="/maintenance"
                                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                            >
                                View all
                            </Link>

                        </div>


                        {recentMaintenance.length === 0 ? (

                            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                    <Wrench className="h-7 w-7" />

                                </div>


                                <h4 className="mt-4 text-sm font-semibold text-slate-800">
                                    No maintenance activity yet
                                </h4>


                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                    Maintenance activities for your department will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {recentMaintenance.map((item) => (

                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-4 px-5 py-4"
                                    >

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {item.title ??
                                                    'Maintenance Request'}
                                            </p>

                                            {item.asset && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.asset.asset_code}
                                                    {' • '}
                                                    {item.asset.name}
                                                </p>
                                            )}

                                        </div>


                                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">
                                            {item.status ??
                                                'Unknown'}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* ================================================== */}
                    {/* PENDING ACTIONS */}
                    {/* ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div>

                            <h3 className="font-semibold text-slate-900">
                                Pending Actions
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Items requiring your department's attention
                            </p>

                        </div>


                        {pendingActions.length === 0 ? (

                            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                                    <CheckCircle2 className="h-7 w-7" />

                                </div>


                                <h4 className="mt-4 text-sm font-semibold text-slate-800">
                                    Nothing pending
                                </h4>


                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                    Your department currently has no pending actions.
                                </p>

                            </div>

                        ) : (

                            <div className="mt-5 space-y-3">

                                {pendingActions.map((action) => (

                                    <QuickAction
                                        key={`${action.type ?? 'action'}-${action.id}`}
                                        icon={
                                            <Bell className="h-5 w-5" />
                                        }
                                        title={action.title}
                                        description={
                                            action.description ??
                                            'Action requires attention'
                                        }
                                        href={action.href}
                                    />

                                ))}

                            </div>

                        )}

                    </section>

                </div>


                {/* ====================================================== */}
                {/* QUICK ACTIONS */}
                {/* ====================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div>

                        <h3 className="font-semibold text-slate-900">
                            Quick Actions
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Common operations for {departmentName}
                        </p>

                    </div>


                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <QuickAction
                            icon={
                                <Plus className="h-5 w-5" />
                            }
                            title="Create Work Order"
                            description="Create a maintenance work order"
                            href="/work-orders/create"
                        />


                        <QuickAction
                            icon={
                                <Wrench className="h-5 w-5" />
                            }
                            title="Maintenance Request"
                            description="Submit a maintenance request"
                            href="/maintenance-requests/create"
                        />


                        <QuickAction
                            icon={
                                <Archive className="h-5 w-5" />
                            }
                            title="Register Asset"
                            description="Register a department asset"
                            href="/assets/create"
                        />


                        <QuickAction
                            icon={
                                <CalendarClock className="h-5 w-5" />
                            }
                            title="Maintenance Schedule"
                            description="View upcoming maintenance"
                            href="/maintenance/schedule"
                        />

                    </div>

                </section>


                {/* ====================================================== */}
                {/* DEPARTMENT INFORMATION */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


                    <InfoCard
                        icon={
                            <Building2 className="h-5 w-5" />
                        }
                        title="Department"
                        value={departmentName}
                        href="/admin/departments"
                    />


                    <InfoCard
                        icon={
                            <Package className="h-5 w-5" />
                        }
                        title="Inventory"
                        value="View stock"
                        href="/inventory"
                    />


                    <InfoCard
                        icon={
                            <Users className="h-5 w-5" />
                        }
                        title="Users"
                        value="Department users"
                        href="/admin/users"
                    />


                    <InfoCard
                        icon={
                            <FileText className="h-5 w-5" />
                        }
                        title="Documents"
                        value="Department documents"
                        href="/documents"
                    />

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

function StatCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
}) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-xs font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                </div>

            </div>


            <p className="mt-3 text-[11px] text-slate-400">
                {description}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| SMALL STAT CARD
|--------------------------------------------------------------------------
*/

function SmallStatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {

    return (

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div>

                <p className="text-xs font-medium text-slate-500">
                    {title}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                    {value}
                </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                {icon}
            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| QUICK ACTION
|--------------------------------------------------------------------------
*/

function QuickAction({
    icon,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
}) {

    const content = (
        <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-xs font-semibold text-slate-800">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {description}
                </p>

            </div>
        </>
    );


    if (href) {

        return (

            <Link
                href={href}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-100 hover:bg-blue-50"
            >
                {content}
            </Link>

        );
    }


    return (

        <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-100 hover:bg-blue-50"
        >
            {content}
        </button>

    );
}


/*
|--------------------------------------------------------------------------
| INFORMATION CARD
|--------------------------------------------------------------------------
*/

function InfoCard({
    icon,
    title,
    value,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    href: string;
}) {

    return (

        <Link
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
                    {icon}
                </div>


                <div className="min-w-0">

                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {title}
                    </p>

                    <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                        {value}
                    </p>

                </div>

            </div>

        </Link>

    );
}