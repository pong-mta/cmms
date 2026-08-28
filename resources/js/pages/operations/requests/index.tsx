import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

import {
    Archive,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    FileText,
    Filter,
    Plus,
    Search,
    User,
    Wrench,
    X,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';


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

interface User {
    id: number;
    name: string;
    phone?: string;
    department_id?: number | null;
}

interface Asset {
    id: number;
    asset_code: string;
    name: string;
}

interface ServiceRequest {
    id: number;
    request_code: string;
    request_type: string;
    subject: string;
    description?: string | null;
    priority: string;
    status: string;

    requested_at?: string | null;
    created_at?: string | null;

    department?: Department | null;

    requested_by?: User | null;

    assigned_department?: Department | null;

    assigned_to?: User | null;

    asset?: Asset | null;
}

interface PaginatedRequests {
    data: ServiceRequest[];

    current_page: number;
    last_page: number;

    from: number | null;
    to: number | null;
    total: number;

    per_page: number;

    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface RequestCounts {
    all: number;
    my: number;
    pending: number;
    in_progress: number;
    completed: number;
    archived: number;
}

interface Filters {
    search?: string;
    status?: string;
    priority?: string;
    request_type?: string;
}

interface Props {
    requests: PaginatedRequests;

    counts: RequestCounts;

    requestTypes: string[];

    departments: Department[];

    assets: Asset[];

    filters: Filters;

    user: User & {
        department?: Department | null;
        roles?: {
            id: number;
            name: string;
        }[];
    };
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations/requests',
    },
    {
        title: 'Requests',
        href: '/operations/requests',
    },
];


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatStatus(status: string): string {
    return status
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}


function formatPriority(priority: string): string {
    return priority
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}


function formatDate(date?: string | null): string {
    if (!date) {
        return '—';
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    ).format(new Date(date));
}


function statusClasses(status: string): string {
    switch (status) {

        case 'completed':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'in_progress':
        case 'assigned':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'approved':
            return 'bg-violet-50 text-violet-700 ring-violet-200';

        case 'pending':
        case 'for_head_review':
        case 'for_budget_review':
        case 'for_gso_review':
        case 'for_accounting_review':
        case 'for_mayor_review':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'archived':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        case 'rejected':
        case 'declined':
            return 'bg-red-50 text-red-700 ring-red-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


function priorityClasses(priority: string): string {
    switch (priority) {

        case 'critical':
            return 'bg-red-50 text-red-700';

        case 'high':
            return 'bg-orange-50 text-orange-700';

        case 'normal':
            return 'bg-blue-50 text-blue-700';

        case 'low':
            return 'bg-slate-100 text-slate-600';

        default:
            return 'bg-slate-100 text-slate-600';
    }
}


/*
|--------------------------------------------------------------------------
| REQUEST PAGE
|--------------------------------------------------------------------------
*/

export default function RequestsIndex({
    requests,
    counts,
    requestTypes,
    filters,
    user,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | LOCAL FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState(filters.search ?? '');

    const [status, setStatus] =
        useState(filters.status ?? '');

    const [priority, setPriority] =
        useState(filters.priority ?? '');

    const [requestType, setRequestType] =
        useState(filters.request_type ?? '');

    const [showFilters, setShowFilters] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timeout =
            window.setTimeout(() => {

                if (
                    search ===
                        (filters.search ?? '') &&
                    status ===
                        (filters.status ?? '') &&
                    priority ===
                        (filters.priority ?? '') &&
                    requestType ===
                        (filters.request_type ?? '')
                ) {
                    return;
                }


                router.get(
                    '/operations/requests',
                    {
                        search:
                            search || undefined,

                        status:
                            status || undefined,

                        priority:
                            priority || undefined,

                        request_type:
                            requestType || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );

            }, 400);


        return () =>
            window.clearTimeout(timeout);

    }, [
        search,
        status,
        priority,
        requestType,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

    function clearFilters() {

        setSearch('');
        setStatus('');
        setPriority('');
        setRequestType('');

        router.get(
            '/operations/requests',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STATUS TABS
    |--------------------------------------------------------------------------
    */

    const tabs = [
        {
            key: '',
            label: 'All Requests',
            count: counts.all,
            icon: ClipboardList,
        },

        {
            key: 'my',
            label: 'My Requests',
            count: counts.my,
            icon: User,
        },

        {
            key: 'pending',
            label: 'Pending',
            count: counts.pending,
            icon: Clock3,
        },

        {
            key: 'in_progress',
            label: 'In Progress',
            count: counts.in_progress,
            icon: Wrench,
        },

        {
            key: 'completed',
            label: 'Completed',
            count: counts.completed,
            icon: CheckCircle2,
        },

        {
            key: 'archived',
            label: 'Archived',
            count: counts.archived,
            icon: Archive,
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | HANDLE TAB
    |--------------------------------------------------------------------------
    */

    function handleTab(
        key: string,
    ) {

        if (key === 'my') {

            router.get(
                '/operations/requests',
                {
                    search:
                        search || undefined,

                    priority:
                        priority || undefined,

                    request_type:
                        requestType || undefined,

                    requested_by:
                        user.id,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );

            return;
        }


        if (key === 'pending') {

            setStatus('pending');

            return;
        }


        if (key === 'in_progress') {

            setStatus('in_progress');

            return;
        }


        setStatus(key);
    }


    /*
    |--------------------------------------------------------------------------
    | ACTIVE FILTERS
    |--------------------------------------------------------------------------
    */

    const hasFilters =
        Boolean(
            search ||
            status ||
            priority ||
            requestType,
        );


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Operations | Requests" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                            <span>
                                Operations
                            </span>

                            <span>
                                /
                            </span>

                            <span className="font-medium text-slate-700">
                                Requests
                            </span>

                        </div>


                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            Requests
                        </h1>


                        <p className="mt-1 text-sm text-slate-500">
                            Manage requests for {user.department?.name ?? 'your department'}.
                        </p>

                    </div>


                    <Link
                        href="/operations/requests/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <Plus className="h-4 w-4" />

                        New Request

                    </Link>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT BANNER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                                <ClipboardList className="h-5 w-5" />

                            </div>


                            <div>

                                <p className="text-xs font-medium text-blue-600">
                                    Department Requests
                                </p>


                                <p className="text-sm font-semibold text-slate-800">
                                    {user.department?.name ?? 'No Department'}
                                </p>

                            </div>

                        </div>


                        <div className="text-xs text-slate-500">

                            {requests.total} total request
                            {requests.total !== 1 ? 's' : ''}

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* TABS */}
                {/* ====================================================== */}

                <div className="overflow-x-auto">

                    <div className="flex min-w-max gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">

                        {tabs.map((tab) => {

                            const Icon =
                                tab.icon;

                            const active =
                                tab.key === ''
                                    ? !status
                                    : status === tab.key;


                            return (

                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() =>
                                        handleTab(tab.key)
                                    }
                                    className={[
                                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
                                        active
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50',
                                    ].join(' ')}
                                >

                                    <Icon className="h-4 w-4" />

                                    {tab.label}

                                    <span
                                        className={[
                                            'rounded-full px-1.5 py-0.5 text-[10px]',
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 text-slate-500',
                                        ].join(' ')}
                                    >
                                        {tab.count}
                                    </span>

                                </button>

                            );
                        })}

                    </div>

                </div>


                {/* ====================================================== */}
                {/* SEARCH / FILTER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search request number, subject, or description..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters,
                                )
                            }
                            className={[
                                'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition',
                                showFilters ||
                                priority ||
                                requestType
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                            ].join(' ')}
                        >

                            <Filter className="h-4 w-4" />

                            Filters

                        </button>


                        {hasFilters && (

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            >

                                <X className="h-4 w-4" />

                                Clear

                            </button>

                        )}

                    </div>


                    {/* ================================================== */}
                    {/* FILTERS */}
                    {/* ================================================== */}

                    {showFilters && (

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">

                            {/* STATUS */}

                            <div>

                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Status
                                </label>


                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        All statuses
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="for_head_review">
                                        For Head Review
                                    </option>

                                    <option value="approved">
                                        Approved
                                    </option>

                                    <option value="assigned">
                                        Assigned
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="archived">
                                        Archived
                                    </option>

                                </select>

                            </div>


                            {/* PRIORITY */}

                            <div>

                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Priority
                                </label>


                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        All priorities
                                    </option>

                                    <option value="critical">
                                        Critical
                                    </option>

                                    <option value="high">
                                        High
                                    </option>

                                    <option value="normal">
                                        Normal
                                    </option>

                                    <option value="low">
                                        Low
                                    </option>

                                </select>

                            </div>


                            {/* REQUEST TYPE */}

                            <div>

                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Request Type
                                </label>


                                <select
                                    value={
                                        requestType
                                    }
                                    onChange={(event) =>
                                        setRequestType(
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        All request types
                                    </option>

                                    {requestTypes.map(
                                        (type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatStatus(
                                                    type,
                                                )}
                                            </option>
                                        ),
                                    )}

                                </select>

                            </div>

                        </div>

                    )}

                </div>


                {/* ====================================================== */}
                {/* REQUEST TABLE */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/70">

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Request
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Subject
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Requester
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Priority
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Date
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {requests.data.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="px-5 py-16"
                                        >

                                            <div className="flex flex-col items-center justify-center text-center">

                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                                    <ClipboardList className="h-7 w-7" />

                                                </div>


                                                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                                    No requests found
                                                </h3>


                                                <p className="mt-1 max-w-sm text-xs text-slate-500">
                                                    There are no requests matching your current filters.
                                                </p>


                                                {hasFilters && (

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            clearFilters
                                                        }
                                                        className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                    >
                                                        Clear filters
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    requests.data.map(
                                        (request) => (

                                            <tr
                                                key={
                                                    request.id
                                                }
                                                className="group transition hover:bg-slate-50/70"
                                            >

                                                {/* REQUEST */}

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <p className="text-xs font-bold text-blue-700">
                                                            {
                                                                request.request_code
                                                            }
                                                        </p>


                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            {
                                                                formatStatus(
                                                                    request.request_type,
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* SUBJECT */}

                                                <td className="max-w-[260px] px-5 py-4">

                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {
                                                            request.subject
                                                        }
                                                    </p>


                                                    {request.asset && (

                                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">

                                                            <Wrench className="h-3 w-3" />

                                                            {
                                                                request
                                                                    .asset
                                                                    .asset_code
                                                            }

                                                            {' • '}

                                                            {
                                                                request
                                                                    .asset
                                                                    .name
                                                            }

                                                        </div>

                                                    )}

                                                </td>


                                                {/* REQUESTER */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">

                                                            <User className="h-3.5 w-3.5" />

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-medium text-slate-700">
                                                                {
                                                                    request
                                                                        .requested_by
                                                                        ?.name ??
                                                                    'Unknown'
                                                                }
                                                            </p>


                                                            <p className="text-[10px] text-slate-400">
                                                                {
                                                                    request
                                                                        .department
                                                                        ?.code ??
                                                                    '—'
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* PRIORITY */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={[
                                                            'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold',
                                                            priorityClasses(
                                                                request.priority,
                                                            ),
                                                        ].join(' ')}
                                                    >
                                                        {
                                                            formatPriority(
                                                                request.priority,
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={[
                                                            'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
                                                            statusClasses(
                                                                request.status,
                                                            ),
                                                        ].join(' ')}
                                                    >
                                                        {
                                                            formatStatus(
                                                                request.status,
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* DATE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">

                                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                        {
                                                            formatDate(
                                                                request.requested_at ??
                                                                request.created_at,
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-5 py-4 text-right">

                                                    <Link
                                                        href={`/operations/requests/${request.id}`}
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 opacity-80 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 group-hover:opacity-100"
                                                    >

                                                        <Eye className="h-3.5 w-3.5" />

                                                        View

                                                    </Link>

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

                    {requests.last_page > 1 && (

                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-slate-500">

                                Showing{' '}

                                <span className="font-semibold text-slate-700">
                                    {requests.from ?? 0}
                                </span>

                                {' '}to{' '}

                                <span className="font-semibold text-slate-700">
                                    {requests.to ?? 0}
                                </span>

                                {' '}of{' '}

                                <span className="font-semibold text-slate-700">
                                    {requests.total}
                                </span>

                                {' '}requests

                            </p>


                            <div className="flex items-center gap-1">

                                {requests.links.map(
                                    (link, index) => {

                                        const isPrevious =
                                            link.label.includes(
                                                'Previous',
                                            );

                                        const isNext =
                                            link.label.includes(
                                                'Next',
                                            );


                                        return (

                                            <Link
                                                key={`${link.label}-${index}`}
                                                href={
                                                    link.url ??
                                                    '#'
                                                }
                                                preserveScroll
                                                className={[
                                                    'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition',
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                            ? 'text-slate-600 hover:bg-slate-100'
                                                            : 'pointer-events-none text-slate-300',
                                                ].join(' ')}
                                            >

                                                {isPrevious ? (

                                                    <ChevronLeft className="h-4 w-4" />

                                                ) : isNext ? (

                                                    <ChevronRight className="h-4 w-4" />

                                                ) : (

                                                    link.label

                                                )}

                                            </Link>

                                        );
                                    },
                                )}

                            </div>

                        </div>

                    )}

                </div>


                {/* ====================================================== */}
                {/* FOOTER INFORMATION */}
                {/* ====================================================== */}

                <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <FileText className="h-3.5 w-3.5" />

                        <span>
                            Requests are scoped to your department.
                        </span>

                    </div>


                    <div className="flex items-center gap-2">

                        <Bell className="h-3.5 w-3.5" />

                        <span>
                            Request workflow activity is recorded.
                        </span>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}