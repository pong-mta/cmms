import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    MapPin,
    Package,
    User,
    Wrench,
} from 'lucide-react';


interface Department {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    phone?: string;
}

interface Asset {
    id: number;
    asset_code: string;
    name: string;
}

interface History {
    id: number;
    action: string;
    from_status?: string | null;
    to_status?: string | null;
    remarks?: string | null;
    created_at: string;
    user?: User | null;
}

interface Attachment {
    id: number;
    original_name: string;
    file_name: string;
    path: string;
    mime_type?: string | null;
    size?: number | null;
    description?: string | null;
    created_at: string;
    uploaded_by?: User | null;
}

interface ServiceRequest {
    id: number;
    request_code: string;
    request_type: string;
    subject: string;
    description?: string | null;

    priority: string;
    status: string;

    location?: string | null;

    requested_at?: string | null;
    reviewed_at?: string | null;
    approved_at?: string | null;
    assigned_at?: string | null;
    completed_at?: string | null;

    remarks?: string | null;

    department?: Department | null;

    requested_by?: User | null;

    assigned_department?: Department | null;

    assigned_to?: User | null;

    asset?: Asset | null;

    reviewed_by?: User | null;

    approved_by?: User | null;

    completed_by?: User | null;

    histories?: History[];

    attachments?: Attachment[];
}

interface Props {
    request: ServiceRequest;

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
| HELPERS
|--------------------------------------------------------------------------
*/

function formatStatus(
    status?: string | null,
): string {

    if (!status) {
        return '—';
    }

    return status
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}


function formatDate(
    date?: string | null,
): string {

    if (!date) {
        return '—';
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    ).format(new Date(date));
}


function priorityClasses(
    priority?: string | null,
): string {

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


function statusClasses(
    status?: string | null,
): string {

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

        case 'rejected':
        case 'declined':
            return 'bg-red-50 text-red-700 ring-red-200';

        case 'archived':
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

export default function ShowRequest({
    request,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Operations',
            href: '/operations/requests',
        },
        {
            title: 'Requests',
            href: '/operations/requests',
        },
        {
            title: request.request_code,
            href: `/operations/requests/${request.id}`,
        },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head
                title={`${request.request_code} | Request`}
            />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div>

                    <Link
                        href="/operations/requests"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                    >

                        <ArrowLeft className="h-4 w-4" />

                        Back to Requests

                    </Link>


                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                        <div>

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-sm font-bold text-blue-700">
                                    {request.request_code}
                                </span>


                                <span
                                    className={[
                                        'rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
                                        statusClasses(
                                            request.status,
                                        ),
                                    ].join(' ')}
                                >
                                    {formatStatus(
                                        request.status,
                                    )}
                                </span>


                                <span
                                    className={[
                                        'rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
                                        priorityClasses(
                                            request.priority,
                                        ),
                                    ].join(' ')}
                                >
                                    {formatStatus(
                                        request.priority,
                                    )}
                                </span>

                            </div>


                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {request.subject}
                            </h1>


                            <p className="mt-1 text-sm text-slate-500">
                                {formatStatus(
                                    request.request_type,
                                )}
                                {' • '}
                                Requested{' '}
                                {formatDate(
                                    request.requested_at ??
                                    undefined,
                                )}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* STATUS BANNER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                            <ClipboardIcon />

                        </div>


                        <div>

                            <p className="text-xs font-medium text-blue-600">
                                Requesting Department
                            </p>

                            <p className="text-sm font-semibold text-slate-800">
                                {request.department?.name ??
                                    '—'}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* MAIN GRID */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-3">


                    {/* ================================================== */}
                    {/* LEFT */}
                    {/* ================================================== */}

                    <div className="space-y-6 xl:col-span-2">


                        {/* ================================================== */}
                        {/* REQUEST DETAILS */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Request Details
                                </h2>

                            </div>


                            <div className="p-5">

                                <div className="grid gap-5 sm:grid-cols-2">


                                    <InfoItem
                                        icon={
                                            <FileText className="h-4 w-4" />
                                        }
                                        label="Request Type"
                                        value={formatStatus(
                                            request.request_type,
                                        )}
                                    />


                                    <InfoItem
                                        icon={
                                            <Clock3 className="h-4 w-4" />
                                        }
                                        label="Status"
                                        value={formatStatus(
                                            request.status,
                                        )}
                                    />


                                    <InfoItem
                                        icon={
                                            <User className="h-4 w-4" />
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
                                            <CalendarDays className="h-4 w-4" />
                                        }
                                        label="Requested Date"
                                        value={formatDate(
                                            request.requested_at,
                                        )}
                                    />


                                    <InfoItem
                                        icon={
                                            <MapPin className="h-4 w-4" />
                                        }
                                        label="Location"
                                        value={
                                            request.location ??
                                            '—'
                                        }
                                    />


                                    <InfoItem
                                        icon={
                                            <Package className="h-4 w-4" />
                                        }
                                        label="Related Asset"
                                        value={
                                            request.asset
                                                ? `${request.asset.asset_code} — ${request.asset.name}`
                                                : '—'
                                        }
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="mt-6 border-t border-slate-100 pt-5">

                                    <p className="mb-2 text-xs font-semibold text-slate-500">
                                        Description
                                    </p>


                                    <div className="rounded-xl bg-slate-50 px-4 py-3">

                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                            {request.description ||
                                                'No description provided.'}
                                        </p>

                                    </div>

                                </div>


                                {/* REMARKS */}

                                {request.remarks && (

                                    <div className="mt-5">

                                        <p className="mb-2 text-xs font-semibold text-slate-500">
                                            Remarks
                                        </p>


                                        <div className="rounded-xl bg-slate-50 px-4 py-3">

                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                {
                                                    request.remarks
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* ASSIGNMENT */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Assignment
                                </h2>

                            </div>


                            <div className="grid gap-5 p-5 sm:grid-cols-2">

                                <InfoItem
                                    icon={
                                        <BuildingIcon />
                                    }
                                    label="Assigned Department"
                                    value={
                                        request
                                            .assigned_department
                                            ?.name ??
                                        'Not assigned'
                                    }
                                />


                                <InfoItem
                                    icon={
                                        <User className="h-4 w-4" />
                                    }
                                    label="Assigned To"
                                    value={
                                        request
                                            .assigned_to
                                            ?.name ??
                                        'Not assigned'
                                    }
                                />


                                <InfoItem
                                    icon={
                                        <CalendarDays className="h-4 w-4" />
                                    }
                                    label="Assigned Date"
                                    value={formatDate(
                                        request.assigned_at,
                                    )}
                                />

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* ATTACHMENTS */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Attachments
                                </h2>

                            </div>


                            <div className="p-5">

                                {request.attachments &&
                                request.attachments.length >
                                    0 ? (

                                    <div className="space-y-2">

                                        {request.attachments.map(
                                            (
                                                attachment,
                                            ) => (

                                                <div
                                                    key={
                                                        attachment.id
                                                    }
                                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                                >

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">

                                                            <FileText className="h-4 w-4" />

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-semibold text-slate-700">
                                                                {
                                                                    attachment.original_name
                                                                }
                                                            </p>


                                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                                                Uploaded by{' '}
                                                                {
                                                                    attachment
                                                                        .uploaded_by
                                                                        ?.name ??
                                                                    'Unknown'
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            ),
                                        )}

                                    </div>

                                ) : (

                                    <div className="flex flex-col items-center justify-center py-8 text-center">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">

                                            <FileText className="h-5 w-5" />

                                        </div>


                                        <p className="mt-3 text-xs font-semibold text-slate-700">
                                            No attachments
                                        </p>


                                        <p className="mt-1 text-[10px] text-slate-400">
                                            No files have been attached to this request.
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>

                    </div>


                    {/* ================================================== */}
                    {/* RIGHT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* WORKFLOW */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Request Timeline
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Request activity history
                                </p>

                            </div>


                            <div className="p-5">

                                {request.histories &&
                                request.histories.length >
                                    0 ? (

                                    <div className="space-y-5">

                                        {request.histories.map(
                                            (
                                                history,
                                                index,
                                            ) => (

                                                <div
                                                    key={
                                                        history.id
                                                    }
                                                    className="relative flex gap-3"
                                                >

                                                    {index <
                                                        request
                                                            .histories!
                                                            .length -
                                                            1 && (

                                                        <div className="absolute left-[11px] top-7 h-[calc(100%+8px)] w-px bg-slate-200" />

                                                    )}


                                                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <p className="text-xs font-semibold text-slate-800">
                                                            {formatStatus(
                                                                history.action,
                                                            )}
                                                        </p>


                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            {
                                                                history
                                                                    .user
                                                                    ?.name
                                                            }
                                                            {' • '}
                                                            {formatDate(
                                                                history.created_at,
                                                            )}
                                                        </p>


                                                        {history.remarks && (

                                                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                                                {
                                                                    history.remarks
                                                                }
                                                            </p>

                                                        )}

                                                    </div>

                                                </div>

                                            ),
                                        )}

                                    </div>

                                ) : (

                                    <p className="py-5 text-center text-xs text-slate-400">
                                        No activity recorded.
                                    </p>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* APPROVAL INFORMATION */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Workflow Information
                                </h2>

                            </div>


                            <div className="divide-y divide-slate-100">

                                <WorkflowItem
                                    label="Reviewed By"
                                    value={
                                        request
                                            .reviewed_by
                                            ?.name ??
                                        'Not reviewed'
                                    }
                                    date={
                                        request.reviewed_at
                                    }
                                />


                                <WorkflowItem
                                    label="Approved By"
                                    value={
                                        request
                                            .approved_by
                                            ?.name ??
                                        'Not approved'
                                    }
                                    date={
                                        request.approved_at
                                    }
                                />


                                <WorkflowItem
                                    label="Completed By"
                                    value={
                                        request
                                            .completed_by
                                            ?.name ??
                                        'Not completed'
                                    }
                                    date={
                                        request.completed_at
                                    }
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

        <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">

                {icon}

            </div>


            <div className="min-w-0">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </p>


                <p className="mt-1 break-words text-xs font-medium text-slate-700">
                    {value}
                </p>

            </div>

        </div>

    );
}


/*
|--------------------------------------------------------------------------
| WORKFLOW ITEM
|--------------------------------------------------------------------------
*/

function WorkflowItem({
    label,
    value,
    date,
}: {
    label: string;
    value: string;
    date?: string | null;
}) {

    return (

        <div className="px-5 py-4">

            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>


            <p className="mt-1 text-xs font-semibold text-slate-700">
                {value}
            </p>


            {date && (

                <p className="mt-1 text-[10px] text-slate-400">
                    {formatDate(date)}
                </p>

            )}

        </div>

    );
}


/*
|--------------------------------------------------------------------------
| SMALL ICON COMPONENTS
|--------------------------------------------------------------------------
*/

function ClipboardIcon() {

    return (
        <ClipboardListIcon />
    );
}


function ClipboardListIcon() {

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
        >
            <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
            />
            <path d="M9 3h6" />
            <path d="M9 8h6" />
            <path d="M9 12h6" />
            <path d="M9 16h4" />
        </svg>
    );
}


function BuildingIcon() {

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
        >
            <path d="M3 21h18" />
            <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
            <path d="M9 7h2" />
            <path d="M13 7h2" />
            <path d="M9 11h2" />
            <path d="M13 11h2" />
            <path d="M9 15h2" />
            <path d="M13 15h2" />
        </svg>
    );
}