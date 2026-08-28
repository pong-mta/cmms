import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Wrench,
} from 'lucide-react';

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

interface MaintenanceType {
    id: number;
    name: string;
    code: string;
}

interface AssignedUser {
    id: number;
    name: string;
}

interface MaintenanceRecord {
    id: number;
    maintenance_code: string;

    asset?: Asset | null;
    maintenanceType?: MaintenanceType | null;
    department?: Department | null;
    assignedTo?: AssignedUser | null;

    problem?: string | null;
    solution?: string | null;

    maintenance_type_id?: number | null;

    status: string;
    priority: string;

    scheduled_date?: string | null;
    completed_at?: string | null;

    actual_cost?: number | null;
    remarks?: string | null;
}

interface PaginatedRecords {
    data: MaintenanceRecord[];

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
    records: PaginatedRecords;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
    {
        title: 'Maintenance History',
        href: '/maintenance/history',
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

function formatCurrency(
    value?: number | null,
): string {
    if (
        value === null ||
        value === undefined
    ) {
        return '—';
    }

    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        },
    ).format(value);
}

function priorityClass(
    priority: string,
): string {
    switch (priority) {
        case 'critical':
            return 'bg-red-50 text-red-700 border-red-100';

        case 'high':
            return 'bg-orange-50 text-orange-700 border-orange-100';

        case 'normal':
            return 'bg-blue-50 text-blue-700 border-blue-100';

        case 'low':
            return 'bg-slate-100 text-slate-600 border-slate-200';

        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

export default function MaintenanceHistory({
    records,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance History | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ==========================================================
                    HEADER
                ========================================================== */}

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


                {/* ==========================================================
                    SUMMARY
                ========================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Completed Maintenance"
                        value={records.total}
                        icon={
                            <CheckCircle2 className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Showing"
                        value={
                            records.data.length
                        }
                        icon={
                            <ClipboardList className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Current Page"
                        value={
                            records.current_page
                        }
                        icon={
                            <CalendarDays className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ==========================================================
                    HISTORY TABLE
                ========================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Completed Maintenance
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Historical maintenance records for municipal assets.
                                </p>

                            </div>

                        </div>

                        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                            {records.total}{' '}
                            {records.total === 1
                                ? 'Record'
                                : 'Records'}
                        </div>

                    </div>


                    {records.data.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <ClipboardList className="h-6 w-6" />

                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-700">
                                No maintenance history yet
                            </h3>

                            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                                Completed maintenance records will appear here once maintenance work has been completed.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* ==================================================
                                DESKTOP TABLE
                            ================================================== */}

                            <div className="hidden overflow-x-auto lg:block">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50/60">

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
                                                Priority
                                            </th>

                                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Completed
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

                                        {records.data.map(
                                            (
                                                record,
                                            ) => (

                                                <tr
                                                    key={
                                                        record.id
                                                    }
                                                    className="transition hover:bg-slate-50/60"
                                                >

                                                    {/* MAINTENANCE */}

                                                    <td className="px-5 py-4">

                                                        <div className="font-semibold text-sm text-slate-800">
                                                            {
                                                                record.maintenance_code
                                                            }
                                                        </div>

                                                        <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                            {
                                                                record.problem ??
                                                                'Maintenance activity'
                                                            }
                                                        </div>

                                                    </td>


                                                    {/* ASSET */}

                                                    <td className="px-5 py-4">

                                                        {record.asset ? (

                                                            <>

                                                                <div className="text-sm font-semibold text-slate-700">
                                                                    {
                                                                        record
                                                                            .asset
                                                                            .name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-xs text-slate-400">
                                                                    {
                                                                        record
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


                                                    {/* TYPE */}

                                                    <td className="px-5 py-4">

                                                        <div className="text-sm text-slate-600">
                                                            {
                                                                record
                                                                    .maintenanceType
                                                                    ?.name ??
                                                                '—'
                                                            }
                                                        </div>

                                                        {record
                                                            .maintenanceType
                                                            ?.code && (

                                                            <div className="mt-1 text-[10px] text-slate-400">
                                                                {
                                                                    record
                                                                        .maintenanceType
                                                                        .code
                                                                }
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* PRIORITY */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${priorityClass(
                                                                record.priority,
                                                            )}`}
                                                        >
                                                            {
                                                                record.priority
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* COMPLETED */}

                                                    <td className="px-5 py-4">

                                                        <div className="text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                record.completed_at,
                                                            )}
                                                        </div>

                                                        <div className="mt-1 text-[10px] text-slate-400">
                                                            {formatDateTime(
                                                                record.completed_at,
                                                            )}
                                                        </div>

                                                    </td>


                                                    {/* COST */}

                                                    <td className="px-5 py-4 text-right">

                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {formatCurrency(
                                                                record.actual_cost,
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td className="px-5 py-4 text-right">

                                                        <Link
                                                            href={`/maintenance/${record.id}`}
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


                            {/* ==================================================
                                MOBILE / TABLET CARDS
                            ================================================== */}

                            <div className="divide-y divide-slate-100 lg:hidden">

                                {records.data.map(
                                    (
                                        record,
                                    ) => (

                                        <div
                                            key={
                                                record.id
                                            }
                                            className="p-5"
                                        >

                                            <div className="flex items-start justify-between gap-4">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="text-sm font-bold text-slate-800">
                                                            {
                                                                record.maintenance_code
                                                            }
                                                        </h3>

                                                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                                                            Completed
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 truncate text-xs text-slate-400">
                                                        {
                                                            record.problem ??
                                                            'Maintenance activity'
                                                        }
                                                    </p>

                                                </div>

                                                <Link
                                                    href={`/maintenance/${record.id}`}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                                                    title="View maintenance record"
                                                >

                                                    <Eye className="h-4 w-4" />

                                                </Link>

                                            </div>


                                            <div className="mt-4 grid grid-cols-2 gap-4">

                                                <InfoItem
                                                    label="Asset"
                                                    value={
                                                        record.asset
                                                            ? record
                                                                  .asset
                                                                  .name
                                                            : '—'
                                                    }
                                                    secondary={
                                                        record.asset
                                                            ?.asset_code
                                                    }
                                                />

                                                <InfoItem
                                                    label="Type"
                                                    value={
                                                        record
                                                            .maintenanceType
                                                            ?.name ??
                                                        '—'
                                                    }
                                                />

                                                <InfoItem
                                                    label="Completed"
                                                    value={formatDate(
                                                        record.completed_at,
                                                    )}
                                                    secondary={formatDateTime(
                                                        record.completed_at,
                                                    )}
                                                />

                                                <InfoItem
                                                    label="Cost"
                                                    value={formatCurrency(
                                                        record.actual_cost,
                                                    )}
                                                />

                                            </div>

                                        </div>

                                    ),
                                )}

                            </div>

                        </>

                    )}


                    {/* ==========================================================
                        PAGINATION
                    ========================================================== */}

                    {records.last_page > 1 && (

                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <p className="text-xs text-slate-400">

                                Showing{' '}

                                <span className="font-semibold text-slate-600">
                                    {records.from ?? 0}
                                </span>

                                {' '}to{' '}

                                <span className="font-semibold text-slate-600">
                                    {records.to ?? 0}
                                </span>

                                {' '}of{' '}

                                <span className="font-semibold text-slate-600">
                                    {records.total}
                                </span>

                            </p>


                            <div className="flex items-center gap-1">

                                {records.links.map(
                                    (
                                        link,
                                        index,
                                    ) => {

                                        if (
                                            index ===
                                            0
                                        ) {

                                            return (

                                                <PaginationButton
                                                    key={`previous-${index}`}
                                                    href={
                                                        link.url
                                                    }
                                                    disabled={
                                                        !link.url
                                                    }
                                                    icon={
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    }
                                                    label=""
                                                />

                                            );

                                        }


                                        if (
                                            index ===
                                            records.links.length -
                                                1
                                        ) {

                                            return (

                                                <PaginationButton
                                                    key={`next-${index}`}
                                                    href={
                                                        link.url
                                                    }
                                                    disabled={
                                                        !link.url
                                                    }
                                                    icon={
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    }
                                                    label=""
                                                />

                                            );

                                        }


                                        return (

                                            <PaginationButton
                                                key={
                                                    link.label
                                                }
                                                href={
                                                    link.url
                                                }
                                                disabled={
                                                    !link.url
                                                }
                                                active={
                                                    link.active
                                                }
                                                label={
                                                    link.label
                                                }
                                            />

                                        );

                                    },
                                )}

                            </div>

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


/*
|--------------------------------------------------------------------------
| PAGINATION BUTTON
|--------------------------------------------------------------------------
*/

function PaginationButton({
    href,
    label,
    icon,
    active = false,
    disabled = false,
}: {
    href: string | null;
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
    disabled?: boolean;
}) {
    if (
        disabled ||
        !href
    ) {
        return (
            <span className="flex h-8 min-w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-2 text-xs text-slate-300">
                {icon ?? label}
            </span>
        );
    }

    return (
        <Link
            href={href}
            preserveScroll
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                active
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
        >
            {icon ?? label}
        </Link>
    );
}