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
    Gauge,
    History,
    Package,
    Plus,
    Settings,
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
    department?: Department | null;
    roles?: Role[];
}

interface DashboardProps {
    user: User;
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function Dashboard({
    user,
}: DashboardProps) {

    const departmentName =
        user.department?.name ??
        'No Department';

    const roleName =
        user.roles?.[0]?.name ??
        'User';


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Dashboard | CMMS" />


            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>

                        <p className="text-sm font-medium text-blue-700">
                            Computerized Maintenance Management System
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Good day, {user.name}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Welcome to the Municipality of Estancia CMMS.
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
                {/* USER / DEPARTMENT CARD */}
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
                                    Signed in as
                                </p>

                                <h2 className="mt-1 text-lg font-bold">
                                    {user.name}
                                </h2>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-100">

                                    <span>
                                        {departmentName}
                                    </span>

                                    <span className="text-blue-300">
                                        •
                                    </span>

                                    <span className="capitalize">
                                        {roleName.replace(
                                            /_/g,
                                            ' ',
                                        )}
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
                {/* STATISTICS */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        title="Total Assets"
                        value="0"
                        description="Assets registered in CMMS"
                        icon={
                            <Archive className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Open Work Orders"
                        value="0"
                        description="Work orders awaiting completion"
                        icon={
                            <ClipboardList className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Maintenance Due"
                        value="0"
                        description="Maintenance activities requiring action"
                        icon={
                            <CalendarClock className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Pending Requests"
                        value="0"
                        description="Maintenance requests awaiting action"
                        icon={
                            <Clock3 className="h-5 w-5" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* MAIN CONTENT */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                    {/* ================================================== */}
                    {/* RECENT WORK ORDERS */}
                    {/* ================================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                            <div>

                                <h3 className="font-semibold text-slate-900">
                                    Recent Work Orders
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Latest maintenance activities
                                </p>

                            </div>


                            <Link
                                href="/work-orders"
                                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                            >
                                View all
                            </Link>

                        </div>


                        {/* EMPTY STATE */}

                        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <Wrench className="h-7 w-7" />

                            </div>


                            <h4 className="mt-4 text-sm font-semibold text-slate-800">
                                No work orders yet
                            </h4>


                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                Maintenance work orders assigned to
                                your department will appear here.
                            </p>


                            <Link
                                href="/work-orders/create"
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800"
                            >

                                <Plus className="h-4 w-4" />

                                Create Work Order

                            </Link>

                        </div>

                    </section>


                    {/* ================================================== */}
                    {/* QUICK ACTIONS */}
                    {/* ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div>

                            <h3 className="font-semibold text-slate-900">
                                Quick Actions
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Common maintenance operations
                            </p>

                        </div>


                        <div className="mt-5 space-y-3">

                            <QuickAction
                                icon={
                                    <Plus className="h-5 w-5" />
                                }
                                title="Create Work Order"
                                description="Create a new maintenance work order"
                                href="/work-orders/create"
                            />


                            <QuickAction
                                icon={
                                    <Wrench className="h-5 w-5" />
                                }
                                title="Maintenance Request"
                                description="Submit a maintenance request"
                                href="/requests/create"
                            />


                            <QuickAction
                                icon={
                                    <Archive className="h-5 w-5" />
                                }
                                title="Register Asset"
                                description="Add a municipal asset or equipment"
                                href="/assets/create"
                            />


                            <QuickAction
                                icon={
                                    <CalendarClock className="h-5 w-5" />
                                }
                                title="Maintenance Schedule"
                                description="View upcoming maintenance activities"
                                href="/maintenance/schedule"
                            />

                        </div>

                    </section>

                </div>


                {/* ====================================================== */}
                {/* LOWER INFORMATION */}
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
                        value="Manage users"
                        href="/admin/users"
                    />


                    <InfoCard
                        icon={
                            <Settings className="h-5 w-5" />
                        }
                        title="System"
                        value="CMMS settings"
                        href="/admin/settings"
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
    value: string;
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