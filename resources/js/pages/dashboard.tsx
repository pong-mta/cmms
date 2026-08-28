import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    Archive,
    BarChart3,
    Bell,
    Building2,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileBarChart,
    FileText,
    History,
    LayoutDashboard,
    Package,
    Plus,
    Users,
    Wrench,
} from 'lucide-react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';


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

interface MaintenanceStatus {
    status: string;
    total: number;
}

interface MonthlyMaintenance {
    month: string;
    total: number;
}

interface MaintenanceItem {
    id: number;
    title?: string;
    status?: string;
    priority?: string;
    completed_at?: string | null;
    created_at?: string | null;

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

    maintenanceStatuses?: MaintenanceStatus[];

    monthlyMaintenance?: MonthlyMaintenance[];

    recentMaintenance?: MaintenanceItem[];

    pendingActions?: PendingAction[];
}


/*
|--------------------------------------------------------------------------
| CHART COLORS
|--------------------------------------------------------------------------
*/

const STATUS_COLORS = [
    '#2563eb',
    '#f59e0b',
    '#f97316',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#64748b',
];


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatRole(role?: string): string {
    if (!role) {
        return 'User';
    }

    return role
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}


function getPrimaryRole(user: User): string {
    return user.roles?.[0]?.name ?? 'User';
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function Dashboard({
    user,
    stats,
    maintenanceStatuses = [],
    monthlyMaintenance = [],
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
        getPrimaryRole(user);

    const roleLabel =
        formatRole(roleName);


    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const dashboardStats: DashboardStats = {
        assets: stats?.assets ?? 0,
        maintenance: stats?.maintenance ?? 0,
        requests: stats?.requests ?? 0,
        pending: stats?.pending ?? 0,
        maintenance_due:
            stats?.maintenance_due ?? 0,
        overdue:
            stats?.overdue ?? 0,
        completed:
            stats?.completed ?? 0,
    };


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

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


                    <div className="flex items-center gap-3">

                        {/* NOTIFICATIONS */}

                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                            title="Notifications"
                        >

                            <Bell className="h-5 w-5" />

                            {dashboardStats.pending > 0 && (
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                            )}

                        </button>


                        {/* USER */}

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
                                    {roleLabel}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT BANNER */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1f3a] to-[#0b5cab] p-6 text-white shadow-lg">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/20">

                                <Building2 className="h-7 w-7" />

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
                                        {roleLabel}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10">

                            <p className="text-[10px] uppercase tracking-wider text-blue-200">
                                Department ID
                            </p>


                            <p className="mt-1 text-sm font-semibold">
                                {user.department_id ?? '—'}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* MAIN STATISTICS */}
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
                        description="Department maintenance requests"
                        icon={
                            <ClipboardList className="h-5 w-5" />
                        }
                    />


                    <StatCard
                        title="Pending"
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
                {/* CHARTS */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-2">


                    {/* ================================================== */}
                    {/* MAINTENANCE STATUS */}
                    {/* ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div>

                            <div className="flex items-center gap-2">

                                <BarChart3 className="h-5 w-5 text-blue-600" />

                                <h3 className="font-semibold text-slate-900">
                                    Maintenance Status
                                </h3>

                            </div>


                            <p className="mt-1 text-xs text-slate-500">
                                Current maintenance status for {departmentName}
                            </p>

                        </div>


                        <div className="mt-5 h-[300px]">

                            {maintenanceStatuses.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={maintenanceStatuses}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="status"
                                            tick={{
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            cursor={{
                                                fill: '#f8fafc',
                                            }}
                                        />

                                        <Bar
                                            dataKey="total"
                                            name="Maintenance"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        >

                                            {maintenanceStatuses.map(
                                                (_, index) => (
                                                    <Cell
                                                        key={`status-${index}`}
                                                        fill={
                                                            STATUS_COLORS[
                                                                index %
                                                                STATUS_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    icon={
                                        <Wrench className="h-7 w-7" />
                                    }
                                    title="No maintenance data"
                                    description="Maintenance status will appear here when your department has records."
                                />

                            )}

                        </div>

                    </section>


                    {/* ================================================== */}
                    {/* MONTHLY TREND */}
                    {/* ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div>

                            <div className="flex items-center gap-2">

                                <BarChart3 className="h-5 w-5 text-emerald-600" />

                                <h3 className="font-semibold text-slate-900">
                                    Monthly Maintenance Trend
                                </h3>

                            </div>


                            <p className="mt-1 text-xs text-slate-500">
                                Maintenance activity over the past months
                            </p>

                        </div>


                        <div className="mt-5 h-[300px]">

                            {monthlyMaintenance.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={monthlyMaintenance}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="month"
                                            tick={{
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            name="Maintenance"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                            }}
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    icon={
                                        <BarChart3 className="h-7 w-7" />
                                    }
                                    title="No trend data"
                                    description="Monthly maintenance activity will appear here."
                                />

                            )}

                        </div>

                    </section>

                </div>


                {/* ====================================================== */}
                {/* RECENT + PENDING */}
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
                                    Latest activity in your department
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

                            <EmptyState
                                icon={
                                    <Wrench className="h-7 w-7" />
                                }
                                title="No maintenance activity yet"
                                description="Maintenance activities for your department will appear here."
                            />

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
                                                    'Maintenance Record'}
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

                            <EmptyState
                                icon={
                                    <CheckCircle2 className="h-7 w-7" />
                                }
                                title="Nothing pending"
                                description="Your department currently has no pending actions."
                                success
                            />

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
| EMPTY CHART
|--------------------------------------------------------------------------
*/

function EmptyChart({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {

    return (

        <div className="flex h-full flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                {icon}

            </div>


            <h4 className="mt-4 text-sm font-semibold text-slate-800">
                {title}
            </h4>


            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
    icon,
    title,
    description,
    success = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    success?: boolean;
}) {

    return (

        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

            <div
                className={
                    success
                        ? 'flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600'
                        : 'flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'
                }
            >

                {icon}

            </div>


            <h4 className="mt-4 text-sm font-semibold text-slate-800">
                {title}
            </h4>


            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
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