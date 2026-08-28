import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

import {
    AlertTriangle,
    Archive,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Filter,
    Plus,
    Search,
    Wrench,
    X,
} from 'lucide-react';

import {
    useMemo,
    useState,
} from 'react';


import {
    BarChart,
    Bar,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Asset {
    id: number;
    asset_code: string;
    name: string;
}

interface MaintenanceType {
    id: number;
    name: string;
    code: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface MaintenanceRecord {
    id: number;

    maintenance_code: string;

    asset?: Asset | null;

    maintenance_type?: MaintenanceType | null;

    department?: Department | null;

    scheduled_date?: string | null;

    problem?: string | null;

    labor_cost?: string | number | null;
    parts_cost?: string | number | null;
    other_cost?: string | number | null;
    total_cost?: string | number | null;

    status:
        | 'pending'
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'cancelled';

    priority:
        | 'low'
        | 'normal'
        | 'high'
        | 'critical';
}



interface MaintenanceRequest {
    id: number;
    request_code: string;
    title: string;
    description?: string | null;
    priority: 'low' | 'normal' | 'high' | 'critical';
    status: string;
    completed_at?: string | null;

    asset?: Asset | null;
    department?: Department | null;

    requestedBy?: {
        id: number;
        name: string;
    } | null;

    assignedTo?: {
        id: number;
        name: string;
    } | null;

    completedBy?: {
        id: number;
        name: string;
    } | null;

    preventiveMaintenanceSchedule?: {
        id: number;
        title: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRecords {
    data: MaintenanceRecord[];

    current_page: number;
    last_page: number;
    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    links: PaginationLink[];
}

interface TypeOption {
    id: number;
    name: string;
    code: string;
}

interface DepartmentOption {
    id: number;
    name: string;
    code: string;
}

interface MaintenanceIndexProps {
    records: PaginatedRecords;

    maintenanceRequests: MaintenanceRequest[];

    types: TypeOption[];

    departments: DepartmentOption[];

    maintenanceTrend: {
        month: string;
        total: number;
    }[];

    maintenanceTypes: {
        type: string;
        total: number;
    }[];

    maintenanceStatuses: {
        status: string;
        total: number;
    }[];
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
];


/*
|--------------------------------------------------------------------------
| LABEL HELPERS
|--------------------------------------------------------------------------
*/

function statusLabel(
    status: MaintenanceRecord['status'],
) {
    return status
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}


function priorityLabel(
    priority: MaintenanceRecord['priority'],
) {
    return (
        priority.charAt(0).toUpperCase() +
        priority.slice(1)
    );
}


function formatDate(
    value?: string | null,
) {
    if (!value) {
        return '—';
    }

    return new Date(
        value,
    ).toLocaleDateString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}


function formatCurrency(
    value?: string | number | null,
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '₱0.00';
    }

    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
        },
    ).format(
        Number(value),
    );
}


/*
|--------------------------------------------------------------------------
| STATUS STYLE
|--------------------------------------------------------------------------
*/

function statusClass(
    status: MaintenanceRecord['status'],
) {
    switch (status) {
        case 'pending':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        case 'scheduled':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'in_progress':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'completed':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'cancelled':
            return 'bg-red-50 text-red-700 ring-red-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


/*
|--------------------------------------------------------------------------
| PRIORITY STYLE
|--------------------------------------------------------------------------
*/

function priorityClass(
    priority: MaintenanceRecord['priority'],
) {
    switch (priority) {
        case 'critical':
            return 'bg-red-50 text-red-700 ring-red-200';

        case 'high':
            return 'bg-orange-50 text-orange-700 ring-orange-200';

        case 'normal':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'low':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function MaintenanceIndex({
    records,
    maintenanceRequests,
    types,
    departments,
    maintenanceTrend,
    maintenanceTypes,
    maintenanceStatuses,
}: MaintenanceIndexProps) {

    /*
    |--------------------------------------------------------------------------
    | FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState('');

    const [typeId, setTypeId] =
        useState('');

    const [departmentId, setDepartmentId] =
        useState('');

    const [status, setStatus] =
        useState('');

    const [priority, setPriority] =
        useState('');

    const [showFilters, setShowFilters] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filteredRecords =
        useMemo(() => {

            return records.data.filter(
                (record) => {

                    const searchValue =
                        search
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !searchValue ||
                        record.maintenance_code
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        record.asset?.name
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        record.asset?.asset_code
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        record.problem
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            );

                    const matchesType =
                        !typeId ||
                        String(
                            record
                                .maintenance_type
                                ?.id,
                        ) === typeId;

                    const matchesDepartment =
                        !departmentId ||
                        String(
                            record.department
                                ?.id,
                        ) ===
                            departmentId;

                    const matchesStatus =
                        !status ||
                        record.status ===
                            status;

                    const matchesPriority =
                        !priority ||
                        record.priority ===
                            priority;

                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesDepartment &&
                        matchesStatus &&
                        matchesPriority
                    );
                },
            );

        }, [
            records.data,
            search,
            typeId,
            departmentId,
            status,
            priority,
        ]);


    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setSearch('');
        setTypeId('');
        setDepartmentId('');
        setStatus('');
        setPriority('');
    };


    const hasFilters =
        Boolean(
            search ||
            typeId ||
            departmentId ||
            status ||
            priority,
        );


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (
        url: string | null,
    ) => {

        if (!url) {
            return;
        }

        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
        });
    };


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Maintenance | CMMS" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">

                            <Wrench className="h-5 w-5" />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Maintenance
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Track maintenance activities and service history.
                            </p>

                        </div>

                    </div>


                    <Link
                        href="/maintenance/create"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                    >

                        <Plus className="h-4 w-4" />

                        New Maintenance Record

                    </Link>

                </div>


                {/* ====================================================== */}
                {/* SUMMARY */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Total Records"
                        value={
                            records.total +
                            maintenanceRequests.length
                        }
                        icon={
                            <Wrench className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Showing"
                        value={
                            filteredRecords.length +
                            maintenanceRequests.length
                        }
                        icon={
                            <Archive className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Current Page"
                        value={`${records.current_page} / ${records.last_page}`}
                        icon={
                            <CalendarDays className="h-4 w-4" />
                        }
                    />

                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">

                    {/* MAINTENANCE TREND */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="mb-4">
                            <h2 className="text-sm font-semibold text-slate-800">
                                Maintenance Trend
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Completed maintenance requests by month
                            </p>
                        </div>

                        <div className="h-72 w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={maintenanceTrend}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="total"
                                        name="Completed Maintenance"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>


                    {/* MAINTENANCE TYPE */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="mb-4">
                            <h2 className="text-sm font-semibold text-slate-800">
                                Maintenance Type
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Completed maintenance by type
                            </p>
                        </div>

                        <div className="h-72 w-full">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={maintenanceTypes}
                                        dataKey="total"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={55}
                                        paddingAngle={3}
                                    />

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

                {/* ====================================================== */}
                {/* SEARCH / FILTER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">

                        <div className="relative flex-1">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search maintenance code, asset, or problem..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters,
                                )
                            }
                            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                                showFilters ||
                                hasFilters
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >

                            <Filter className="h-4 w-4" />

                            Filters

                            {hasFilters && (

                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-bold text-white">

                                    {
                                        [
                                            typeId,
                                            departmentId,
                                            status,
                                            priority,
                                        ].filter(
                                            Boolean,
                                        ).length
                                    }

                                </span>

                            )}

                        </button>


                        {hasFilters && (

                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            >

                                <X className="h-3.5 w-3.5" />

                                Clear

                            </button>

                        )}

                    </div>


                    {/* ================================================== */}
                    {/* FILTER PANEL */}
                    {/* ================================================== */}

                    {showFilters && (

                        <div className="border-t border-slate-100 bg-slate-50/70 p-4">

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                                {/* TYPE */}

                                <FilterSelect
                                    label="Maintenance Type"
                                    value={
                                        typeId
                                    }
                                    onChange={
                                        setTypeId
                                    }
                                >

                                    <option value="">
                                        All Types
                                    </option>

                                    {types.map(
                                        (
                                            type,
                                        ) => (

                                            <option
                                                key={
                                                    type.id
                                                }
                                                value={
                                                    type.id
                                                }
                                            >
                                                {
                                                    type.name
                                                }
                                            </option>

                                        ),
                                    )}

                                </FilterSelect>


                                {/* DEPARTMENT */}

                                <FilterSelect
                                    label="Department"
                                    value={
                                        departmentId
                                    }
                                    onChange={
                                        setDepartmentId
                                    }
                                >

                                    <option value="">
                                        All Departments
                                    </option>

                                    {departments.map(
                                        (
                                            department,
                                        ) => (

                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >
                                                {
                                                    department.name
                                                }
                                            </option>

                                        ),
                                    )}

                                </FilterSelect>


                                {/* STATUS */}

                                <FilterSelect
                                    label="Status"
                                    value={
                                        status
                                    }
                                    onChange={
                                        setStatus
                                    }
                                >

                                    <option value="">
                                        All Statuses
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="scheduled">
                                        Scheduled
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>

                                </FilterSelect>


                                {/* PRIORITY */}

                                <FilterSelect
                                    label="Priority"
                                    value={
                                        priority
                                    }
                                    onChange={
                                        setPriority
                                    }
                                >

                                    <option value="">
                                        All Priorities
                                    </option>

                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="normal">
                                        Normal
                                    </option>

                                    <option value="high">
                                        High
                                    </option>

                                    <option value="critical">
                                        Critical
                                    </option>

                                </FilterSelect>

                            </div>

                        </div>

                    )}

                </div>


                {/* ====================================================== */}
                {/* TABLE */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/80">

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Maintenance
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Asset
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Type
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Schedule
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Priority
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Cost
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">
                                
                                {maintenanceRequests.map((request) => (
                                    <tr
                                        key={`pm-${request.id}`}
                                        className="group bg-blue-50/20 transition hover:bg-blue-50/50"
                                    >
                                        {/* MAINTENANCE */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                    <CalendarDays className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            {request.request_code}
                                                        </p>

                                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700">
                                                            PM
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 max-w-[220px] truncate text-[10px] text-slate-400">
                                                        {request.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ASSET */}
                                        <td className="px-5 py-4">
                                            {request.asset ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-700">
                                                        {request.asset.name}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] font-semibold text-blue-700">
                                                        {request.asset.asset_code}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-xs font-medium text-slate-700">
                                                    Preventive Maintenance
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-blue-600">
                                                    Scheduled PM
                                                </p>
                                            </div>
                                        </td>

                                        {/* SCHEDULE */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                <span className="text-xs font-medium text-slate-600">
                                                    {formatDate(request.completed_at)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* PRIORITY */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priorityClass(
                                                    request.priority,
                                                )}`}
                                            >
                                                {priorityLabel(request.priority)}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                Completed
                                            </span>
                                        </td>

                                        {/* COST */}
                                        <td className="px-5 py-4 text-right">
                                            <span className="text-xs font-semibold text-slate-500">
                                                —
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end">
                                                <Link
                                                    href={`/maintenance-requests/${request.id}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                                                    title="View maintenance request"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecords.length === 0 &&
                                    maintenanceRequests.length === 0 ? (
                                    <tr>

                                        <td
                                            colSpan={
                                                8
                                            }
                                            className="px-6 py-16 text-center"
                                        >

                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                                <Wrench className="h-7 w-7" />

                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                                No maintenance records found
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">

                                                {hasFilters
                                                    ? 'Try changing your search or filters.'
                                                    : 'No maintenance activities have been recorded yet.'}

                                            </p>


                                            {!hasFilters && (

                                                <Link
                                                    href="/maintenance/create"
                                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                                                >

                                                    <Plus className="h-4 w-4" />

                                                    Create First Record

                                                </Link>

                                            )}

                                        </td>

                                    </tr>

                                ) : (

                                    filteredRecords.map(
                                        (
                                            record,
                                        ) => (

                                            <tr
                                                key={
                                                    record.id
                                                }
                                                className="group transition hover:bg-slate-50/70"
                                            >


                                                {/* MAINTENANCE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">

                                                            <Wrench className="h-4 w-4" />

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="text-xs font-semibold text-slate-800">
                                                                {
                                                                    record.maintenance_code
                                                                }
                                                            </p>

                                                            {record.problem && (

                                                                <p className="mt-1 max-w-[220px] truncate text-[10px] text-slate-400">
                                                                    {
                                                                        record.problem
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* ASSET */}

                                                <td className="px-5 py-4">

                                                    {record.asset ? (

                                                        <div>

                                                            <p className="text-xs font-semibold text-slate-700">
                                                                {
                                                                    record
                                                                        .asset
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] font-semibold text-blue-700">
                                                                {
                                                                    record
                                                                        .asset
                                                                        .asset_code
                                                                }
                                                            </p>

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-slate-400">
                                                            —
                                                        </span>

                                                    )}

                                                </td>


                                                {/* TYPE */}

                                                <td className="px-5 py-4">

                                                    {record.maintenance_type ? (

                                                        <div>

                                                            <p className="text-xs font-medium text-slate-700">
                                                                {
                                                                    record
                                                                        .maintenance_type
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                                                {
                                                                    record
                                                                        .maintenance_type
                                                                        .code
                                                                }
                                                            </p>

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-slate-400">
                                                            —
                                                        </span>

                                                    )}

                                                </td>


                                                {/* SCHEDULE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                        <span className="text-xs font-medium text-slate-600">
                                                            {formatDate(
                                                                record.scheduled_date,
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* PRIORITY */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priorityClass(
                                                            record.priority,
                                                        )}`}
                                                    >
                                                        {record.priority ===
                                                            'critical' && (
                                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                                        )}

                                                        {
                                                            priorityLabel(
                                                                record.priority,
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                                            record.status,
                                                        )}`}
                                                    >
                                                        {record.status ===
                                                            'in_progress' && (
                                                            <Clock3 className="mr-1 h-3 w-3" />
                                                        )}

                                                        {
                                                            statusLabel(
                                                                record.status,
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                {/* COST */}

                                                <td className="px-5 py-4 text-right">

                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {formatCurrency(
                                                            record.total_cost,
                                                        )}
                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end opacity-70 transition group-hover:opacity-100">

                                                        <Link
                                                            href={`/maintenance/${record.id}`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                                                            title="View maintenance record"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </Link>

                                                    </div>

                                                </td>

                                            </tr>

                                        ),
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ================================================== */}
                    {/* PAGINATION */}
                    {/* ================================================== */}

                    {records.last_page >
                        1 && (

                        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">

                            <p className="text-xs text-slate-500">

                                Showing{' '}

                                <span className="font-semibold text-slate-700">
                                    {records.from ??
                                        0}
                                </span>

                                {' '}to{' '}

                                <span className="font-semibold text-slate-700">
                                    {records.to ??
                                        0}
                                </span>

                                {' '}of{' '}

                                <span className="font-semibold text-slate-700">
                                    {
                                        records.total
                                    }
                                </span>

                                {' '}records

                            </p>


                            <div className="flex items-center gap-1">

                                {records.links.map(
                                    (
                                        link,
                                        index,
                                    ) => {

                                        if (
                                            index ===
                                                0 ||
                                            index ===
                                                records
                                                    .links
                                                    .length -
                                                    1
                                        ) {

                                            return (
                                                <button
                                                    key={
                                                        index
                                                    }
                                                    type="button"
                                                    disabled={
                                                        !link.url
                                                    }
                                                    onClick={() =>
                                                        goToPage(
                                                            link.url,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >

                                                    {index ===
                                                    0 ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}

                                                </button>
                                            );
                                        }


                                        return (
                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                disabled={
                                                    !link.url
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        link.url,
                                                    )
                                                }
                                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-700 text-white'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    },
                                )}

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </AppLayout>
    );
}


/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
}) {

    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                    {value}
                </p>

            </div>


            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                {icon}

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| FILTER SELECT
|--------------------------------------------------------------------------
*/

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (
        value: string,
    ) => void;
    children: React.ReactNode;
}) {

    return (
        <div>

            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >

                {children}

            </select>

        </div>
    );
}