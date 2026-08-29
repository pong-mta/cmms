import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, CalendarDays, Check, CheckCircle2, Clock3, FileText, Package, RotateCcw, UserRound, X, XCircle } from 'lucide-react';
import { useState } from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    department_id?: number | null;
    department?: Department | null;
    roles?: Role[];
}

interface PurchaseRequestItem {
    id: number;
    description: string;
    quantity: string | number;
    unit: string;
    estimated_unit_cost: string | number;
    estimated_amount: string | number;
}

interface PurchaseRequest {
    id: number;
    operation_request_id: number;
    purpose: string;
    justification: string;
    requested_date: string;
    items: PurchaseRequestItem[];
}

interface WorkflowStep {
    id: number;
    step_order: number;
    name: string;
    code: string;
    department_id: number | null;
    role_id: number | null;
    assignment_type: string;
    action: string;
    description?: string | null;
}

interface RequestAction {
    id: number;
    action: string;
    reason: string | null;
    created_at: string;

    user?: User | null;

    workflow_step?: WorkflowStep | null;
}

interface OperationRequest {
    id: number;
    request_no: string;
    type: string;
    title: string;
    description: string | null;

    priority: 'low' | 'normal' | 'high' | 'urgent';

    status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'completed';

    created_at: string;
    updated_at: string;

    user?: User | null;
    department?: Department | null;

    purchase_request?: PurchaseRequest | null;

    workflow?: {
        id: number;
        name: string;
        code: string;
        version: number;
    } | null;

    current_workflow_step?: WorkflowStep | null;

    actions?: RequestAction[];
}

interface PageProps {
    request: OperationRequest;

    auth: {
        user: User | null;
    };
}

/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requests',
        href: '/operations/requests',
    },
    {
        title: 'Request Details',
        href: '#',
    },
];

/*
|--------------------------------------------------------------------------
| STATUS CONFIG
|--------------------------------------------------------------------------
*/

const statusConfig: Record<
    string,
    {
        label: string;
        className: string;
    }
> = {
    draft: {
        label: 'Draft',
        className: 'bg-slate-100 text-slate-600',
    },

    submitted: {
        label: 'Submitted',
        className: 'bg-blue-50 text-blue-700',
    },

    pending: {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700',
    },

    approved: {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700',
    },

    rejected: {
        label: 'Rejected',
        className: 'bg-red-50 text-red-700',
    },

    completed: {
        label: 'Completed',
        className: 'bg-emerald-50 text-emerald-700',
    },
};

/*
|--------------------------------------------------------------------------
| PRIORITY CONFIG
|--------------------------------------------------------------------------
*/

const priorityConfig: Record<
    string,
    {
        label: string;
        className: string;
    }
> = {
    low: {
        label: 'Low',
        className: 'bg-slate-100 text-slate-600',
    },

    normal: {
        label: 'Normal',
        className: 'bg-blue-50 text-blue-700',
    },

    high: {
        label: 'High',
        className: 'bg-orange-50 text-orange-700',
    },

    urgent: {
        label: 'Urgent',
        className: 'bg-red-50 text-red-700',
    },
};

/*
|--------------------------------------------------------------------------
| REQUEST TYPE LABELS
|--------------------------------------------------------------------------
*/

const requestTypeLabels: Record<string, string> = {
    general: 'General Request',
    purchase: 'Purchase Request',
    procurement: 'Procurement Request',
    service: 'Service Request',
    maintenance: 'Maintenance Request',
    repair: 'Repair Request',
    equipment: 'Equipment Request',
    vehicle: 'Vehicle Request',
    personnel: 'Personnel Request',
    travel: 'Travel Request',
    training: 'Training Request',
    supply: 'Supply Request',
    it_support: 'IT Support Request',
    facility: 'Facility Request',
    document: 'Document Request',
    financial: 'Financial Request',
    event: 'Event Request',
    project: 'Project Request',
    inspection: 'Inspection Request',
    permit_clearance: 'Permit / Clearance Request',
    assistance: 'Assistance Request',
    other: 'Other Request',
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

function formatDateTime(date: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ShowRequest({ request, auth }: PageProps) {
    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [actionModal, setActionModal] = useState<'return' | 'reject' | null>(null);

    const [reason, setReason] = useState('');

    const [processing, setProcessing] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | REQUEST DATA
    |--------------------------------------------------------------------------
    */

    const status = statusConfig[request.status] ?? statusConfig.pending;

    const priority = priorityConfig[request.priority] ?? priorityConfig.normal;

    const requestType = requestTypeLabels[request.type] ?? request.type;

    /*
    |--------------------------------------------------------------------------
    | PURCHASE REQUEST
    |--------------------------------------------------------------------------
    */

    const purchaseRequest = request.purchase_request ?? null;

    const items = purchaseRequest?.items ?? [];

    const totalEstimatedCost = items.reduce((total, item) => total + Number(item.estimated_amount ?? 0), 0);

    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    const currentUser = auth?.user ?? null;

    /*
    |--------------------------------------------------------------------------
    | CURRENT WORKFLOW STEP
    |--------------------------------------------------------------------------
    */

    const currentStep = request.current_workflow_step ?? null;

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZATION FOR UI
    |--------------------------------------------------------------------------
    */

    const isSameDepartment = !!currentUser && !!request.department && Number(currentUser.department_id) === Number(request.department.id);

    const isDepartmentHead = !!currentUser?.roles?.some((role) => role.name === 'department_head');

    const canReviewDepartment =
        request.status === 'pending' &&
        currentStep?.code === 'DEPARTMENT_HEAD_REVIEW' &&
        currentStep?.assignment_type === 'requesting_department' &&
        isSameDepartment &&
        isDepartmentHead;

    const canEditReturnedRequest = request.status === 'draft' && !!currentUser && Number(request.user?.id) === Number(currentUser.id);

    /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

    function approveRequest() {
        if (!canReviewDepartment) {
            return;
        }

        if (!confirm('Approve this Purchase Request and forward it to the next workflow step?')) {
            return;
        }

        router.post(
            `/operations/requests/${request.id}/approve`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN RETURN MODAL
    |--------------------------------------------------------------------------
    */

    function openReturnModal() {
        if (!canReviewDepartment) {
            return;
        }

        setReason('');
        setActionModal('return');
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN REJECT MODAL
    |--------------------------------------------------------------------------
    */

    function openRejectModal() {
        if (!canReviewDepartment) {
            return;
        }

        setReason('');
        setActionModal('reject');
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE ACTION MODAL
    |--------------------------------------------------------------------------
    */

    function closeActionModal() {
        if (processing) {
            return;
        }

        setActionModal(null);
        setReason('');
    }

    /*
    |--------------------------------------------------------------------------
    | SUBMIT ACTION
    |--------------------------------------------------------------------------
    */

    function submitAction() {
        if (!actionModal) {
            return;
        }

        const trimmedReason = reason.trim();

        if (trimmedReason.length < 5) {
            return;
        }

        setProcessing(true);

        const url = actionModal === 'return' ? `/operations/requests/${request.id}/return` : `/operations/requests/${request.id}/reject`;

        router.post(
            url,
            {
                reason: trimmedReason,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setActionModal(null);
                    setReason('');
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={request.request_no} />

            <div className="flex w-full flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* LEFT */}
                    <div className="flex items-start gap-3">
                        <Link
                            href="/operations/requests"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{request.request_no}</h1>

                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>{status.label}</span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">Request Details</p>
                        </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                        {canEditReturnedRequest && (
                            <Link
                                href={`/operations/requests/${request.id}/edit`}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Edit Request
                            </Link>
                        )}

                        <Link
                            href="/operations/requests"
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Back to Requests
                        </Link>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* DEPARTMENT HEAD ACTION PANEL */}
                {/* ====================================================== */}

                {canReviewDepartment && (
                    <section className="w-full overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Department Head Review</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">This request is awaiting your review.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={openReturnModal}
                                    disabled={processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Return
                                </button>

                                <button
                                    type="button"
                                    onClick={openRejectModal}
                                    disabled={processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                </button>

                                <button
                                    type="button"
                                    onClick={approveRequest}
                                    disabled={processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Approve & Forward
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ====================================================== */}
                {/* REQUEST SUMMARY */}
                {/* ====================================================== */}

                <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{requestType}</p>

                                    <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{request.title}</h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">Priority</span>

                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priority.className}`}>{priority.label}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid w-full gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Requested By</p>

                            <div className="mt-2 flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-slate-400" />

                                <span className="text-sm font-medium text-slate-700">{request.user?.name ?? 'Unknown User'}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Department</p>

                            <div className="mt-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />

                                <span className="text-sm font-medium text-slate-700">{request.department?.name ?? 'No Department'}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Submitted</p>

                            <div className="mt-2 flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-slate-400" />

                                <span className="text-sm font-medium text-slate-700">{formatDateTime(request.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* MAIN CONTENT */}
                {/* ====================================================== */}

                <div className="grid w-full gap-5 xl:grid-cols-3">
                    <div className="space-y-5 xl:col-span-2">
                        {/* ================================================== */}
                        {/* PURCHASE INFORMATION */}
                        {/* ================================================== */}

                        {purchaseRequest && (
                            <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <Package className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900">Purchase Information</h2>

                                            <p className="mt-0.5 text-xs text-slate-500">Details of the requested purchase.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 p-6 md:grid-cols-2">
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Purpose</p>

                                        <p className="mt-2 text-sm leading-6 font-medium text-slate-700">{purchaseRequest.purpose}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Requested Date</p>

                                        <div className="mt-2 flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-slate-400" />

                                            <span className="text-sm font-medium text-slate-700">{formatDate(purchaseRequest.requested_date)}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Justification</p>

                                        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">{purchaseRequest.justification}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ================================================== */}
                        {/* PURCHASE ITEMS */}
                        {/* ================================================== */}

                        {purchaseRequest && (
                            <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Requested Items</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">Items included in this purchase request.</p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Total Estimated Cost</p>

                                        <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalEstimatedCost)}</p>
                                    </div>
                                </div>

                                {items.length > 0 ? (
                                    <>
                                        <div className="hidden overflow-x-auto lg:block">
                                            <table className="w-full">
                                                <thead className="border-b border-slate-200 bg-slate-50">
                                                    <tr>
                                                        <th className="w-12 px-4 py-3 text-center text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            #
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            Item Description
                                                        </th>

                                                        <th className="w-28 px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            Quantity
                                                        </th>

                                                        <th className="w-28 px-4 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            Unit
                                                        </th>

                                                        <th className="w-40 px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            Unit Cost
                                                        </th>

                                                        <th className="w-40 px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                            Amount
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-slate-100">
                                                    {items.map((item, index) => (
                                                        <tr key={item.id} className="transition hover:bg-slate-50">
                                                            <td className="px-4 py-4 text-center text-xs font-medium text-slate-400">{index + 1}</td>

                                                            <td className="px-4 py-4">
                                                                <p className="text-sm font-medium text-slate-700">{item.description}</p>
                                                            </td>

                                                            <td className="px-4 py-4 text-right text-sm text-slate-700">{item.quantity}</td>

                                                            <td className="px-4 py-4 text-sm text-slate-600">{item.unit}</td>

                                                            <td className="px-4 py-4 text-right text-sm text-slate-700">
                                                                {formatCurrency(item.estimated_unit_cost)}
                                                            </td>

                                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                                                                {formatCurrency(item.estimated_amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                                <tfoot>
                                                    <tr className="border-t border-slate-200 bg-slate-50">
                                                        <td
                                                            colSpan={5}
                                                            className="px-4 py-4 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
                                                        >
                                                            Total Estimated Cost
                                                        </td>

                                                        <td className="px-4 py-4 text-right text-base font-bold text-slate-900">
                                                            {formatCurrency(totalEstimatedCost)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div className="divide-y divide-slate-100 lg:hidden">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="space-y-3 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                                Item {index + 1}
                                                            </p>

                                                            <p className="mt-1 text-sm font-semibold text-slate-700">{item.description}</p>
                                                        </div>

                                                        <p className="text-sm font-bold text-slate-800">{formatCurrency(item.estimated_amount)}</p>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                                Quantity
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-slate-700">{item.quantity}</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Unit</p>

                                                            <p className="mt-1 text-xs font-medium text-slate-700">{item.unit}</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                                Unit Cost
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-slate-700">
                                                                {formatCurrency(item.estimated_unit_cost)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex items-center justify-between bg-slate-50 px-4 py-4">
                                                <span className="text-xs font-semibold text-slate-500">Total Estimated Cost</span>

                                                <span className="text-base font-bold text-slate-900">{formatCurrency(totalEstimatedCost)}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-10 text-center">
                                        <Package className="mx-auto h-7 w-7 text-slate-300" />

                                        <p className="mt-3 text-sm font-medium text-slate-500">No purchase items found.</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ================================================== */}
                        {/* GENERAL DESCRIPTION */}
                        {/* ================================================== */}

                        {request.description && (
                            <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h2 className="text-sm font-semibold text-slate-900">Additional Notes</h2>
                                </div>

                                <div className="p-6">
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">{request.description}</p>
                                </div>
                            </section>
                        )}

                        {/* ====================================================== */}
                        {/* REQUEST HISTORY */}
                        {/* ====================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h2 className="text-sm font-semibold text-slate-900">Request History</h2>

                                <p className="mt-0.5 text-xs text-slate-500">Actions and decisions made during the request.</p>
                            </div>

                            {request.actions && request.actions.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {request.actions.map((action) => {
                                        const actionLabel =
                                            action.action === 'returned'
                                                ? 'Returned'
                                                : action.action === 'rejected'
                                                  ? 'Rejected'
                                                  : action.action === 'approved'
                                                    ? 'Approved'
                                                    : action.action === 'submitted'
                                                      ? 'Submitted'
                                                      : action.action;

                                        const isRejected = action.action === 'rejected';

                                        const isReturned = action.action === 'returned';

                                        const isApproved = action.action === 'approved';

                                        return (
                                            <div key={action.id} className="p-5">
                                                <div className="flex items-start gap-4">
                                                    {/* ACTION ICON */}

                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                            isRejected
                                                                ? 'bg-red-50 text-red-600'
                                                                : isReturned
                                                                  ? 'bg-amber-50 text-amber-600'
                                                                  : isApproved
                                                                    ? 'bg-emerald-50 text-emerald-600'
                                                                    : 'bg-blue-50 text-blue-600'
                                                        }`}
                                                    >
                                                        {isRejected ? (
                                                            <XCircle className="h-4 w-4" />
                                                        ) : isReturned ? (
                                                            <RotateCcw className="h-4 w-4" />
                                                        ) : isApproved ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : (
                                                            <FileText className="h-4 w-4" />
                                                        )}
                                                    </div>

                                                    {/* ACTION DETAILS */}

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p
                                                                    className={`text-sm font-semibold ${
                                                                        isRejected
                                                                            ? 'text-red-700'
                                                                            : isReturned
                                                                              ? 'text-amber-700'
                                                                              : isApproved
                                                                                ? 'text-emerald-700'
                                                                                : 'text-slate-800'
                                                                    }`}
                                                                >
                                                                    {actionLabel}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                    {action.user?.name ?? 'System'}

                                                                    {action.workflow_step?.name ? ` • ${action.workflow_step.name}` : ''}
                                                                </p>
                                                            </div>

                                                            <p className="text-[10px] text-slate-400">{formatDateTime(action.created_at)}</p>
                                                        </div>

                                                        {/* REASON */}

                                                        {action.reason && (
                                                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                                <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                                    Reason
                                                                </p>

                                                                <p className="mt-1 text-sm leading-5 whitespace-pre-wrap text-slate-700">
                                                                    {action.reason}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                        <FileText className="mx-auto h-6 w-6 text-slate-300" />

                                        <p className="mt-2 text-sm font-medium text-slate-500">No request history yet.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ================================================== */}
                    {/* RIGHT - STATUS */}
                    {/* ================================================== */}

                    <section className="h-fit w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Request Status</h2>

                            <p className="mt-0.5 text-xs text-slate-500">Current request progress.</p>
                        </div>

                        <div className="p-6">
                            <div className="relative">
                                <div className="absolute top-3 left-3 h-[calc(100%-24px)] w-px bg-slate-200" />

                                {/* SUBMITTED */}

                                <div className="relative flex gap-4">
                                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>

                                    <div className="pb-8">
                                        <p className="text-xs font-semibold text-slate-800">Request Submitted</p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">{formatDateTime(request.created_at)}</p>
                                    </div>
                                </div>

                                {/* DEPARTMENT REVIEW */}

                                <div className="relative flex gap-4">
                                    <div
                                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                            request.current_workflow_step?.code === 'DEPARTMENT_HEAD_REVIEW'
                                                ? 'border-2 border-blue-500 bg-blue-50 text-blue-600'
                                                : request.status === 'completed'
                                                  ? 'bg-emerald-500 text-white'
                                                  : 'border-2 border-slate-200 bg-white'
                                        }`}
                                    >
                                        {request.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>

                                    <div className="pb-8">
                                        <p className="text-xs font-semibold text-slate-800">Department Head Review</p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                                            {currentStep?.code === 'DEPARTMENT_HEAD_REVIEW'
                                                ? 'Awaiting department head approval.'
                                                : 'Department review.'}
                                        </p>
                                    </div>
                                </div>

                                {/* PROCESSING */}

                                <div className="relative flex gap-4">
                                    <div
                                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                            request.status === 'completed' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 bg-white'
                                        }`}
                                    >
                                        {request.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>

                                    <div>
                                        <p
                                            className={`text-xs font-semibold ${
                                                request.status === 'completed' ? 'text-slate-800' : 'text-slate-400'
                                            }`}
                                        >
                                            Processing
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                                            {request.status === 'completed' ? 'Request completed.' : 'Will begin after department approval.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ====================================================== */}
                {/* REQUEST META */}
                {/* ====================================================== */}

                <section className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Request Number</p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">{request.request_no}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Request Type</p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">{requestType}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Created</p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(request.created_at)}</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Last Updated</p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(request.updated_at)}</p>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* MOBILE BACK */}
                {/* ====================================================== */}

                <Link
                    href="/operations/requests"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:hidden"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Requests
                </Link>
            </div>

            {/* ========================================================== */}
            {/* ACTION REASON MODAL */}
            {/* ========================================================== */}

            {actionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true">
                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                        actionModal === 'reject' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                    }`}
                                >
                                    {actionModal === 'reject' ? <XCircle className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {actionModal === 'reject' ? 'Reject Purchase Request' : 'Return Purchase Request'}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {actionModal === 'reject'
                                            ? 'Please provide the reason for rejecting this request.'
                                            : 'Please provide the reason for returning this request.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeActionModal}
                                disabled={processing}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* MODAL BODY */}

                        <div className="p-6">
                            <label htmlFor="action-reason" className="text-xs font-semibold text-slate-700">
                                Reason
                            </label>

                            <textarea
                                id="action-reason"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                rows={5}
                                maxLength={2000}
                                autoFocus
                                placeholder={
                                    actionModal === 'reject' ? 'Enter the reason for rejection...' : 'Enter the reason for returning this request...'
                                }
                                className="mt-2 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-[10px] text-slate-400">Minimum 5 characters.</p>

                                <p className="text-[10px] text-slate-400">{reason.length}/2000</p>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeActionModal}
                                disabled={processing}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={submitAction}
                                disabled={processing || reason.trim().length < 5}
                                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    actionModal === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                                }`}
                            >
                                {actionModal === 'reject' ? <XCircle className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}

                                {processing ? 'Processing...' : actionModal === 'reject' ? 'Reject Request' : 'Return Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
