import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    ClipboardList,
    Plus,
    User,
    Wrench,
} from 'lucide-react';


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


interface Department {
    id: number;
    name: string;
    code: string;
}


interface UserOption {
    id: number;
    name: string;
}


interface MaintenanceRequest {
    id: number;

    request_code: string;

    asset?: Asset | null;

    department?: Department | null;

    requested_by?: UserOption | null;

    assigned_to?: UserOption | null;

    title: string;

    description: string;

    priority:
        | 'low'
        | 'normal'
        | 'high'
        | 'critical';

    status:
        | 'submitted'
        | 'reviewing'
        | 'approved'
        | 'assigned'
        | 'in_progress'
        | 'completed'
        | 'rejected'
        | 'cancelled';

    requested_at?: string | null;

    approved_at?: string | null;

    started_at?: string | null;

    completed_at?: string | null;

    remarks?: string | null;

    created_at: string;

    updated_at: string;
}


interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}


interface PaginatedRequests {
    data: MaintenanceRequest[];

    current_page: number;

    last_page: number;

    per_page: number;

    total: number;

    links: PaginationLink[];
}


interface Props {
    requests: PaginatedRequests;
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance Requests',
        href: '/maintenance-requests',
    },
];


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function statusLabel(
    status: MaintenanceRequest['status'],
) {
    return status
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}


function statusClass(
    status: MaintenanceRequest['status'],
) {
    switch (status) {

        case 'submitted':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'reviewing':
            return 'bg-purple-50 text-purple-700 ring-purple-200';

        case 'approved':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'assigned':
            return 'bg-indigo-50 text-indigo-700 ring-indigo-200';

        case 'in_progress':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'completed':
            return 'bg-green-50 text-green-700 ring-green-200';

        case 'rejected':
            return 'bg-red-50 text-red-700 ring-red-200';

        case 'cancelled':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


/*
|--------------------------------------------------------------------------
| PRIORITY
|--------------------------------------------------------------------------
*/

function priorityLabel(
    priority: MaintenanceRequest['priority'],
) {
    return (
        priority.charAt(0).toUpperCase() +
        priority.slice(1)
    );
}


function priorityClass(
    priority: MaintenanceRequest['priority'],
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
| DATE
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function MaintenanceRequestsIndex({
    requests,
}: Props) {

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Maintenance Requests" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                            <ClipboardList className="h-5 w-5" />

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Maintenance Requests
                            </h1>

                            <p className="mt-1 text-xs text-slate-500">
                                Report, track, and manage asset maintenance requests.
                            </p>

                        </div>

                    </div>


                    <Link
                        href="/maintenance-requests/create"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                    >

                        <Plus className="h-4 w-4" />

                        New Request

                    </Link>

                </div>


                {/* ====================================================== */}
                {/* SUMMARY */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        label="Total Requests"
                        value={requests.total}
                        icon={
                            <ClipboardList className="h-4 w-4" />
                        }
                    />


                    <SummaryCard
                        label="Submitted"
                        value={
                            requests.data.filter(
                                (request) =>
                                    request.status ===
                                    'submitted',
                            ).length
                        }
                        icon={
                            <AlertTriangle className="h-4 w-4" />
                        }
                    />


                    <SummaryCard
                        label="In Progress"
                        value={
                            requests.data.filter(
                                (request) =>
                                    request.status ===
                                    'in_progress',
                            ).length
                        }
                        icon={
                            <Wrench className="h-4 w-4" />
                        }
                    />


                    <SummaryCard
                        label="Completed"
                        value={
                            requests.data.filter(
                                (request) =>
                                    request.status ===
                                    'completed',
                            ).length
                        }
                        icon={
                            <CalendarDays className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* REQUEST LIST */}
                {/* ====================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                        <h2 className="text-sm font-bold text-slate-900">
                            Requests
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                            Maintenance issues submitted by LGU personnel.
                        </p>

                    </div>


                    {requests.data.length === 0 ? (

                        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <ClipboardList className="h-6 w-6" />

                            </div>


                            <h3 className="mt-4 text-sm font-bold text-slate-800">
                                No maintenance requests
                            </h3>


                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                No maintenance requests have been submitted yet.
                            </p>


                            <Link
                                href="/maintenance-requests/create"
                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800"
                            >

                                <Plus className="h-4 w-4" />

                                Create Request

                            </Link>

                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {requests.data.map(
                                (
                                    request,
                                ) => (

                                    <div
                                        key={
                                            request.id
                                        }
                                        className="p-5 transition hover:bg-slate-50"
                                    >

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


                                            {/* LEFT */}

                                            <div className="flex min-w-0 items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                                    <Wrench className="h-5 w-5" />

                                                </div>


                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <p className="text-xs font-bold text-slate-800">
                                                            {
                                                                request.request_code
                                                            }
                                                        </p>


                                                        <span
                                                            className={`rounded-full px-2 py-1 text-[9px] font-semibold ring-1 ring-inset ${statusClass(
                                                                request.status,
                                                            )}`}
                                                        >

                                                            {statusLabel(
                                                                request.status,
                                                            )}

                                                        </span>


                                                        <span
                                                            className={`rounded-full px-2 py-1 text-[9px] font-semibold ring-1 ring-inset ${priorityClass(
                                                                request.priority,
                                                            )}`}
                                                        >

                                                            {priorityLabel(
                                                                request.priority,
                                                            )}

                                                        </span>

                                                    </div>


                                                    <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                                                        {
                                                            request.title
                                                        }
                                                    </h3>


                                                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                        {
                                                            request.description
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            {/* RIGHT */}

                                            <div className="flex flex-wrap items-center gap-5 lg:justify-end">


                                                <InfoItem
                                                    icon={
                                                        <Wrench className="h-3.5 w-3.5" />
                                                    }
                                                    label="Asset"
                                                    value={
                                                        request
                                                            .asset
                                                            ?.asset_code ??
                                                        '—'
                                                    }
                                                />


                                                <InfoItem
                                                    icon={
                                                        <User className="h-3.5 w-3.5" />
                                                    }
                                                    label="Requested By"
                                                    value={
                                                        request
                                                            .requested_by
                                                            ?.name ??
                                                        '—'
                                                    }
                                                />


                                                <InfoItem
                                                    icon={
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                    }
                                                    label="Requested"
                                                    value={formatDate(
                                                        request.requested_at ??
                                                            request.created_at,
                                                    )}
                                                />


                                                <Link
                                                    href={`/maintenance-requests/${request.id}`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-700"
                                                    title="View request"
                                                >

                                                    <ArrowRight className="h-4 w-4" />

                                                </Link>

                                            </div>

                                        </div>

                                    </div>

                                ),
                            )}

                        </div>

                    )}

                </section>


                {/* ====================================================== */}
                {/* PAGINATION */}
                {/* ====================================================== */}

                {requests.last_page > 1 && (

                    <div className="flex flex-wrap items-center justify-center gap-2">

                        {requests.links.map(
                            (
                                link,
                                index,
                            ) => {

                                if (
                                    !link.url
                                ) {
                                    return (
                                        <span
                                            key={
                                                index
                                            }
                                            className="px-3 py-2 text-xs text-slate-300"
                                        >
                                            {link.label
                                                .replace(
                                                    '&laquo;',
                                                    '«',
                                                )
                                                .replace(
                                                    '&raquo;',
                                                    '»',
                                                )}
                                        </span>
                                    );
                                }


                                return (
                                    <Link
                                        key={
                                            index
                                        }
                                        href={
                                            link.url
                                        }
                                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                            link.active
                                                ? 'bg-blue-700 text-white'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                        preserveScroll
                                    >
                                        {link.label
                                            .replace(
                                                '&laquo;',
                                                '«',
                                            )
                                            .replace(
                                                '&raquo;',
                                                '»',
                                            )}
                                    </Link>
                                );
                            },
                        )}

                    </div>

                )}

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
    value: number;
    icon: React.ReactNode;
}) {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                    {icon}

                </div>


                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-800">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {

    return (
        <div className="min-w-[100px]">

            <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">

                {icon}

                {label}

            </div>


            <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">
                {value}
            </p>

        </div>
    );
}