import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Eye,
    Wrench,
} from 'lucide-react';

interface Asset {
    id: number;
    asset_code: string;
    name: string;
    department?: {
        id: number;
        name: string;
        code: string;
    } | null;
}

interface User {
    id: number;
    name: string;
}

interface PreventiveMaintenanceSchedule {
    id: number;
    title: string;
    frequency_type: string;
    frequency_value: number;
}

interface WorkLog {
    id: number;
    work_performed: string;
    materials_used?: string | null;
    remarks?: string | null;
    performedBy?: User | null;
}

interface MaintenanceRequest {
    id: number;
    request_code: string;

    title: string;
    description?: string | null;

    status: string;
    priority: string;

    requested_at?: string | null;
    completed_at?: string | null;

    remarks?: string | null;

    asset?: Asset | null;

    requestedBy?: User | null;
    completedBy?: User | null;

    preventiveMaintenanceSchedule?:
        | PreventiveMaintenanceSchedule
        | null;

    workLogs?: WorkLog[];
}

interface PaginatedRequests {
    data: MaintenanceRequest[];

    current_page: number;
    last_page: number;
    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    requests: PaginatedRequests;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
    {
        title: 'Maintenance History',
        href: '/maintenance-history',
    },
];

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}

function formatDateTime(
    value?: string | null,
): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}

function priorityClass(
    priority: string,
): string {
    switch (priority) {
        case 'critical':
            return 'border-red-100 bg-red-50 text-red-700';

        case 'high':
            return 'border-orange-100 bg-orange-50 text-orange-700';

        case 'medium':
            return 'border-amber-100 bg-amber-50 text-amber-700';

        case 'normal':
            return 'border-blue-100 bg-blue-50 text-blue-700';

        case 'low':
            return 'border-slate-200 bg-slate-100 text-slate-600';

        default:
            return 'border-slate-200 bg-slate-100 text-slate-600';
    }
}

export default function MaintenanceHistory({
    requests,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Maintenance History | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* HEADER */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                            <ClipboardList className="h-5 w-5" />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Maintenance History
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                View completed maintenance activities across municipal assets.
                            </p>

                        </div>

                    </div>

                    <Link
                        href="/maintenance"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <Wrench className="h-4 w-4" />
                        Maintenance Overview
                    </Link>

                </div>


                {/* SUMMARY */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Completed Maintenance"
                        value={requests.total}
                        icon={
                            <CheckCircle2 className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Showing"
                        value={requests.data.length}
                        icon={
                            <ClipboardList className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Current Page"
                        value={requests.current_page}
                        icon={
                            <CalendarDays className="h-4 w-4" />
                        }
                    />

                </div>


                {/* HISTORY */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                <CheckCircle2 className="h-4 w-4" />

                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Completed Maintenance
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Completed maintenance requests across municipal assets.
                                </p>

                            </div>

                        </div>

                        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">

                            {requests.total}{' '}
                            {requests.total === 1
                                ? 'Record'
                                : 'Records'}

                        </div>

                    </div>


                    {requests.data.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <ClipboardList className="h-6 w-6" />

                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-700">
                                No maintenance history yet
                            </h3>

                            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                                Completed maintenance requests will appear here.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* DESKTOP */}

                            <div className="hidden overflow-x-auto lg:block">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50/60">

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Request
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Asset
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Maintenance
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Priority
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Completed
                                            </th>

                                            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {requests.data.map(
                                            (request) => (

                                                <tr
                                                    key={
                                                        request.id
                                                    }
                                                    className="transition hover:bg-slate-50/60"
                                                >

                                                    {/* REQUEST */}

                                                    <td className="px-5 py-4">

                                                        <div className="text-sm font-semibold text-slate-800">
                                                            {
                                                                request.request_code
                                                            }
                                                        </div>

                                                        <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                            {
                                                                request.title
                                                            }
                                                        </div>

                                                    </td>


                                                    {/* ASSET */}

                                                    <td className="px-5 py-4">

                                                        {request.asset ? (

                                                            <>

                                                                <div className="text-sm font-semibold text-slate-700">
                                                                    {
                                                                        request
                                                                            .asset
                                                                            .name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-xs text-slate-400">
                                                                    {
                                                                        request
                                                                            .asset
                                                                            .asset_code
                                                                    }
                                                                </div>

                                                            </>

                                                        ) : (

                                                            <span className="text-xs text-slate-400">
                                                                —
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* PM */}

                                                    <td className="px-5 py-4">

                                                        {request.preventiveMaintenanceSchedule ? (

                                                            <>

                                                                <div className="text-sm font-semibold text-slate-700">
                                                                    {
                                                                        request
                                                                            .preventiveMaintenanceSchedule
                                                                            .title
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-[10px] text-blue-600">
                                                                    Preventive Maintenance
                                                                </div>

                                                            </>

                                                        ) : (

                                                            <div className="text-sm text-slate-500">
                                                                Regular Maintenance
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* PRIORITY */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${priorityClass(
                                                                request.priority,
                                                            )}`}
                                                        >
                                                            {
                                                                request.priority
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* COMPLETED */}

                                                    <td className="px-5 py-4">

                                                        <div className="text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                request.completed_at,
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-[10px] text-slate-400">
                                                            {request.completedBy
                                                                ? `By ${request.completedBy.name}`
                                                                : formatDateTime(
                                                                      request.completed_at,
                                                                  )}
                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td className="px-5 py-4 text-right">

                                                        <Link
                                                            href={`/maintenance-requests/${request.id}`}
                                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                        >

                                                            <Eye className="h-3.5 w-3.5" />

                                                            View

                                                        </Link>

                                                    </td>

                                                </tr>

                                            ),
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* MOBILE */}

                            <div className="divide-y divide-slate-100 lg:hidden">

                                {requests.data.map(
                                    (request) => (

                                        <div
                                            key={
                                                request.id
                                            }
                                            className="p-5"
                                        >

                                            <div className="flex items-start justify-between gap-4">

                                                <div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="text-sm font-bold text-slate-800">
                                                            {
                                                                request.request_code
                                                            }
                                                        </h3>

                                                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                                                            Completed
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {
                                                            request.title
                                                        }
                                                    </p>

                                                </div>

                                                <Link
                                                    href={`/maintenance-requests/${request.id}`}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                                                >

                                                    <Eye className="h-4 w-4" />

                                                </Link>

                                            </div>


                                            <div className="mt-4 grid grid-cols-2 gap-4">

                                                <InfoItem
                                                    label="Asset"
                                                    value={
                                                        request.asset
                                                            ?.name ??
                                                        '—'
                                                    }
                                                    secondary={
                                                        request.asset
                                                            ?.asset_code
                                                    }
                                                />

                                                <InfoItem
                                                    label="Maintenance"
                                                    value={
                                                        request
                                                            .preventiveMaintenanceSchedule
                                                            ?.title ??
                                                        'Regular Maintenance'
                                                    }
                                                />

                                                <InfoItem
                                                    label="Completed"
                                                    value={formatDate(
                                                        request.completed_at,
                                                    )}
                                                    secondary={
                                                        request.completedBy
                                                            ? `By ${request.completedBy.name}`
                                                            : undefined
                                                    }
                                                />

                                                <InfoItem
                                                    label="Priority"
                                                    value={
                                                        request.priority
                                                    }
                                                />

                                            </div>

                                        </div>

                                    ),
                                )}

                            </div>

                        </>

                    )}


                    {/* PAGINATION */}

                    {requests.last_page > 1 && (

                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">

                            <p className="text-xs text-slate-400">

                                Showing{' '}

                                <span className="font-semibold text-slate-600">
                                    {requests.from ?? 0}
                                </span>

                                {' '}to{' '}

                                <span className="font-semibold text-slate-600">
                                    {requests.to ?? 0}
                                </span>

                                {' '}of{' '}

                                <span className="font-semibold text-slate-600">
                                    {requests.total}
                                </span>

                            </p>

                        </div>

                    )}

                </section>

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
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
    label,
    value,
    secondary,
}: {
    label: string;
    value: string;
    secondary?: string;
}) {
    return (
        <div>

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                {value}
            </p>

            {secondary && (
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {secondary}
                </p>
            )}

        </div>
    );
}