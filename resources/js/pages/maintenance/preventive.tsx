import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';


import {
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Clock3,
    AlertTriangle,
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

interface UserOption {
    id: number;
    name: string;
}

interface PreventiveMaintenanceSchedule {
    id: number;
    asset_id: number;

    title: string;
    description?: string | null;

    frequency_type: string;
    frequency_value: number;

    start_date: string;
    next_due_date: string;

    last_completed_at?: string | null;

    status: string;

    assigned_to?: UserOption | null;

    asset?: Asset | null;
    has_active_request: boolean;
    active_request_id?: number | null;
}

interface Props {
    schedules: PreventiveMaintenanceSchedule[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
    {
        title: 'Preventive Maintenance',
        href: '/preventive-maintenance',
    },
];

export default function PreventiveMaintenance({
    schedules,
}: Props) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueSchedules = schedules.filter(
        (schedule) =>
            schedule.status === 'active' &&
            new Date(schedule.next_due_date) < today,
    );

    const dueSoonSchedules = schedules.filter(
        (schedule) => {

            if (schedule.status !== 'active') {
                return false;
            }

            const dueDate =
                new Date(
                    schedule.next_due_date,
                );

            const difference =
                dueDate.getTime() -
                today.getTime();

            const days =
                difference /
                (1000 * 60 * 60 * 24);

            return days >= 0 && days <= 30;
        },
    );

    const upcomingSchedules = schedules.filter(
        (schedule) => {

            if (schedule.status !== 'active') {
                return false;
            }

            const dueDate =
                new Date(
                    schedule.next_due_date,
                );

            return dueDate > today;
        },
    );

    const activeSchedules = schedules.filter(
        (schedule) =>
            schedule.status === 'active',
    );


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Preventive Maintenance | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <CalendarClock className="h-5 w-5" />
                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Preventive Maintenance
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Manage scheduled maintenance across municipal assets.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* SUMMARY */}
                {/* ================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        icon={
                            <AlertTriangle className="h-5 w-5" />
                        }
                        label="Overdue"
                        value={
                            overdueSchedules.length
                        }
                        description="Past due date"
                    />

                    <SummaryCard
                        icon={
                            <Clock3 className="h-5 w-5" />
                        }
                        label="Due Soon"
                        value={
                            dueSoonSchedules.length
                        }
                        description="Due within 30 days"
                    />

                    <SummaryCard
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                        label="Upcoming"
                        value={
                            upcomingSchedules.length
                        }
                        description="Future schedules"
                    />

                    <SummaryCard
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                        label="Active"
                        value={
                            activeSchedules.length
                        }
                        description="Active schedules"
                    />

                </div>


                {/* ================================================== */}
                {/* SCHEDULES */}
                {/* ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Wrench className="h-5 w-5" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Preventive Maintenance Schedules
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    All scheduled maintenance activities for municipal assets.
                                </p>

                            </div>

                        </div>

                    </div>


                    {schedules.length > 0 ? (

                        <div className="divide-y divide-slate-100">

                            {schedules.map(
                                (schedule) => {

                                    const dueDate =
                                        new Date(
                                            schedule.next_due_date,
                                        );

                                    const isOverdue =
                                        schedule.status ===
                                            'active' &&
                                        dueDate <
                                            today;

                                    return (

                                        <div
                                            key={
                                                schedule.id
                                            }
                                            className="p-5 transition hover:bg-slate-50/50 sm:p-6"
                                        >

                                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="text-sm font-bold text-slate-900">
                                                            {
                                                                schedule.title
                                                            }
                                                        </h3>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                                                                isOverdue
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : 'bg-blue-50 text-blue-700'
                                                            }`}
                                                        >
                                                            {isOverdue
                                                                ? 'Overdue'
                                                                : formatStatus(
                                                                    schedule.status,
                                                                )}
                                                        </span>

                                                    </div>


                                                    {schedule.description && (
                                                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                                                            {
                                                                schedule.description
                                                            }
                                                        </p>
                                                    )}


                                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-500">

                                                        <span>
                                                            Asset:{' '}

                                                            <span className="font-semibold text-slate-700">
                                                                {
                                                                    schedule
                                                                        .asset
                                                                        ?.name ??
                                                                    '—'
                                                                }
                                                            </span>
                                                        </span>


                                                        <span>
                                                            Code:{' '}

                                                            <span className="font-semibold text-slate-700">
                                                                {
                                                                    schedule
                                                                        .asset
                                                                        ?.asset_code ??
                                                                    '—'
                                                                }
                                                            </span>
                                                        </span>


                                                        <span>
                                                            Department:{' '}

                                                            <span className="font-semibold text-slate-700">
                                                                {
                                                                    schedule
                                                                        .asset
                                                                        ?.department
                                                                        ?.name ??
                                                                    '—'
                                                                }
                                                            </span>
                                                        </span>

                                                    </div>

                                                </div>


                                                <div className="grid shrink-0 grid-cols-3 gap-5 lg:min-w-[390px]">

                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Frequency
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold capitalize text-slate-700">
                                                            Every{' '}

                                                            {
                                                                schedule.frequency_value
                                                            }{' '}

                                                            {
                                                                schedule.frequency_type
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Next Due
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-xs font-semibold ${
                                                                isOverdue
                                                                    ? 'text-red-700'
                                                                    : 'text-slate-700'
                                                            }`}
                                                        >
                                                            {
                                                                formatDate(
                                                                    schedule.next_due_date,
                                                                )
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Assigned To
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-slate-700">
                                                            {
                                                                schedule
                                                                    .assigned_to
                                                                    ?.name ??
                                                                '—'
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                           <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">

                                                {/* EDIT */}

                                                <Link
                                                    href={`/preventive-maintenance/${schedule.id}/edit`}
                                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                                                >
                                                    Edit
                                                </Link>

                                                <Link
                                                    href={`/preventive-maintenance/${schedule.id}/history`}
                                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                                                >
                                                    History
                                                </Link>


                                                {/* VIEW ASSET */}

                                                <Link
                                                    href={`/assets/${schedule.asset_id}`}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                >
                                                    View Asset
                                                </Link>


                                                {/* ACTIVE */}

                                                {schedule.status === 'active' && (
                                                    <>
                                                        {schedule.has_active_request ? (
                                                            <Link
                                                                href={`/maintenance-requests/${schedule.active_request_id}`}
                                                                className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                            >
                                                                View Maintenance Request
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (
                                                                        !confirm(
                                                                            'Create a maintenance request for this preventive maintenance schedule?'
                                                                        )
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    router.post(
                                                                        `/preventive-maintenance/${schedule.id}/create-request`
                                                                    );
                                                                }}
                                                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                                            >
                                                                Create Maintenance Request
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    !confirm(
                                                                        'Pause this preventive maintenance schedule?'
                                                                    )
                                                                ) {
                                                                    return;
                                                                }

                                                                router.post(
                                                                    `/preventive-maintenance/${schedule.id}/pause`
                                                                );
                                                            }}
                                                            className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                        >
                                                            Pause
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    !confirm(
                                                                        'Cancel this preventive maintenance schedule? This will keep its history but stop the schedule.'
                                                                    )
                                                                ) {
                                                                    return;
                                                                }

                                                                router.post(
                                                                    `/preventive-maintenance/${schedule.id}/cancel`
                                                                );
                                                            }}
                                                            className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}


                                                {/* PAUSED */}

                                                {schedule.status === 'paused' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    !confirm(
                                                                        'Resume this preventive maintenance schedule?'
                                                                    )
                                                                ) {
                                                                    return;
                                                                }

                                                                router.post(
                                                                    `/preventive-maintenance/${schedule.id}/resume`
                                                                );
                                                            }}
                                                            className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            Resume
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    !confirm(
                                                                        'Cancel this preventive maintenance schedule? This will keep its history but stop the schedule.'
                                                                    )
                                                                ) {
                                                                    return;
                                                                }

                                                                router.post(
                                                                    `/preventive-maintenance/${schedule.id}/cancel`
                                                                );
                                                            }}
                                                            className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}


                                                {/* CANCELLED */}

                                                {schedule.status === 'cancelled' && (
                                                    <span className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                                                        Cancelled
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    );
                                },
                            )}

                        </div>

                    ) : (

                        <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <CalendarClock className="h-7 w-7" />

                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                No preventive maintenance schedules
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                Create a preventive maintenance schedule from an asset to start managing recurring maintenance.
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
    icon,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    description: string;
}) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                </div>

                <span className="text-2xl font-bold text-slate-900">
                    {value}
                </span>

            </div>

            <p className="mt-4 text-xs font-bold text-slate-800">
                {label}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
                {description}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(
    value: string,
): string {

    if (!value) {
        return '—';
    }

    const date =
        new Date(value);

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        },
    );
}


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function formatStatus(
    value: string,
): string {

    return value
        .replaceAll(
            '_',
            ' ',
        )
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}