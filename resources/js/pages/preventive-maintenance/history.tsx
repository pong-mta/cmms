import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
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
    department_id?: number | null;
    department?: {
        id: number;
        name: string;
        code: string;
    } | null;
}

interface AssignedUser {
    id: number;
    name: string;
}

interface UserReference {
    id: number;
    name: string;
}

interface WorkLog {
    id: number;
    performed_by?: number | null;
    work_performed: string;
    materials_used?: string | null;
    remarks?: string | null;
    created_at?: string | null;
    performedBy?: UserReference | null;
}

interface MaintenanceRequest {
    id: number;
    request_code: string;

    title: string;
    description?: string | null;

    status: string;

    priority?: string | null;

    requested_at?: string | null;
    completed_at?: string | null;

    remarks?: string | null;

    requested_by?: number | null;
    completed_by?: number | null;

    requestedBy?: UserReference | null;
    completedBy?: UserReference | null;

    workLogs?: WorkLog[];
}

interface Schedule {
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

    notes?: string | null;

    asset?: Asset | null;

    assignedTo?: AssignedUser | null;

    maintenanceRequests?: MaintenanceRequest[];
}

interface Props {
    schedule: Schedule;
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDate(
    value?: string | null,
): string {

    if (!value) {
        return '—';
    }

    return new Date(
        `${value.substring(0, 10)}T00:00:00`,
    ).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}


function frequencyLabel(
    type: string,
    value: number,
): string {

    const labels: Record<
        string,
        string
    > = {
        days: value === 1 ? 'Day' : 'Days',
        weeks: value === 1 ? 'Week' : 'Weeks',
        months: value === 1 ? 'Month' : 'Months',
        years: value === 1 ? 'Year' : 'Years',
    };

    return `Every ${value} ${labels[type] ?? type}`;
}


function statusLabel(
    status: string,
): string {

    return status
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}


function statusClass(
    status: string,
): string {

    switch (status) {

        case 'completed':
            return 'bg-emerald-50 text-emerald-700';

        case 'in_progress':
            return 'bg-blue-50 text-blue-700';

        case 'submitted':
        case 'assessed':
        case 'head_approved':
        case 'gso_approved':
        case 'budget_approved':
        case 'accounting_approved':
        case 'mayor_approved':
        case 'assigned':
            return 'bg-amber-50 text-amber-700';

        case 'cancelled':
            return 'bg-red-50 text-red-700';

        default:
            return 'bg-slate-100 text-slate-600';
    }
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
    {
        title: 'Preventive Maintenance',
        href: '/preventive-maintenance',
    },
    {
        title: 'History',
        href: '#',
    },
];


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function PreventiveMaintenanceHistory({
    schedule,
}: Props) {

    const requests =
        schedule.maintenanceRequests ?? [];

    const completedRequests =
        requests.filter(
            (request) =>
                request.status === 'completed',
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Preventive Maintenance History | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ==========================================================
                    HEADER
                ========================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/preventive-maintenance"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <Clock className="h-5 w-5" />
                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Preventive Maintenance History
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Complete maintenance history for this preventive maintenance schedule.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==========================================================
                    SCHEDULE SUMMARY
                ========================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <CalendarDays className="h-5 w-5" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    {schedule.title}
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Preventive maintenance schedule
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">

                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Asset
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {schedule.asset?.name ?? '—'}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {schedule.asset?.asset_code ?? '—'}
                            </p>

                        </div>


                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Frequency
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {frequencyLabel(
                                    schedule.frequency_type,
                                    schedule.frequency_value,
                                )}
                            </p>

                        </div>


                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Next Due
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {formatDate(
                                    schedule.next_due_date,
                                )}
                            </p>

                        </div>


                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Last Completed
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {formatDateTime(
                                    schedule.last_completed_at,
                                )}
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==========================================================
                    STATISTICS
                ========================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <StatCard
                        label="Total Requests"
                        value={requests.length}
                        icon={
                            <FileText className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Completed"
                        value={completedRequests.length}
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Current Status"
                        value={statusLabel(
                            schedule.status,
                        )}
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                    />

                </div>


                {/* ==========================================================
                    HISTORY
                ========================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                        <div className="flex items-center justify-between gap-3">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <HistoryIcon />
                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Maintenance History
                                    </h2>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Maintenance requests generated from this PM schedule.
                                    </p>

                                </div>

                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                {requests.length}{' '}
                                {requests.length === 1
                                    ? 'Request'
                                    : 'Requests'}
                            </span>

                        </div>

                    </div>


                    {requests.length === 0 ? (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <HistoryIcon />

                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-800">
                                No maintenance history yet
                            </h3>

                            <p className="mt-1 max-w-md text-xs text-slate-500">
                                Maintenance requests generated from this preventive maintenance schedule will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {requests.map(
                                (maintenanceRequest) => (

                                    <MaintenanceHistoryCard
                                        key={
                                            maintenanceRequest.id
                                        }
                                        request={
                                            maintenanceRequest
                                        }
                                    />

                                ),
                            )}

                        </div>

                    )}

                </section>

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
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                </div>

                <div>

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| HISTORY ICON
|--------------------------------------------------------------------------
*/

function HistoryIcon() {

    return (
        <Clock className="h-5 w-5" />
    );
}


/*
|--------------------------------------------------------------------------
| MAINTENANCE HISTORY CARD
|--------------------------------------------------------------------------
*/

function MaintenanceHistoryCard({
    request,
}: {
    request: MaintenanceRequest;
}) {

    const workLogs =
        request.workLogs ?? [];

    return (

        <div className="p-5 sm:p-6">

            {/* ==============================================================
                REQUEST HEADER
            ============================================================== */}

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                <div>

                    <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            {request.request_code}
                        </span>

                        <span
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                                request.status,
                            )}`}
                        >
                            {statusLabel(
                                request.status,
                            )}
                        </span>

                        {request.priority && (
                            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-500">
                                {request.priority}
                            </span>
                        )}

                    </div>


                    <h3 className="mt-3 text-base font-bold text-slate-900">
                        {request.title}
                    </h3>

                    {request.description && (
                        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                            {request.description}
                        </p>
                    )}

                </div>


                <Link
                    href={`/maintenance-requests/${request.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    View Request
                </Link>

            </div>


            {/* ==============================================================
                DATES
            ============================================================== */}

            <div className="mt-5 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-3">

                <InfoItem
                    label="Requested"
                    value={formatDateTime(
                        request.requested_at,
                    )}
                    icon={
                        <CalendarDays className="h-4 w-4" />
                    }
                />

                <InfoItem
                    label="Completed"
                    value={formatDateTime(
                        request.completed_at,
                    )}
                    icon={
                        <CheckCircle2 className="h-4 w-4" />
                    }
                />

                <InfoItem
                    label="Completed By"
                    value={
                        request.completedBy?.name ??
                        '—'
                    }
                    icon={
                        <User className="h-4 w-4" />
                    }
                />

            </div>


            {/* ==============================================================
                WORK LOGS
            ============================================================== */}

            {workLogs.length > 0 && (

                <div className="mt-5">

                    <div className="mb-3 flex items-center gap-2">

                        <Wrench className="h-4 w-4 text-blue-600" />

                        <h4 className="text-xs font-bold text-slate-800">
                            Work Performed
                        </h4>

                    </div>


                    <div className="space-y-3">

                        {workLogs.map(
                            (workLog) => (

                                <div
                                    key={
                                        workLog.id
                                    }
                                    className="rounded-xl border border-slate-100 bg-white p-4"
                                >

                                    <div className="flex flex-col justify-between gap-2 sm:flex-row">

                                        <div>

                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                Performed By
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                                {workLog.performedBy?.name ??
                                                    '—'}
                                            </p>

                                        </div>

                                        <p className="text-[10px] text-slate-400">
                                            {formatDateTime(
                                                workLog.created_at,
                                            )}
                                        </p>

                                    </div>


                                    <div className="mt-4">

                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                            Work Performed
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                                            {workLog.work_performed}
                                        </p>

                                    </div>


                                    {workLog.materials_used && (

                                        <div className="mt-4">

                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                Materials Used
                                            </p>

                                            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                                                {workLog.materials_used}
                                            </p>

                                        </div>

                                    )}


                                    {workLog.remarks && (

                                        <div className="mt-4">

                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                Remarks
                                            </p>

                                            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                                                {workLog.remarks}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            ),
                        )}

                    </div>

                </div>

            )}


            {/* ==============================================================
                REQUEST REMARKS
            ============================================================== */}

            {request.remarks && (

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Request Remarks
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                        {request.remarks}
                    </p>

                </div>

            )}

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
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {

    return (

        <div>

            <div className="flex items-center gap-2 text-slate-400">

                {icon}

                <p className="text-[9px] font-semibold uppercase tracking-wider">
                    {label}
                </p>

            </div>

            <p className="mt-1 text-xs font-semibold text-slate-700">
                {value}
            </p>

        </div>
    );
}