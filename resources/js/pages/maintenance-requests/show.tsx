import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
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


interface UserInfo {
    id: number;
    name: string;
    phone?: string;
}


interface MaintenanceRequest {
    id: number;

    request_code: string;

    asset?: Asset | null;

    department?: Department | null;

    requested_by?: UserInfo | null;

    assigned_to?: UserInfo | null;

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


interface Props {
    request: MaintenanceRequest;
}


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
| DATE + TIME
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function ShowMaintenanceRequest({
    request,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Maintenance Requests',
            href: '/maintenance-requests',
        },
        {
            title: request.request_code,
            href: `/maintenance-requests/${request.id}`,
        },
    ];


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head
                title={`${request.request_code} | CMMS`}
            />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/maintenance-requests"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >

                            <ArrowLeft className="h-4 w-4" />

                        </Link>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                            <ClipboardList className="h-5 w-5" />

                        </div>


                        <div>

                            <div className="flex flex-wrap items-center gap-2">

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {request.request_code}
                                </h1>


                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                        request.status,
                                    )}`}
                                >

                                    {statusLabel(
                                        request.status,
                                    )}

                                </span>

                            </div>


                            <p className="mt-1 text-xs text-slate-500">
                                Maintenance request details
                            </p>

                        </div>

                    </div>


                    <Link
                        href="/maintenance-requests"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                    >

                        <ArrowLeft className="h-4 w-4" />

                        Back to Requests

                    </Link>

                </div>


                {/* ====================================================== */}
                {/* MAIN */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                    {/* ================================================== */}
                    {/* LEFT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* REQUEST */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                        <ClipboardList className="h-5 w-5" />

                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Request Details
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Information submitted by the requester.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5 sm:p-6">


                                <h2 className="text-lg font-bold text-slate-900">
                                    {request.title}
                                </h2>


                                <div className="mt-4 flex flex-wrap gap-2">

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priorityClass(
                                            request.priority,
                                        )}`}
                                    >

                                        {priorityLabel(
                                            request.priority,
                                        )}{' '}
                                        Priority

                                    </span>


                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                            request.status,
                                        )}`}
                                    >

                                        {statusLabel(
                                            request.status,
                                        )}

                                    </span>

                                </div>


                                <div className="mt-6">

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Problem Description
                                    </p>


                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {request.description}
                                    </p>

                                </div>


                                {request.remarks && (

                                    <div className="mt-6 border-t border-slate-100 pt-5">

                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Remarks
                                        </p>


                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                            {request.remarks}
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* ASSET */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">

                                        <Wrench className="h-5 w-5" />

                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Asset
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Asset associated with this request.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5 sm:p-6">

                                {request.asset ? (

                                    <Link
                                        href={`/assets/${request.asset.id}`}
                                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                                <Wrench className="h-5 w-5" />

                                            </div>


                                            <div>

                                                <p className="text-xs font-bold text-slate-800">
                                                    {
                                                        request.asset
                                                            .asset_code
                                                    }
                                                </p>

                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {
                                                        request.asset
                                                            .name
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <span className="text-[10px] font-semibold text-blue-700 group-hover:text-blue-800">
                                            View Asset
                                        </span>

                                    </Link>

                                ) : (

                                    <p className="text-sm text-slate-500">
                                        No asset information available.
                                    </p>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* WORKFLOW */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                                        <CheckCircle2 className="h-5 w-5" />

                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Request Workflow
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Current progress of this request.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5 sm:p-6">

                                <WorkflowStep
                                    label="Submitted"
                                    active={
                                        true
                                    }
                                    completed={
                                        [
                                            'reviewing',
                                            'approved',
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    date={
                                        request.requested_at
                                    }
                                />


                                <WorkflowStep
                                    label="Reviewing"
                                    active={
                                        [
                                            'reviewing',
                                            'approved',
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    completed={
                                        [
                                            'approved',
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                />


                                <WorkflowStep
                                    label="Approved"
                                    active={
                                        [
                                            'approved',
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    completed={
                                        [
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    date={
                                        request.approved_at
                                    }
                                />


                                <WorkflowStep
                                    label="Assigned"
                                    active={
                                        [
                                            'assigned',
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    completed={
                                        [
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                />


                                <WorkflowStep
                                    label="In Progress"
                                    active={
                                        [
                                            'in_progress',
                                            'completed',
                                        ].includes(
                                            request.status,
                                        )
                                    }
                                    completed={
                                        request.status ===
                                        'completed'
                                    }
                                    date={
                                        request.started_at
                                    }
                                />


                                <WorkflowStep
                                    label="Completed"
                                    active={
                                        request.status ===
                                        'completed'
                                    }
                                    completed={
                                        request.status ===
                                        'completed'
                                    }
                                    date={
                                        request.completed_at
                                    }
                                    last
                                />

                            </div>

                        </section>

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

                                    <Clock3 className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Current Status
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Request processing state
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5">

                                <div className="rounded-xl bg-slate-50 p-4 text-center">

                                    <span
                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                            request.status,
                                        )}`}
                                    >
                                        {statusLabel(request.status)}
                                    </span>

                                </div>


                                {request.status === 'submitted' && (

                                    <Link
                                        href={`/maintenance-requests/${request.id}/review`}
                                        method="post"
                                        as="button"
                                        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                                    >

                                        <Clock3 className="h-4 w-4" />

                                        Start Review

                                    </Link>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* REQUESTER */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <User className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        People
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Request responsibility
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 space-y-4">

                                <PersonItem
                                    label="Requested By"
                                    user={
                                        request.requested_by
                                    }
                                />


                                <PersonItem
                                    label="Assigned To"
                                    user={
                                        request.assigned_to
                                    }
                                />

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* DEPARTMENT */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">

                                    <Building2 className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Department
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Responsible department
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5">

                                <p className="text-sm font-semibold text-slate-800">

                                    {request
                                        .department
                                        ?.name ??
                                        'No department assigned'}

                                </p>


                                {request.department
                                    ?.code && (

                                    <p className="mt-1 text-[10px] font-semibold text-slate-400">

                                        {
                                            request
                                                .department
                                                .code
                                        }

                                    </p>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* DATES */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                                    <CalendarDays className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Timeline
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Request timestamps
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 space-y-3">

                                <DateItem
                                    label="Requested"
                                    value={
                                        request.requested_at ??
                                        request.created_at
                                    }
                                />


                                <DateItem
                                    label="Approved"
                                    value={
                                        request.approved_at
                                    }
                                />


                                <DateItem
                                    label="Started"
                                    value={
                                        request.started_at
                                    }
                                />


                                <DateItem
                                    label="Completed"
                                    value={
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
| WORKFLOW STEP
|--------------------------------------------------------------------------
*/

function WorkflowStep({
    label,
    active,
    completed,
    date,
    last = false,
}: {
    label: string;
    active: boolean;
    completed: boolean;
    date?: string | null;
    last?: boolean;
}) {

    return (
        <div className="flex gap-3">

            <div className="flex flex-col items-center">

                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        completed
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : active
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-200 bg-white text-slate-300'
                    }`}
                >

                    {completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                    )}

                </div>


                {!last && (

                    <div
                        className={`min-h-8 w-px ${
                            completed
                                ? 'bg-emerald-300'
                                : 'bg-slate-200'
                        }`}
                    />

                )}

            </div>


            <div className="pb-5">

                <p
                    className={`text-xs font-semibold ${
                        active
                            ? 'text-slate-800'
                            : 'text-slate-400'
                    }`}
                >
                    {label}
                </p>


                {date && (

                    <p className="mt-1 text-[10px] text-slate-400">
                        {formatDateTime(
                            date,
                        )}
                    </p>

                )}

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| PERSON ITEM
|--------------------------------------------------------------------------
*/

function PersonItem({
    label,
    user,
}: {
    label: string;
    user?: UserInfo | null;
}) {

    return (
        <div>

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>


            <p className="mt-1 text-xs font-semibold text-slate-700">

                {user?.name ??
                    'Not assigned'}

            </p>


            {user?.phone && (

                <p className="mt-0.5 text-[10px] text-slate-400">
                    {user.phone}
                </p>

            )}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DATE ITEM
|--------------------------------------------------------------------------
*/

function DateItem({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {

    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-[10px] font-medium text-slate-400">
                {label}
            </span>


            <span className="text-right text-[10px] font-semibold text-slate-600">
                {value
                    ? formatDateTime(
                          value,
                      )
                    : '—'}
            </span>

        </div>
    );
}