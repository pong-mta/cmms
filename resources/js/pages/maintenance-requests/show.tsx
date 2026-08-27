import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
    ClipboardCheck,
    Send,
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

interface Technician {
    id: number;
    name: string;
    phone?: string;
    department_id: number;
}

interface UserInfo {
    id: number;
    name: string;
    phone?: string;
}

interface RequestCostItem {
    id?: number;
    type: 'labor' | 'parts' | 'other';
    description: string;
    quantity: number | string;
    unit: string;
    unit_cost: number | string;
    total_cost: number | string;
    remarks?: string | null;
}

interface MaintenanceRequest {
    id: number;

    request_code: string;

    asset?: Asset | null;

    department?: Department | null;

    requested_by?: UserInfo | null;

    assessed_by?: UserInfo | null;

    assigned_to?: UserInfo | null;

    head_reviewed_by?: UserInfo | null;

    gso_reviewed_by?: UserInfo | null;

    budget_reviewed_by?: UserInfo | null;

    title: string;

    description: string;

    priority:
        | 'low'
        | 'normal'
        | 'high'
        | 'critical';

    status:
        | 'submitted'
        | 'assessment'
        | 'for_head_review'
        | 'head_approved'
        | 'for_gso_review'
        | 'for_budget_review'
        | 'budget_approved'
        | 'ready_for_work'
        | 'assigned'
        | 'in_progress'
        | 'completed'
        | 'rejected'
        | 'cancelled';

    requested_at?: string | null;

    assessed_at?: string | null;

    assessment?: string | null;

    work_scope?: string | null;

    estimated_labor_cost?: number | string | null;

    estimated_parts_cost?: number | string | null;

    estimated_other_cost?: number | string | null;

    estimated_total_cost?: number | string | null;

    cost_items?: RequestCostItem[];

    head_reviewed_at?: string | null;

    head_remarks?: string | null;

    gso_reviewed_at?: string | null;

    gso_remarks?: string | null;

    budget_reviewed_at?: string | null;

    budget_remarks?: string | null;

    funding_source?: string | null;

    budget_amount?: number | string | null;

    approved_at?: string | null;

    started_at?: string | null;

    completed_at?: string | null;

    remarks?: string | null;

    created_at: string;

    updated_at: string;
}

interface Props {
    request: MaintenanceRequest;
    technicians: Technician[];
    userRoles: string[];
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

        case 'assessment':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'for_head_review':
            return 'bg-purple-50 text-purple-700 ring-purple-200';

        case 'head_approved':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'for_gso_review':
            return 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200';

        case 'for_budget_review':
            return 'bg-violet-50 text-violet-700 ring-violet-200';

        case 'budget_approved':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'ready_for_work':
            return 'bg-cyan-50 text-cyan-700 ring-cyan-200';

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
    technicians,
    userRoles,
}: Props) {

    const isDepartmentHead =
        userRoles.includes('department_head');

    const isBudgetOfficer =
        userRoles.includes('budget_officer');

    const isGso =
        userRoles.includes('gso');

    const [
        showRejectModal,
        setShowRejectModal,
    ] = useState(false);

    const [
        rejectReason,
        setRejectReason,
    ] = useState('');

    const [
        selectedTechnician,
        setSelectedTechnician,
    ] = useState('');

    const [
        assessment,
        setAssessment,
    ] = useState('');

    const [
        workScope,
        setWorkScope,
    ] = useState('');

    const [
        costItems,
        setCostItems,
    ] = useState<RequestCostItem[]>([
        {
            type: 'parts',
            description: '',
            quantity: 1,
            unit: 'pc',
            unit_cost: '',
            total_cost: 0,
            remarks: '',
        },
    ]);

    const calculatedTotal = useMemo(
        () =>
            costItems.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity || 0) *
                        Number(item.unit_cost || 0),
                0,
            ),
        [costItems],
    );

    const updateCostItem = (
        index: number,
        field: keyof RequestCostItem,
        value: string,
    ) => {
        setCostItems((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                          total_cost:
                              field === 'quantity' ||
                              field === 'unit_cost'
                                  ? Number(
                                        field === 'quantity'
                                            ? value || 0
                                            : item.quantity || 0,
                                    ) *
                                    Number(
                                        field === 'unit_cost'
                                            ? value || 0
                                            : item.unit_cost || 0,
                                    )
                                  : item.total_cost,
                      }
                    : item,
            ),
        );
    };

    const addCostItem = () => {
        setCostItems((current) => [
            ...current,
            {
                type: 'parts',
                description: '',
                quantity: 1,
                unit: 'pc',
                unit_cost: '',
                total_cost: 0,
                remarks: '',
            },
        ]);
    };

    const removeCostItem = (index: number) => {
        setCostItems((current) =>
            current.length === 1
                ? current
                : current.filter(
                      (_, itemIndex) =>
                          itemIndex !== index,
                  ),
        );
    };


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
                                                    {request.asset.asset_code}
                                                </p>

                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {request.asset.name}
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
                        {/* SUPERVISOR ASSESSMENT RESULT */}
                        {/* ================================================== */}

                        {request.assessment && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                            <ClipboardCheck className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <h2 className="text-sm font-bold text-slate-900">
                                                Supervisor Assessment
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                Technical assessment and estimated costing.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-5 sm:p-6">

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Assessment
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                            {request.assessment}
                                        </p>

                                    </div>


                                    {request.work_scope && (

                                        <div className="mt-6 border-t border-slate-100 pt-5">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Work Scope
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {request.work_scope}
                                            </p>

                                        </div>

                                    )}


                                    {request.cost_items &&
                                        request.cost_items.length > 0 && (
                                            <div className="mt-6">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Detailed Costing
                                                    </p>

                                                    <p className="text-xs font-bold text-slate-800">
                                                        ₱
                                                        {Number(
                                                            request.estimated_total_cost ?? 0,
                                                        ).toLocaleString(
                                                            'en-PH',
                                                            {
                                                                minimumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                    <table className="w-full min-w-[720px] text-left text-xs">
                                                        <thead className="bg-slate-50">
                                                            <tr>
                                                                <th className="px-3 py-2 font-semibold text-slate-500">
                                                                    Type
                                                                </th>
                                                                <th className="px-3 py-2 font-semibold text-slate-500">
                                                                    Description
                                                                </th>
                                                                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                                                                    Qty
                                                                </th>
                                                                <th className="px-3 py-2 font-semibold text-slate-500">
                                                                    Unit
                                                                </th>
                                                                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                                                                    Unit Cost
                                                                </th>
                                                                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                                                                    Total
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-slate-100">
                                                            {request.cost_items.map(
                                                                (item, index) => (
                                                                    <tr
                                                                        key={
                                                                            item.id ??
                                                                            index
                                                                        }
                                                                    >
                                                                        <td className="px-3 py-2 font-semibold capitalize text-slate-700">
                                                                            {item.type}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-slate-600">
                                                                            {item.description}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-slate-600">
                                                                            {item.quantity}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-slate-600">
                                                                            {item.unit}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-slate-600">
                                                                            ₱
                                                                            {Number(
                                                                                item.unit_cost ?? 0,
                                                                            ).toLocaleString(
                                                                                'en-PH',
                                                                                {
                                                                                    minimumFractionDigits: 2,
                                                                                },
                                                                            )}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right font-semibold text-slate-800">
                                                                            ₱
                                                                            {Number(
                                                                                item.total_cost ?? 0,
                                                                            ).toLocaleString(
                                                                                'en-PH',
                                                                                {
                                                                                    minimumFractionDigits: 2,
                                                                                },
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                    <CostItem
                                                        label="Labor"
                                                        value={request.estimated_labor_cost}
                                                    />

                                                    <CostItem
                                                        label="Parts"
                                                        value={request.estimated_parts_cost}
                                                    />

                                                    <CostItem
                                                        label="Other"
                                                        value={request.estimated_other_cost}
                                                    />
                                                </div>
                                            </div>
                                        )}


                                    {request.assessed_by && (

                                        <div className="mt-4">

                                            <p className="text-[10px] text-slate-400">
                                                Assessed by
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                                {request.assessed_by.name}
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-400">
                                                {formatDateTime(
                                                    request.assessed_at,
                                                )}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </section>

                        )}


                        {/* ================================================== */}
                        {/* HEAD REVIEW RESULT */}
                        {/* ================================================== */}

                        {request.head_reviewed_by && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <h2 className="text-sm font-bold text-slate-900">
                                                Department Head Review
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                Review decision and remarks.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-5 sm:p-6">

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Reviewed By
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-700">
                                            {request.head_reviewed_by.name}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-400">
                                            {formatDateTime(
                                                request.head_reviewed_at,
                                            )}
                                        </p>

                                    </div>


                                    {request.head_remarks && (

                                        <div className="mt-4">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Head Remarks
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {request.head_remarks}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </section>

                        )}


                        {/* ================================================== */}
                        {/* GSO VALIDATION RESULT */}
                        {/* ================================================== */}

                        {request.gso_reviewed_by && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <h2 className="text-sm font-bold text-slate-900">
                                                GSO Validation
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                General Services Office validation and remarks.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-5 sm:p-6">

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Validated By
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-700">
                                            {request.gso_reviewed_by.name}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-400">
                                            {formatDateTime(
                                                request.gso_reviewed_at,
                                            )}
                                        </p>

                                    </div>


                                    {request.gso_remarks && (

                                        <div className="mt-4">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                GSO Remarks
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {request.gso_remarks}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </section>

                        )}


                        {/* ================================================== */}
                        {/* BUDGET RESULT */}
                        {/* ================================================== */}

                        {request.budget_reviewed_by && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                            <ClipboardCheck className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <h2 className="text-sm font-bold text-slate-900">
                                                Budget Review
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                Budget and funding information.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-5 sm:p-6">

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <InfoItem
                                            label="Funding Source"
                                            value={
                                                request.funding_source ??
                                                '—'
                                            }
                                        />

                                        <InfoItem
                                            label="Budget Amount"
                                            value={
                                                request.budget_amount !==
                                                null &&
                                                request.budget_amount !==
                                                undefined
                                                    ? `₱${Number(
                                                          request.budget_amount,
                                                      ).toLocaleString(
                                                          'en-PH',
                                                          {
                                                              minimumFractionDigits: 2,
                                                          },
                                                      )}`
                                                    : '—'
                                            }
                                        />

                                    </div>


                                    {request.budget_remarks && (

                                        <div className="mt-5 border-t border-slate-100 pt-5">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Budget Remarks
                                            </p>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {request.budget_remarks}
                                            </p>

                                        </div>

                                    )}

                                    <div className="mt-4">

                                        <p className="text-[10px] text-slate-400">
                                            Reviewed by
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-700">
                                            {request.budget_reviewed_by.name}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-400">
                                            {formatDateTime(
                                                request.budget_reviewed_at,
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </section>

                        )}


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
                                    active={true}
                                    completed={[
                                        'assessment',
                                        'for_head_review',
                                        'head_approved',
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    date={request.requested_at}
                                />


                                <WorkflowStep
                                    label="Supervisor Assessment"
                                    active={[
                                        'assessment',
                                        'for_head_review',
                                        'head_approved',
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'for_head_review',
                                        'head_approved',
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    date={request.assessed_at}
                                />


                                <WorkflowStep
                                    label="Department Head Review"
                                    active={[
                                        'for_head_review',
                                        'head_approved',
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'head_approved',
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    date={request.head_reviewed_at}
                                />


                                <WorkflowStep
                                    label="GSO Validation"
                                    active={[
                                        'for_gso_review',
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    date={request.gso_reviewed_at}
                                />


                                <WorkflowStep
                                    label="Budget Review"
                                    active={[
                                        'for_budget_review',
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'budget_approved',
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    date={request.budget_reviewed_at}
                                />


                                <WorkflowStep
                                    label="Ready for Work"
                                    active={[
                                        'ready_for_work',
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                />


                                <WorkflowStep
                                    label="Assigned"
                                    active={[
                                        'assigned',
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={[
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                />


                                <WorkflowStep
                                    label="In Progress"
                                    active={[
                                        'in_progress',
                                        'completed',
                                    ].includes(request.status)}
                                    completed={
                                        request.status ===
                                        'completed'
                                    }
                                    date={request.started_at}
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
                                    date={request.completed_at}
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
                                        {statusLabel(
                                            request.status,
                                        )}
                                    </span>

                                </div>


                                {/* ================================================== */}
                                {/* DEPARTMENT HEAD ACTIONS */}
                                {/* ================================================== */}

                                {request.status === 'for_head_review' &&
                                    isDepartmentHead && (

                                    <div className="mt-4 space-y-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    !window.confirm(
                                                        'Approve this maintenance request and send it to the General Services Office?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/head-approve`,
                                                );
                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                                        >

                                            <CheckCircle2 className="h-4 w-4" />

                                            Approve & Send to GSO

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() => {

                                                const remarks =
                                                    window.prompt(
                                                        'Why are you returning this request to the Supervisor?',
                                                    );

                                                if (
                                                    !remarks?.trim()
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/head-return`,
                                                    {
                                                        remarks,
                                                    },
                                                );

                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                        >

                                            <ArrowLeft className="h-4 w-4" />

                                            Return to Supervisor

                                        </button>

                                    </div>

                                )}

                                {request.status === 'for_head_review' &&
                                    !isDepartmentHead && (
                                    <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                                        <p className="text-xs font-semibold text-purple-800">
                                            Waiting for Department Head review
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-purple-700">
                                            The assessment and costing have been submitted. No action is required from you at this stage.
                                        </p>
                                    </div>
                                )}


                                {/* ================================================== */}
                                {/* GENERAL SERVICES OFFICE */}
                                {/* ================================================== */}

                                {request.status === 'for_gso_review' &&
                                    isGso && (

                                    <div className="mt-4 space-y-2">

                                        <button
                                            type="button"
                                            onClick={() => {

                                                if (
                                                    !window.confirm(
                                                        'Validate this maintenance request and send it to the Budget Office?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/gso-approve`,
                                                );

                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />

                                            Validate & Send to Budget

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() => {

                                                const remarks =
                                                    window.prompt(
                                                        'Why are you returning this request to the Supervisor?',
                                                    );

                                                if (
                                                    !remarks?.trim()
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/gso-return`,
                                                    {
                                                        remarks,
                                                    },
                                                );

                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                        >
                                            <ArrowLeft className="h-4 w-4" />

                                            Return to Supervisor

                                        </button>

                                    </div>

                                )}


                                {request.status === 'for_gso_review' &&
                                    !isGso && (
                                    <div className="mt-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4">
                                        <p className="text-xs font-semibold text-fuchsia-800">
                                            Waiting for GSO validation
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-fuchsia-700">
                                            The Department Head has approved this request. It is now waiting for General Services Office validation.
                                        </p>
                                    </div>
                                )}


                                {/* ================================================== */}
                                {/* BUDGET OFFICE */}
                                {/* ================================================== */}

                                {request.status === 'for_budget_review' && (

                                    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">

                                        <p className="text-xs font-semibold text-violet-800">
                                            Awaiting Budget Office review
                                        </p>

                                        <p className="mt-1 text-[10px] leading-5 text-violet-700">
                                            This request has been approved by the Department Head and validated by GSO. It is now waiting for budget review.
                                        </p>

                                    </div>

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
                                    label="Assessed By"
                                    user={
                                        request.assessed_by
                                    }
                                />


                                <PersonItem
                                    label="Head Reviewed By"
                                    user={
                                        request.head_reviewed_by
                                    }
                                />


                                <PersonItem
                                    label="GSO Validated By"
                                    user={
                                        request.gso_reviewed_by
                                    }
                                />


                                <PersonItem
                                    label="Budget Reviewed By"
                                    user={
                                        request.budget_reviewed_by
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
                        {/* SUPERVISOR ASSESSMENT FORM */}
                        {/* ================================================== */}

                        {(request.status === 'submitted' ||
                            request.status === 'assessment') && (

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                        <ClipboardCheck className="h-5 w-5" />
                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Supervisor Assessment
                                        </h2>

                                        <p className="text-[10px] text-slate-500">
                                            Assess the request and prepare the estimated costing.
                                        </p>

                                    </div>

                                </div>


                                <div className="mt-5 space-y-4">

                                    <div>

                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Assessment
                                        </label>

                                        <textarea
                                            value={assessment}
                                            onChange={(event) =>
                                                setAssessment(
                                                    event.target.value,
                                                )
                                            }
                                            rows={4}
                                            placeholder="Describe the assessment and findings..."
                                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Work Scope
                                        </label>

                                        <textarea
                                            value={workScope}
                                            onChange={(event) =>
                                                setWorkScope(
                                                    event.target.value,
                                                )
                                            }
                                            rows={4}
                                            placeholder="Describe the work that needs to be performed..."
                                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700">
                                                    Estimated Costing
                                                </label>

                                                <p className="mt-1 text-[10px] text-slate-400">
                                                    Add the actual materials, labor, services, or other expenses needed for the work.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addCostItem}
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
                                            >
                                                + Add Item
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {costItems.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                                    >
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                                                Cost Item {index + 1}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeCostItem(
                                                                        index,
                                                                    )
                                                                }
                                                                disabled={
                                                                    costItems.length ===
                                                                    1
                                                                }
                                                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                × Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                                                            <div>
                                                                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                    Type
                                                                </label>

                                                                <select
                                                                    value={
                                                                        item.type
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateCostItem(
                                                                            index,
                                                                            'type',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                >
                                                                    <option value="labor">
                                                                        Labor
                                                                    </option>
                                                                    <option value="parts">
                                                                        Parts
                                                                    </option>
                                                                    <option value="other">
                                                                        Other
                                                                    </option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                    Description
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.description
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateCostItem(
                                                                            index,
                                                                            'description',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. Engine oil, replacement bearing, technician labor"
                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                            <div>
                                                                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                    Quantity
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateCostItem(
                                                                            index,
                                                                            'quantity',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                    Unit
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.unit
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateCostItem(
                                                                            index,
                                                                            'unit',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="pc, liter, job"
                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                    Unit Cost
                                                                </label>

                                                                <div className="relative">
                                                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                                        ₱
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            item.unit_cost
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateCostItem(
                                                                                index,
                                                                                'unit_cost',
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="0.00"
                                                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="text-[10px] text-slate-400">
                                                                Quantity × Unit Cost
                                                            </div>

                                                            <div className="text-sm font-bold text-slate-800">
                                                                Item Total: ₱
                                                                {(
                                                                    Number(
                                                                        item.quantity ||
                                                                            0,
                                                                    ) *
                                                                    Number(
                                                                        item.unit_cost ||
                                                                            0,
                                                                    )
                                                                ).toLocaleString(
                                                                    'en-PH',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-3">
                                                            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500">
                                                                Item Remarks
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    item.remarks ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateCostItem(
                                                                        index,
                                                                        'remarks',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Optional"
                                                                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-600">
                                                    Estimated Total
                                                </span>

                                                <span className="text-lg font-bold text-slate-900">
                                                    ₱
                                                    {calculatedTotal.toLocaleString(
                                                        'en-PH',
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                    <button
                                        type="button"
                                        disabled={
                                            !assessment.trim() ||
                                            !workScope.trim() ||
                                            costItems.length === 0 ||
                                            costItems.some(
                                                (item) =>
                                                    !item.description.trim() ||
                                                    !item.unit.trim() ||
                                                    Number(
                                                        item.quantity || 0,
                                                    ) <= 0 ||
                                                    Number(
                                                        item.unit_cost || 0,
                                                    ) < 0,
                                            )
                                        }
                                        onClick={() => {
                                            router.post(
                                                `/maintenance-requests/${request.id}/assess`,
                                                {
                                                    assessment,
                                                    work_scope:
                                                        workScope,
                                                    cost_items:
                                                        costItems.map(
                                                            (item) => ({
                                                                type:
                                                                    item.type,
                                                                description:
                                                                    item.description,
                                                                quantity:
                                                                    Number(
                                                                        item.quantity ||
                                                                            0,
                                                                    ),
                                                                unit:
                                                                    item.unit,
                                                                unit_cost:
                                                                    Number(
                                                                        item.unit_cost ||
                                                                            0,
                                                                    ),
                                                                remarks:
                                                                    item.remarks ||
                                                                    null,
                                                            }),
                                                        ),
                                                },
                                            );
                                        }}
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <Send className="h-4 w-4" />

                                        Send to Department Head

                                    </button>

                                </div>

                            </section>

                        )}


                        {/* ================================================== */}
                        {/* ASSIGN TECHNICIAN */}
                        {/* ================================================== */}

                        {request.status === 'ready_for_work' && (

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                                        <User className="h-5 w-5" />
                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Assign Technician
                                        </h2>

                                        <p className="text-[10px] text-slate-500">
                                            Select a technician for this maintenance request.
                                        </p>

                                    </div>

                                </div>


                                <div className="mt-5">

                                    <label
                                        htmlFor="assigned_to"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Technician
                                    </label>


                                    <select
                                        id="assigned_to"
                                        value={
                                            selectedTechnician
                                        }
                                        onChange={(event) =>
                                            setSelectedTechnician(
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select technician
                                        </option>


                                        {technicians.map(
                                            (technician) => (
                                                <option
                                                    key={technician.id}
                                                    value={technician.id}
                                                >
                                                    {technician.name}
                                                    {technician.phone
                                                        ? ` — ${technician.phone}`
                                                        : ''}
                                                </option>
                                            ),
                                        )}

                                    </select>


                                    {technicians.length === 0 && (

                                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">

                                            <p className="text-[10px] font-semibold text-amber-800">
                                                No technicians are currently assigned to this department.
                                            </p>

                                        </div>

                                    )}


                                    <button
                                        type="button"
                                        disabled={
                                            !selectedTechnician ||
                                            technicians.length === 0
                                        }
                                        onClick={() => {

                                            router.post(
                                                `/maintenance-requests/${request.id}/assign`,
                                                {
                                                    assigned_to:
                                                        selectedTechnician,
                                                },
                                            );

                                        }}
                                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <User className="h-4 w-4" />

                                        Assign Technician

                                    </button>

                                </div>

                            </section>

                        )}


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
                                    {request.department?.name ??
                                        'No department assigned'}
                                </p>


                                {request.department?.code && (

                                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                        {request.department.code}
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
                                    label="Assessed"
                                    value={
                                        request.assessed_at
                                    }
                                />


                                <DateItem
                                    label="Head Reviewed"
                                    value={
                                        request.head_reviewed_at
                                    }
                                />


                                <DateItem
                                    label="GSO Validated"
                                    value={
                                        request.gso_reviewed_at
                                    }
                                />


                                <DateItem
                                    label="Budget Reviewed"
                                    value={
                                        request.budget_reviewed_at
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


            {/* ========================================================== */}
            {/* OLD REJECT MODAL                                           */}
            {/* ========================================================== */}

            {showRejectModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Reject Maintenance Request
                                </h2>

                                <p className="text-[10px] text-slate-500">
                                    Please provide a reason for rejection.
                                </p>

                            </div>

                        </div>


                        <div className="mt-5">

                            <label
                                htmlFor="reject_reason"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Rejection Reason
                            </label>


                            <textarea
                                id="reject_reason"
                                value={rejectReason}
                                onChange={(event) =>
                                    setRejectReason(
                                        event.target.value,
                                    )
                                }
                                rows={5}
                                placeholder="Explain why this maintenance request is being rejected..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            />

                        </div>


                        <div className="mt-5 flex gap-2">

                            <button
                                type="button"
                                onClick={() => {

                                    setShowRejectModal(
                                        false,
                                    );

                                    setRejectReason('');

                                }}
                                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={
                                    !rejectReason.trim()
                                }
                                onClick={() => {

                                    router.post(
                                        `/maintenance-requests/${request.id}/cancel`,
                                        {
                                            remarks:
                                                rejectReason,
                                        },
                                    );

                                    setShowRejectModal(
                                        false,
                                    );

                                    setRejectReason('');

                                }}
                                className="h-10 flex-1 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reject Request
                            </button>

                        </div>

                    </div>

                </div>

            )}

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
| COST ITEM
|--------------------------------------------------------------------------
*/

function CostItem({
    label,
    value,
}: {
    label: string;
    value?: number | string | null;
}) {

    return (

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
                ₱
                {Number(
                    value ?? 0,
                ).toLocaleString(
                    'en-PH',
                    {
                        minimumFractionDigits: 2,
                    },
                )}
            </p>

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
}: {
    label: string;
    value: string;
}) {

    return (

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
                {value}
            </p>

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