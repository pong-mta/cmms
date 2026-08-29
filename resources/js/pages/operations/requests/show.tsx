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
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Send,
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
    phone?: string | null;
}

interface Technician {
    id: number;
    name: string;
    phone?: string | null;
    department_id: number;
}

interface RequestType {
    id?: number;
    code?: string | null;
    name?: string | null;
    category?: string | null;
}

interface CostItem {
    id?: number;
    type: 'labor' | 'parts' | 'other';
    description: string;
    quantity: number | string;
    unit: string;
    unit_cost: number | string;
    total_cost?: number | string;
    remarks?: string | null;
}

interface MaintenanceRequest {
    id: number;

    request_code: string;

    title: string;
    description: string;

    request_type?:
        | string
        | RequestType
        | null;

    requestType?: RequestType | null;

    priority:
        | 'low'
        | 'normal'
        | 'high'
        | 'critical';

    status: string;

    asset?: Asset | null;

    department?: Department | null;

    requested_by?: UserInfo | null;

    requestedBy?: UserInfo | null;

    assessed_by?: UserInfo | null;

    assigned_to?: UserInfo | null;

    head_reviewed_by?: UserInfo | null;

    gso_reviewed_by?: UserInfo | null;

    budget_reviewed_by?: UserInfo | null;

    requested_at?: string | null;

    assessed_at?: string | null;

    assessment?: string | null;

    work_scope?: string | null;

    estimated_labor_cost?: number | string | null;

    estimated_parts_cost?: number | string | null;

    estimated_other_cost?: number | string | null;

    estimated_total_cost?: number | string | null;

    cost_items?: CostItem[];

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
    technicians?: Technician[];
    userRoles?: string[] | null;
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function text(value: unknown): string {
    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    return '';
}

function getRequestTypeName(
    request: MaintenanceRequest,
): string {
    const relationship =
        request.requestType;

    if (
        relationship &&
        typeof relationship === 'object'
    ) {
        return (
            relationship.name ??
            relationship.code ??
            'Request'
        );
    }

    if (
        request.request_type &&
        typeof request.request_type === 'object'
    ) {
        return (
            request.request_type.name ??
            request.request_type.code ??
            'Request'
        );
    }

    const value =
        text(request.request_type);

    if (!value) {
        return 'Maintenance Request';
    }

    return value
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}

function normalizeRoles(
    roles?: string[] | null,
): string[] {
    if (!Array.isArray(roles)) {
        return [];
    }

    return roles
        .filter(
            (role): role is string =>
                typeof role === 'string',
        )
        .map((role) =>
            role
                .trim()
                .toLowerCase()
                .replaceAll('-', '_')
                .replaceAll(' ', '_'),
        );
}

function statusLabel(
    status?: string | null,
): string {
    const value = text(status);

    if (!value) {
        return 'Unknown';
    }

    return value
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}

function statusClass(
    status?: string | null,
): string {
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

function priorityLabel(
    priority?: string | null,
): string {
    const value = text(priority);

    if (!value) {
        return 'Normal';
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

function priorityClass(
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

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '—';
    }

    return date.toLocaleDateString(
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

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '—';
    }

    return date.toLocaleString(
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
    technicians = [],
    userRoles,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | NEVER call .includes() directly on userRoles.
    |
    | Laravel/Inertia may omit userRoles.
    |
    */

    const roles = normalizeRoles(
        userRoles,
    );

    const isDepartmentHead =
        roles.includes(
            'department_head',
        );

    const isBudgetOfficer =
        roles.includes(
            'budget_officer',
        );

    const isGso =
        roles.includes('gso');

    const isMaintenanceSupervisor =
        roles.includes(
            'maintenance_supervisor',
        );

    const requestTypeName =
        getRequestTypeName(request);

    const [showRejectModal, setShowRejectModal] =
        useState(false);

    const [rejectReason, setRejectReason] =
        useState('');

    const [selectedTechnician, setSelectedTechnician] =
        useState('');

    const [assessment, setAssessment] =
        useState(
            request.assessment ?? '',
        );

    const [workScope, setWorkScope] =
        useState(
            request.work_scope ?? '',
        );

    const [costItems, setCostItems] =
        useState<CostItem[]>(
            request.cost_items?.length
                ? request.cost_items
                : [
                      {
                          type: 'parts',
                          description: '',
                          quantity: 1,
                          unit: 'pc',
                          unit_cost: '',
                          total_cost: 0,
                          remarks: '',
                      },
                  ],
        );

    const [budgetFundingSource, setBudgetFundingSource] =
        useState(
            request.funding_source ?? '',
        );

    const [budgetAmount, setBudgetAmount] =
        useState(
            request.budget_amount !== null &&
            request.budget_amount !== undefined
                ? String(
                      request.budget_amount,
                  )
                : '',
        );

    const [budgetRemarks, setBudgetRemarks] =
        useState(
            request.budget_remarks ?? '',
        );

    const calculatedTotal =
        useMemo(
            () =>
                costItems.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        Number(
                            item.quantity || 0,
                        ) *
                            Number(
                                item.unit_cost ||
                                    0,
                            ),
                    0,
                ),
            [costItems],
        );

    const updateCostItem = (
        index: number,
        field: keyof CostItem,
        value: string,
    ) => {
        setCostItems(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) => {
                        if (
                            itemIndex !==
                            index
                        ) {
                            return item;
                        }

                        const updated = {
                            ...item,
                            [field]: value,
                        };

                        if (
                            field ===
                                'quantity' ||
                            field ===
                                'unit_cost'
                        ) {
                            const quantity =
                                field ===
                                'quantity'
                                    ? value
                                    : item.quantity;

                            const unitCost =
                                field ===
                                'unit_cost'
                                    ? value
                                    : item.unit_cost;

                            updated.total_cost =
                                Number(
                                    quantity ||
                                        0,
                                ) *
                                Number(
                                    unitCost ||
                                        0,
                                );
                        }

                        return updated;
                    },
                ),
        );
    };

    const addCostItem = () => {
        setCostItems(
            (current) => [
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
            ],
        );
    };

    const removeCostItem = (
        index: number,
    ) => {
        setCostItems(
            (current) =>
                current.length <= 1
                    ? current
                    : current.filter(
                          (
                              _,
                              itemIndex,
                          ) =>
                              itemIndex !==
                              index,
                      ),
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title:
                'Maintenance Requests',
            href:
                '/maintenance-requests',
        },
        {
            title:
                request.request_code,
            href:
                `/maintenance-requests/${request.id}`,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | WORKFLOW FLAGS
    |--------------------------------------------------------------------------
    */

    const isSubmitted =
        request.status ===
        'submitted';

    const isAssessment =
        request.status ===
        'assessment';

    const isForHeadReview =
        request.status ===
        'for_head_review';

    const isForGsoReview =
        request.status ===
        'for_gso_review';

    const isForBudgetReview =
        request.status ===
        'for_budget_review';

    const isReadyForWork =
        request.status ===
        'ready_for_work';

    const isRejected =
        request.status ===
        'rejected';

    const isCompleted =
        request.status ===
        'completed';

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head
                title={`${request.request_code} | CMMS`}
            />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* HEADER */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/maintenance-requests"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
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
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(request.status)}`}
                                >
                                    {statusLabel(
                                        request.status,
                                    )}
                                </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                {requestTypeName}
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

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

                    {/* LEFT */}

                    <div className="space-y-6">

                        {/* REQUEST DETAILS */}

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

                                        <p className="text-[10px] text-slate-500">
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
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priorityClass(request.priority)}`}
                                    >
                                        {priorityLabel(
                                            request.priority,
                                        )}{' '}
                                        Priority
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(request.status)}`}
                                    >
                                        {statusLabel(
                                            request.status,
                                        )}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                        {requestTypeName}
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

                        {/* ASSET */}

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

                                        <p className="text-[10px] text-slate-500">
                                            Asset associated with this request.
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="p-5 sm:p-6">

                                {request.asset ? (
                                    <Link
                                        href={`/assets/${request.asset.id}`}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-blue-50/30"
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

                                        <span className="text-[10px] font-semibold text-blue-700">
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

                        {/* ASSESSMENT RESULT */}

                        {request.assessment && (
                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                            <ClipboardCheck className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900">
                                                Supervisor Assessment
                                            </h2>

                                            <p className="text-[10px] text-slate-500">
                                                Technical assessment and costing.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="p-5 sm:p-6">

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Assessment
                                    </p>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {request.assessment}
                                    </p>

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

                                    {request.cost_items?.length ? (
                                        <div className="mt-6">

                                            <div className="mb-3 flex justify-between">

                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Detailed Costing
                                                </p>

                                                <p className="text-sm font-bold text-slate-800">
                                                    ₱
                                                    {Number(
                                                        request.estimated_total_cost ??
                                                            0,
                                                    ).toLocaleString(
                                                        'en-PH',
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    )}
                                                </p>

                                            </div>

                                            <div className="overflow-x-auto rounded-xl border border-slate-200">

                                                <table className="w-full min-w-[650px] text-left text-xs">

                                                    <thead className="bg-slate-50">

                                                        <tr>
                                                            <th className="px-3 py-2">
                                                                Type
                                                            </th>

                                                            <th className="px-3 py-2">
                                                                Description
                                                            </th>

                                                            <th className="px-3 py-2 text-right">
                                                                Qty
                                                            </th>

                                                            <th className="px-3 py-2">
                                                                Unit
                                                            </th>

                                                            <th className="px-3 py-2 text-right">
                                                                Unit Cost
                                                            </th>

                                                            <th className="px-3 py-2 text-right">
                                                                Total
                                                            </th>
                                                        </tr>

                                                    </thead>

                                                    <tbody className="divide-y divide-slate-100">

                                                        {request.cost_items.map(
                                                            (
                                                                item,
                                                                index,
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        item.id ??
                                                                        index
                                                                    }
                                                                >

                                                                    <td className="px-3 py-2 capitalize">
                                                                        {item.type}
                                                                    </td>

                                                                    <td className="px-3 py-2">
                                                                        {item.description}
                                                                    </td>

                                                                    <td className="px-3 py-2 text-right">
                                                                        {item.quantity}
                                                                    </td>

                                                                    <td className="px-3 py-2">
                                                                        {item.unit}
                                                                    </td>

                                                                    <td className="px-3 py-2 text-right">
                                                                        ₱
                                                                        {Number(
                                                                            item.unit_cost ??
                                                                                0,
                                                                        ).toLocaleString(
                                                                            'en-PH',
                                                                            {
                                                                                minimumFractionDigits: 2,
                                                                            },
                                                                        )}
                                                                    </td>

                                                                    <td className="px-3 py-2 text-right font-semibold">
                                                                        ₱
                                                                        {Number(
                                                                            item.total_cost ??
                                                                                Number(
                                                                                    item.quantity ||
                                                                                        0,
                                                                                ) *
                                                                                    Number(
                                                                                        item.unit_cost ||
                                                                                            0,
                                                                                    ),
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

                                        </div>
                                    ) : null}

                                </div>

                            </section>
                        )}

                    </div>

                    {/* RIGHT */}

                    <div className="space-y-6">

                        {/* CURRENT STATUS */}

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

                            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center">

                                <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClass(request.status)}`}
                                >
                                    {statusLabel(
                                        request.status,
                                    )}
                                </span>

                            </div>

                            {/* HEAD */}

                            {isForHeadReview &&
                                isDepartmentHead && (
                                    <div className="mt-4 space-y-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    !window.confirm(
                                                        'Approve this maintenance request and send it to GSO?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/head-approve`,
                                                );
                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Approve & Send to GSO
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const remarks =
                                                    window.prompt(
                                                        'Why are you returning this request?',
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
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Return to Supervisor
                                        </button>

                                    </div>
                                )}

                            {isForHeadReview &&
                                !isDepartmentHead && (
                                    <WaitingBox
                                        title="Waiting for Department Head review"
                                        message="The assessment and costing have been submitted. The request is waiting for the Department Head."
                                    />
                                )}

                            {/* GSO */}

                            {isForGsoReview &&
                                isGso && (
                                    <div className="mt-4 space-y-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    !window.confirm(
                                                        'Validate this request and send it to Budget?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/gso-approve`,
                                                );
                                            }}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Validate & Send to Budget
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const remarks =
                                                    window.prompt(
                                                        'Why are you returning this request?',
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
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Return to Supervisor
                                        </button>

                                    </div>
                                )}

                            {isForGsoReview &&
                                !isGso && (
                                    <WaitingBox
                                        title="Waiting for GSO validation"
                                        message="The Department Head has approved this request. It is waiting for GSO validation."
                                    />
                                )}

                            {/* BUDGET */}

                            {isForBudgetReview &&
                                isBudgetOfficer && (
                                    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">

                                        <p className="text-xs font-semibold text-violet-800">
                                            Budget Office Review
                                        </p>

                                        <form
                                            className="mt-4 space-y-3"
                                            onSubmit={(
                                                event,
                                            ) => {
                                                event.preventDefault();

                                                if (
                                                    !window.confirm(
                                                        'Approve this budget and send the request to Accounting?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/budget-approve`,
                                                    {
                                                        funding_source:
                                                            budgetFundingSource,
                                                        budget_amount:
                                                            budgetAmount,
                                                        remarks:
                                                            budgetRemarks ||
                                                            null,
                                                    },
                                                );
                                            }}
                                        >

                                            <input
                                                type="text"
                                                value={
                                                    budgetFundingSource
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setBudgetFundingSource(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Funding source"
                                                className="h-10 w-full rounded-xl border border-violet-200 bg-white px-3 text-xs"
                                            />

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    budgetAmount
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setBudgetAmount(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Approved amount"
                                                className="h-10 w-full rounded-xl border border-violet-200 bg-white px-3 text-xs"
                                            />

                                            <textarea
                                                rows={3}
                                                value={
                                                    budgetRemarks
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setBudgetRemarks(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Budget remarks"
                                                className="w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs"
                                            />

                                            <button
                                                type="submit"
                                                disabled={
                                                    !budgetFundingSource.trim() ||
                                                    !budgetAmount
                                                }
                                                className="h-11 w-full rounded-xl bg-violet-600 text-xs font-semibold text-white disabled:opacity-50"
                                            >
                                                Approve & Send to Accounting
                                            </button>

                                        </form>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const remarks =
                                                    window.prompt(
                                                        'Why are you returning this request to GSO?',
                                                    );

                                                if (
                                                    !remarks?.trim()
                                                ) {
                                                    return;
                                                }

                                                router.post(
                                                    `/maintenance-requests/${request.id}/budget-return`,
                                                    {
                                                        remarks,
                                                    },
                                                );
                                            }}
                                            className="mt-2 h-11 w-full rounded-xl border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700"
                                        >
                                            Return to GSO
                                        </button>

                                    </div>
                                )}

                            {isForBudgetReview &&
                                !isBudgetOfficer && (
                                    <WaitingBox
                                        title="Awaiting Budget Office review"
                                        message="The request has been validated by GSO and is waiting for Budget Office review."
                                    />
                                )}

                        </section>

                        {/* SUPERVISOR ASSESSMENT */}

                        {(isSubmitted ||
                            isAssessment) &&
                            isMaintenanceSupervisor && (
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
                                                Assess the request and prepare costing.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-5 space-y-4">

                                        <textarea
                                            value={
                                                assessment
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setAssessment(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            rows={4}
                                            placeholder="Assessment and findings..."
                                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm"
                                        />

                                        <textarea
                                            value={
                                                workScope
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setWorkScope(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            rows={4}
                                            placeholder="Work scope..."
                                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm"
                                        />

                                        <div>

                                            <div className="mb-3 flex items-center justify-between">

                                                <p className="text-xs font-semibold text-slate-700">
                                                    Estimated Costing
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        addCostItem
                                                    }
                                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700"
                                                >
                                                    + Add Item
                                                </button>

                                            </div>

                                            <div className="space-y-3">

                                                {costItems.map(
                                                    (
                                                        item,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="rounded-xl border border-slate-200 p-4"
                                                        >

                                                            <div className="mb-3 flex justify-between">

                                                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                                                    Cost Item{' '}
                                                                    {index +
                                                                        1}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        costItems.length ===
                                                                        1
                                                                    }
                                                                    onClick={() =>
                                                                        removeCostItem(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="text-[10px] font-semibold text-red-600 disabled:opacity-30"
                                                                >
                                                                    Remove
                                                                </button>

                                                            </div>

                                                            <div className="grid gap-3 md:grid-cols-2">

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
                                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-xs"
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
                                                                    placeholder="Description"
                                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-xs"
                                                                />

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
                                                                    placeholder="Quantity"
                                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-xs"
                                                                />

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
                                                                    placeholder="Unit"
                                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-xs"
                                                                />

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
                                                                    placeholder="Unit cost"
                                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-xs"
                                                                />

                                                                <div className="flex items-center rounded-lg bg-slate-50 px-3 text-xs font-semibold">
                                                                    Total: ₱
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

                                                        </div>
                                                    ),
                                                )}

                                            </div>

                                            <div className="mt-4 flex justify-between rounded-xl bg-slate-50 p-4">

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

                                        <button
                                            type="button"
                                            disabled={
                                                !assessment.trim() ||
                                                !workScope.trim() ||
                                                costItems.some(
                                                    (
                                                        item,
                                                    ) =>
                                                        !item.description.trim() ||
                                                        !item.unit.trim() ||
                                                        Number(
                                                            item.quantity ||
                                                                0,
                                                        ) <=
                                                            0 ||
                                                        Number(
                                                            item.unit_cost ||
                                                                0,
                                                        ) <
                                                            0,
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
                                                                (
                                                                    item,
                                                                ) => ({
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
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                            Send to Department Head
                                        </button>

                                    </div>

                                </section>
                            )}

                        {/* ASSIGN TECHNICIAN */}

                        {isReadyForWork &&
                            isMaintenanceSupervisor && (
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
                                                Select a technician for this request.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-5">

                                        <select
                                            value={
                                                selectedTechnician
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setSelectedTechnician(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                        >

                                            <option value="">
                                                Select technician
                                            </option>

                                            {technicians.map(
                                                (
                                                    technician,
                                                ) => (
                                                    <option
                                                        key={
                                                            technician.id
                                                        }
                                                        value={
                                                            technician.id
                                                        }
                                                    >
                                                        {
                                                            technician.name
                                                        }
                                                        {technician.phone
                                                            ? ` — ${technician.phone}`
                                                            : ''}
                                                    </option>
                                                ),
                                            )}

                                        </select>

                                        <button
                                            type="button"
                                            disabled={
                                                !selectedTechnician
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
                                            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white disabled:opacity-50"
                                        >
                                            <User className="h-4 w-4" />
                                            Assign Technician
                                        </button>

                                    </div>

                                </section>
                            )}

                        {/* PEOPLE */}

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
                                        request.requested_by ??
                                        request.requestedBy
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

                        {/* DEPARTMENT */}

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

                        {/* TIMELINE */}

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

            {/* REJECT MODAL */}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Reject Request
                                </h2>

                                <p className="text-[10px] text-slate-500">
                                    Provide a reason.
                                </p>

                            </div>

                        </div>

                        <textarea
                            value={
                                rejectReason
                            }
                            onChange={(
                                event,
                            ) =>
                                setRejectReason(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            rows={5}
                            className="mt-5 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            placeholder="Reason for rejection..."
                        />

                        <div className="mt-5 flex gap-2">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(
                                        false,
                                    );

                                    setRejectReason(
                                        '',
                                    );
                                }}
                                className="h-10 flex-1 rounded-xl border border-slate-200 text-xs font-semibold"
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

                                    setRejectReason(
                                        '',
                                    );
                                }}
                                className="h-10 flex-1 rounded-xl bg-red-600 text-xs font-semibold text-white disabled:opacity-50"
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
| WAITING BOX
|--------------------------------------------------------------------------
*/

function WaitingBox({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-xs font-semibold text-slate-800">
                {title}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-600">
                {message}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| PERSON
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
| DATE
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