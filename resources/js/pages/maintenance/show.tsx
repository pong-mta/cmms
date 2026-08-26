import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    AlertTriangle,
    Archive,
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    DollarSign,
    FileText,
    User,
    Wrench,
} from 'lucide-react';


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

interface UserOption {
    id: number;
    name: string;
    phone?: string | null;
}

interface MaintenanceRecord {
    id: number;

    maintenance_code: string;

    asset?: Asset | null;

    maintenance_type?: MaintenanceType | null;

    department?: Department | null;

    requested_by?: number | null;
    assigned_to?: number | null;

    requested_by_user?: UserOption | null;
    assigned_to_user?: UserOption | null;

    requested_by_user?: UserOption | null;

    scheduled_date?: string | null;

    started_at?: string | null;

    completed_at?: string | null;

    problem?: string | null;

    description?: string | null;

    work_performed?: string | null;

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

    remarks?: string | null;

    created_at: string;

    updated_at: string;
}

interface MaintenanceShowProps {
    record: MaintenanceRecord;
}


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
            month: 'long',
            day: 'numeric',
        },
    );
}


function formatDateTime(
    value?: string | null,
) {
    if (!value) {
        return '—';
    }

    return new Date(
        value,
    ).toLocaleString(
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
    value?: string | number | null,
) {
    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
        },
    ).format(
        Number(value ?? 0),
    );
}


export default function MaintenanceShow({
    record,
}: MaintenanceShowProps) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Maintenance',
            href: '/maintenance',
        },
        {
            title: record.maintenance_code,
            href: `/maintenance/${record.id}`,
        },
    ];


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head
                title={`${record.maintenance_code} | CMMS`}
            />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/maintenance"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Wrench className="h-5 w-5" />
                        </div>


                        <div>

                            <div className="flex flex-wrap items-center gap-2">

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {record.maintenance_code}
                                </h1>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                        record.status,
                                    )}`}
                                >
                                    {statusLabel(
                                        record.status,
                                    )}
                                </span>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">

                                {record.maintenance_type?.name ??
                                    'Maintenance Record'}

                                {record.asset && (
                                    <>
                                        {' • '}
                                        {record.asset.name}
                                    </>
                                )}

                            </p>

                        </div>

                    </div>


                    <Link
                        href="/maintenance"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Maintenance
                    </Link>

                </div>


                {/* ====================================================== */}
                {/* SUMMARY */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        label="Asset"
                        value={
                            record.asset?.name ??
                            '—'
                        }
                        icon={
                            <Archive className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Maintenance Type"
                        value={
                            record.maintenance_type
                                ?.name ??
                            '—'
                        }
                        icon={
                            <Wrench className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Priority"
                        value={priorityLabel(
                            record.priority,
                        )}
                        valueClass={
                            record.priority ===
                            'critical'
                                ? 'text-red-700'
                                : undefined
                        }
                        icon={
                            <AlertTriangle className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Total Cost"
                        value={formatCurrency(
                            record.total_cost,
                        )}
                        icon={
                            <DollarSign className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* MAIN GRID */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                    {/* ================================================== */}
                    {/* LEFT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* ASSET */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <Archive className="h-5 w-5" />
                            }
                            title="Asset"
                            description="Asset associated with this maintenance activity."
                        >

                            {record.asset ? (

                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <Archive className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-slate-800">
                                                {record.asset.name}
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-blue-700">
                                                {record.asset.asset_code}
                                            </p>

                                        </div>

                                    </div>


                                    <Link
                                        href={`/assets/${record.asset.id}`}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        View Asset
                                    </Link>

                                </div>

                            ) : (

                                <p className="text-sm text-slate-400">
                                    No asset information available.
                                </p>

                            )}

                        </DetailSection>


                        {/* ================================================== */}
                        {/* MAINTENANCE INFORMATION */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <ClipboardIcon />
                            }
                            title="Maintenance Information"
                            description="Classification and responsibility."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

                                <DetailItem
                                    label="Maintenance Code"
                                    value={
                                        record.maintenance_code
                                    }
                                />

                                <DetailItem
                                    label="Maintenance Type"
                                    value={
                                        record.maintenance_type
                                            ? `${record.maintenance_type.name} (${record.maintenance_type.code})`
                                            : null
                                    }
                                />

                                <DetailItem
                                    label="Department"
                                    value={
                                        record.department
                                            ? `${record.department.name} (${record.department.code})`
                                            : null
                                    }
                                />

                                <DetailItem
                                    label="Priority"
                                    value={priorityLabel(
                                        record.priority,
                                    )}
                                />

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* REQUEST & ASSIGNMENT */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <User className="h-5 w-5" />
                            }
                            title="Request & Assignment"
                            description="People involved in this maintenance activity."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

                                <DetailItem
                                    label="Requested By"
                                    value={
                                        record
                                            .requested_by_user
                                            ?.name
                                    }
                                />

                                <DetailItem
                                    label="Assigned To"
                                    value={
                                        record
                                            .assigned_to_user
                                            ?.name
                                    }
                                />

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* SCHEDULE */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <CalendarDays className="h-5 w-5" />
                            }
                            title="Schedule"
                            description="Maintenance schedule and service timeline."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-3">

                                <DetailItem
                                    label="Scheduled Date"
                                    value={formatDate(
                                        record.scheduled_date,
                                    )}
                                />

                                <DetailItem
                                    label="Started"
                                    value={formatDateTime(
                                        record.started_at,
                                    )}
                                />

                                <DetailItem
                                    label="Completed"
                                    value={formatDateTime(
                                        record.completed_at,
                                    )}
                                />

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* WORK DETAILS */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <FileText className="h-5 w-5" />
                            }
                            title="Maintenance Details"
                            description="Problem, diagnosis, and work performed."
                        >

                            <div className="space-y-6">

                                <TextBlock
                                    label="Problem / Complaint"
                                    value={
                                        record.problem
                                    }
                                />

                                <TextBlock
                                    label="Description / Diagnosis"
                                    value={
                                        record.description
                                    }
                                />

                                <TextBlock
                                    label="Work Performed"
                                    value={
                                        record.work_performed
                                    }
                                />

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* REMARKS */}
                        {/* ================================================== */}

                        {record.remarks && (

                            <DetailSection
                                icon={
                                    <FileText className="h-5 w-5" />
                                }
                                title="Remarks"
                                description="Additional observations and recommendations."
                            >

                                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                                    {record.remarks}
                                </p>

                            </DetailSection>

                        )}

                    </div>


                    {/* ================================================== */}
                    {/* RIGHT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* STATUS */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Wrench className="h-5 w-5" />
                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Maintenance Status
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Current workflow state
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 space-y-2">

                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                                    <span className="text-xs font-medium text-slate-500">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                            record.status,
                                        )}`}
                                    >
                                        {statusLabel(
                                            record.status,
                                        )}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                                    <span className="text-xs font-medium text-slate-500">
                                        Priority
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priorityClass(
                                            record.priority,
                                        )}`}
                                    >
                                        {priorityLabel(
                                            record.priority,
                                        )}
                                    </span>

                                </div>

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* COST BREAKDOWN */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <DollarSign className="h-5 w-5" />
                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Cost Breakdown
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Maintenance expenses
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 space-y-3">

                                <CostRow
                                    label="Labor Cost"
                                    value={
                                        record.labor_cost
                                    }
                                />

                                <CostRow
                                    label="Parts Cost"
                                    value={
                                        record.parts_cost
                                    }
                                />

                                <CostRow
                                    label="Other Cost"
                                    value={
                                        record.other_cost
                                    }
                                />


                                <div className="border-t border-slate-100 pt-3">

                                    <div className="flex items-center justify-between">

                                        <span className="text-xs font-bold text-slate-700">
                                            Total
                                        </span>

                                        <span className="text-lg font-bold text-blue-700">
                                            {formatCurrency(
                                                record.total_cost,
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* TIMELINE */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                    <Clock3 className="h-5 w-5" />
                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Record Timeline
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Maintenance activity
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 space-y-5">

                                <TimelineItem
                                    label="Record Created"
                                    value={formatDateTime(
                                        record.created_at,
                                    )}
                                    active
                                />

                                <TimelineItem
                                    label="Scheduled"
                                    value={formatDate(
                                        record.scheduled_date,
                                    )}
                                    active={
                                        Boolean(
                                            record.scheduled_date,
                                        )
                                    }
                                />

                                <TimelineItem
                                    label="Started"
                                    value={formatDateTime(
                                        record.started_at,
                                    )}
                                    active={
                                        Boolean(
                                            record.started_at,
                                        )
                                    }
                                />

                                <TimelineItem
                                    label="Completed"
                                    value={formatDateTime(
                                        record.completed_at,
                                    )}
                                    active={
                                        Boolean(
                                            record.completed_at,
                                        )
                                    }
                                />

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* RECORD INFO */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <h2 className="text-sm font-bold text-slate-900">
                                Record Information
                            </h2>

                            <div className="mt-4 space-y-3">

                                <RecordRow
                                    label="Record ID"
                                    value={`#${record.id}`}
                                />

                                <RecordRow
                                    label="Created"
                                    value={formatDateTime(
                                        record.created_at,
                                    )}
                                />

                                <RecordRow
                                    label="Updated"
                                    value={formatDateTime(
                                        record.updated_at,
                                    )}
                                />

                            </div>

                        </section>

                    </div>

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
    valueClass = 'text-slate-800',
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    valueClass?: string;
}) {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                </div>

                <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-1 truncate text-xs font-bold ${valueClass}`}
                    >
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DETAIL SECTION
|--------------------------------------------------------------------------
*/

function DetailSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        {icon}
                    </div>

                    <div>

                        <h2 className="text-sm font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                            {description}
                        </p>

                    </div>

                </div>

            </div>

            <div className="p-5 sm:p-6">
                {children}
            </div>

        </section>
    );
}


/*
|--------------------------------------------------------------------------
| DETAIL ITEM
|--------------------------------------------------------------------------
*/

function DetailItem({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {

    return (
        <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {value || '—'}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| TEXT BLOCK
|--------------------------------------------------------------------------
*/

function TextBlock({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {

    return (
        <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {value || 'No information recorded.'}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| COST ROW
|--------------------------------------------------------------------------
*/

function CostRow({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {

    return (
        <div className="flex items-center justify-between">

            <span className="text-xs text-slate-500">
                {label}
            </span>

            <span className="text-xs font-semibold text-slate-700">
                {formatCurrency(value)}
            </span>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| TIMELINE ITEM
|--------------------------------------------------------------------------
*/

function TimelineItem({
    label,
    value,
    active = false,
}: {
    label: string;
    value: string;
    active?: boolean;
}) {

    return (
        <div className="flex gap-3">

            <div className="relative flex flex-col items-center">

                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        active
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                >
                    {active ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <Clock3 className="h-4 w-4" />
                    )}
                </div>

            </div>

            <div className="pt-1">

                <p className="text-xs font-semibold text-slate-700">
                    {label}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                    {value}
                </p>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| RECORD ROW
|--------------------------------------------------------------------------
*/

function RecordRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {

    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-[10px] font-medium text-slate-400">
                {label}
            </span>

            <span className="text-right text-[10px] font-semibold text-slate-600">
                {value}
            </span>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| CLIPBOARD ICON
|--------------------------------------------------------------------------
*/

function ClipboardIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="2"
            />

            <path d="M9 3v2h6V3" />

            <path d="M8 11h8" />

            <path d="M8 15h6" />
        </svg>
    );
}