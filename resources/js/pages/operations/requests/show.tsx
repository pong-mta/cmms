import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    MapPin,
    Package,
    Play,
    Send,
    User,
    XCircle,
} from 'lucide-react';

import type { ReactNode } from 'react';


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

interface UserData {
    id: number;
    name: string;
    phone?: string;
    department_id?: number | null;
    department?: Department | null;
    roles?: Role[];
}

interface Role {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    asset_code: string;
    name: string;
}

interface PurchaseItem {
    id: number;
    description: string;
    quantity: number | string;
    unit?: string | null;
    estimated_unit_price: number | string;
    estimated_amount: number | string;
    remarks?: string | null;
}

interface ReimbursementItem {
    id: number;
    expense_date?: string | null;
    expense_type?: string | null;
    description: string;
    amount: number | string;
    receipt_reference?: string | null;
    remarks?: string | null;
}

interface TravelDetails {
    id: number;
    destination?: string | null;
    purpose?: string | null;
    departure_date?: string | null;
    return_date?: string | null;
    mode_of_travel?: string | null;
    accommodation?: string | null;
    estimated_transportation: number | string;
    estimated_accommodation: number | string;
    estimated_meals: number | string;
    estimated_registration: number | string;
    estimated_other: number | string;
    estimated_total: number | string;
    funding_source?: string | null;
    remarks?: string | null;
}

interface History {
    id: number;

    action: string;

    from_status?: string | null;

    to_status?: string | null;

    remarks?: string | null;

    created_at: string;

    user?: UserData | null;
}

interface Attachment {
    id: number;

    original_name: string;

    file_name?: string | null;

    path?: string | null;

    mime_type?: string | null;

    size?: number | null;

    description?: string | null;

    created_at: string;

    uploaded_by?: UserData | null;
}

interface ServiceRequest {
    id: number;

    request_code: string;

    request_type:
    | string
    | {
          id: number;
          code: string;
          name: string;
          category?: string | null;
      };
    request_type_id?: number | null;

    requestType?: {
        id: number;
        code: string;
        name: string;
        category?: string | null;
    } | null;

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

    requested_by?: UserData | null;

    assigned_department?: Department | null;

    assigned_to?: UserData | null;

    asset?: Asset | null;

    purchase_items?: PurchaseItem[];
    reimbursement_items?: ReimbursementItem[];
    travel_details?: TravelDetails | null;

    reviewed_by?: UserData | null;

    approved_by?: UserData | null;

    completed_by?: UserData | null;

    histories?: History[];

    attachments?: Attachment[];
}

interface AuthData {
    user: UserData;
}

interface PageProps {
    auth: AuthData;
}

interface Props {
    request: ServiceRequest;

    user: UserData;
}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizeRole(
    role: unknown,
): string {

    return String(role ?? '')
        .toLowerCase()
        .trim()
        .replace(/[- ]/g, '_');
}


function getRoleNames(
    user?: UserData | null,
): string[] {

    return (
        user?.roles?.map(
            (role) =>
                normalizeRole(role.name),
        ) ?? []
    );
}


function isSupervisor(
    user?: UserData | null,
): boolean {

    const roles =
        getRoleNames(user);

    return (
        roles.includes('supervisor') ||
        roles.includes(
            'department_supervisor',
        )
    );
}


function isHead(
    user?: UserData | null,
): boolean {

    const roles =
        getRoleNames(user);

    return (
        roles.includes('head') ||
        roles.includes('department_head') ||
        roles.includes('office_head')
    );
}


function formatStatus(
    status?: unknown,
): string {

    if (status === null || status === undefined || status === '') {
        return '—';
    }

    return String(status)
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


function formatCurrency(
    value?: number | string | null,
): string {

    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return '₱0.00';
    }

    return amount.toLocaleString(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );
}


function formatFileSize(
    bytes?: number | null,
): string {

    if (!bytes) {
        return '';
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
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
    user,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | CURRENT AUTH USER
    |--------------------------------------------------------------------------
    */

    const page =
        usePage<PageProps>();

    const currentUser =
        page.props.auth.user ?? user;


    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    const supervisor =
        isSupervisor(currentUser);

    const head =
        isHead(currentUser);

    const requestTypeName =
    typeof request.request_type === 'object' &&
    request.request_type !== null
        ? request.request_type.name
        : String(request.request_type ?? 'Request');


    /*
    |--------------------------------------------------------------------------
    | WORKFLOW FORMS
    |--------------------------------------------------------------------------
    */

    const reviewForm =
        useForm({
            remarks: '',
        });


    const actionForm =
        useForm({
            remarks: '',
        });


    /*
    |--------------------------------------------------------------------------
    | WORKFLOW ACTIONS
    |--------------------------------------------------------------------------
    */

    function reviewRequest() {

        reviewForm.post(
            `/operations/requests/${request.id}/review`,
            {
                preserveScroll: true,
            },
        );
    }


    function approveRequest() {

        actionForm.post(
            `/operations/requests/${request.id}/approve`,
            {
                preserveScroll: true,
            },
        );
    }


    function rejectRequest() {

        const remarks =
            window.prompt(
                'Please enter the reason for rejecting this request:',
            );

        if (!remarks?.trim()) {
            return;
        }

        actionForm.setData(
            'remarks',
            remarks,
        );

        actionForm.post(
            `/operations/requests/${request.id}/reject`,
            {
                preserveScroll: true,
            },
        );
    }


    function startRequest() {

        actionForm.post(
            `/operations/requests/${request.id}/start`,
            {
                preserveScroll: true,
            },
        );
    }


    function completeRequest() {

        const remarks =
            window.prompt(
                'Enter completion remarks (optional):',
            );

        actionForm.setData(
            'remarks',
            remarks ?? '',
        );

        actionForm.post(
            `/operations/requests/${request.id}/complete`,
            {
                preserveScroll: true,
            },
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DETERMINE AVAILABLE ACTION
    |--------------------------------------------------------------------------
    */

    const canReview =
        supervisor &&
        request.status === 'pending';


    const canApprove =
        head &&
        request.status ===
            'for_head_review';


    const canStart =
        (supervisor || head) &&
        (
            request.status ===
                'approved' ||
            request.status ===
                'assigned'
        );


    const canComplete =
        (supervisor || head) &&
        request.status ===
            'in_progress';


    const hasActions =
        canReview ||
        canApprove ||
        canStart ||
        canComplete;


    /*
    |--------------------------------------------------------------------------
    | SPECIALIZED REQUEST DATA
    |--------------------------------------------------------------------------
    */

    const purchaseItems =
        request.purchase_items ?? [];

    const reimbursementItems =
        request.reimbursement_items ?? [];

    const travelDetails =
        request.travel_details ?? null;

    const purchaseTotal =
        purchaseItems.reduce(
            (total, item) =>
                total + Number(item.estimated_amount ?? 0),
            0,
        );

    const reimbursementTotal =
        reimbursementItems.reduce(
            (total, item) =>
                total + Number(item.amount ?? 0),
            0,
        );

    const travelTotal =
        travelDetails
            ? Number(travelDetails.estimated_transportation ?? 0) +
              Number(travelDetails.estimated_accommodation ?? 0) +
              Number(travelDetails.estimated_meals ?? 0) +
              Number(travelDetails.estimated_registration ?? 0) +
              Number(travelDetails.estimated_other ?? 0)
            : 0;


    /*
    |--------------------------------------------------------------------------
    | BREADCRUMBS
    |--------------------------------------------------------------------------
    */

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
            href:
                `/operations/requests/${request.id}`,
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout
            breadcrumbs={breadcrumbs}
        >

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

                                {requestTypeName}

                                {' • '}

                                Requested{' '}

                                {formatDate(
                                    request.requested_at,
                                )}

                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT BANNER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                                <ClipboardList className="h-5 w-5" />

                            </div>


                            <div>

                                <p className="text-xs font-medium text-blue-600">
                                    Requesting Department
                                </p>


                                <p className="text-sm font-semibold text-slate-800">
                                    {request.department?.name ??
                                        'No Department'}
                                </p>

                            </div>

                        </div>


                        <div className="text-xs text-slate-500">

                            Requester:{' '}

                            <span className="font-semibold text-slate-700">
                                {request.requested_by?.name ??
                                    'Unknown'}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* MAIN */}
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
                                        value={requestTypeName}
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
                                            request.requested_by?.name ??
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
                                                : 'No related asset'
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
                        {/* PURCHASE REQUEST */}
                        {/* ================================================== */}

                        {purchaseItems.length > 0 && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Purchase Request
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Requested items and estimated costs
                                    </p>
                                </div>

                                <div className="p-5">

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[720px] text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                                                    <th className="px-3 py-3 font-semibold">Item</th>
                                                    <th className="px-3 py-3 font-semibold">Qty</th>
                                                    <th className="px-3 py-3 font-semibold">Unit</th>
                                                    <th className="px-3 py-3 font-semibold text-right">Unit Price</th>
                                                    <th className="px-3 py-3 font-semibold text-right">Amount</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {purchaseItems.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-slate-50 last:border-0"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <p className="text-xs font-semibold text-slate-700">
                                                                {item.description}
                                                            </p>

                                                            {item.remarks && (
                                                                <p className="mt-1 text-[10px] text-slate-400">
                                                                    {item.remarks}
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-3 text-xs text-slate-600">
                                                            {String(item.quantity ?? 0)}
                                                        </td>

                                                        <td className="px-3 py-3 text-xs text-slate-600">
                                                            {item.unit ?? '—'}
                                                        </td>

                                                        <td className="px-3 py-3 text-right text-xs text-slate-600">
                                                            {formatCurrency(item.estimated_unit_price)}
                                                        </td>

                                                        <td className="px-3 py-3 text-right text-xs font-semibold text-slate-800">
                                                            {formatCurrency(item.estimated_amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                                        <span className="text-xs font-semibold text-slate-600">
                                            Estimated Purchase Total
                                        </span>

                                        <span className="text-base font-bold text-blue-700">
                                            {formatCurrency(purchaseTotal)}
                                        </span>
                                    </div>

                                </div>

                            </section>
                        )}


                        {/* ================================================== */}
                        {/* REIMBURSEMENT */}
                        {/* ================================================== */}

                        {reimbursementItems.length > 0 && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Reimbursement
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Expenses submitted for reimbursement
                                    </p>
                                </div>

                                <div className="p-5">

                                    <div className="space-y-3">

                                        {reimbursementItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                            >

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <span className="text-xs font-semibold text-slate-800">
                                                                {item.description}
                                                            </span>

                                                            {item.expense_type && (
                                                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                                                                    {item.expense_type}
                                                                </span>
                                                            )}

                                                        </div>

                                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">

                                                            {item.expense_date && (
                                                                <span>
                                                                    {formatDate(item.expense_date)}
                                                                </span>
                                                            )}

                                                            {item.receipt_reference && (
                                                                <span>
                                                                    Receipt: {item.receipt_reference}
                                                                </span>
                                                            )}

                                                        </div>

                                                        {item.remarks && (
                                                            <p className="mt-2 text-[10px] text-slate-500">
                                                                {item.remarks}
                                                            </p>
                                                        )}

                                                    </div>

                                                    <span className="shrink-0 text-sm font-bold text-slate-800">
                                                        {formatCurrency(item.amount)}
                                                    </span>

                                                </div>

                                            </div>
                                        ))}

                                    </div>

                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                                        <span className="text-xs font-semibold text-slate-600">
                                            Total Reimbursement
                                        </span>

                                        <span className="text-base font-bold text-blue-700">
                                            {formatCurrency(reimbursementTotal)}
                                        </span>
                                    </div>

                                </div>

                            </section>
                        )}


                        {/* ================================================== */}
                        {/* TRAVEL */}
                        {/* ================================================== */}

                        {travelDetails && (

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-5 py-4">

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Travel Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Official travel information and estimated expenses
                                    </p>

                                </div>

                                <div className="p-5">

                                    <div className="grid gap-5 sm:grid-cols-2">

                                        <InfoItem
                                            icon={
                                                <MapPin className="h-4 w-4" />
                                            }
                                            label="Destination"
                                            value={
                                                travelDetails.destination ?? '—'
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <CalendarDays className="h-4 w-4" />
                                            }
                                            label="Travel Dates"
                                            value={
                                                travelDetails.departure_date &&
                                                travelDetails.return_date
                                                    ? `${formatDate(travelDetails.departure_date)} — ${formatDate(travelDetails.return_date)}`
                                                    : '—'
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <ClipboardList className="h-4 w-4" />
                                            }
                                            label="Mode of Travel"
                                            value={
                                                travelDetails.mode_of_travel ?? '—'
                                            }
                                        />

                                        <InfoItem
                                            icon={
                                                <Package className="h-4 w-4" />
                                            }
                                            label="Accommodation"
                                            value={
                                                travelDetails.accommodation ?? '—'
                                            }
                                        />

                                        <div className="sm:col-span-2">

                                            <p className="mb-2 text-xs font-semibold text-slate-500">
                                                Purpose
                                            </p>

                                            <div className="rounded-xl bg-slate-50 px-4 py-3">
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                    {travelDetails.purpose || 'No purpose provided.'}
                                                </p>
                                            </div>

                                        </div>

                                    </div>


                                    <div className="mt-6 border-t border-slate-100 pt-5">

                                        <p className="mb-3 text-xs font-semibold text-slate-500">
                                            Estimated Travel Expenses
                                        </p>

                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                            <CostItem
                                                label="Transportation"
                                                value={travelDetails.estimated_transportation}
                                            />

                                            <CostItem
                                                label="Accommodation"
                                                value={travelDetails.estimated_accommodation}
                                            />

                                            <CostItem
                                                label="Meals"
                                                value={travelDetails.estimated_meals}
                                            />

                                            <CostItem
                                                label="Registration"
                                                value={travelDetails.estimated_registration}
                                            />

                                            <CostItem
                                                label="Other"
                                                value={travelDetails.estimated_other}
                                            />

                                            <CostItem
                                                label="Funding Source"
                                                value={travelDetails.funding_source}
                                                currency={false}
                                            />

                                        </div>

                                    </div>


                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">

                                        <span className="text-xs font-semibold text-slate-600">
                                            Estimated Travel Total
                                        </span>

                                        <span className="text-base font-bold text-blue-700">
                                            {formatCurrency(travelTotal)}
                                        </span>

                                    </div>


                                    {travelDetails.remarks && (

                                        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">

                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                Travel Remarks
                                            </p>

                                            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                                {travelDetails.remarks}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </section>
                        )}


                        {/* ================================================== */}
                        {/* ASSIGNMENT */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Assignment
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Current responsibility for this request
                                </p>

                            </div>


                            <div className="grid gap-5 p-5 sm:grid-cols-2">


                                <InfoItem
                                    icon={
                                        <BuildingIcon />
                                    }
                                    label="Assigned Department"
                                    value={
                                        request.assigned_department?.name ??
                                        'Not assigned'
                                    }
                                />


                                <InfoItem
                                    icon={
                                        <User className="h-4 w-4" />
                                    }
                                    label="Assigned To"
                                    value={
                                        request.assigned_to?.name ??
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

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">

                                                            <FileText className="h-4 w-4" />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="truncate text-xs font-semibold text-slate-700">
                                                                {
                                                                    attachment.original_name
                                                                }
                                                            </p>


                                                            <p className="mt-0.5 text-[10px] text-slate-400">

                                                                {
                                                                    attachment.uploaded_by?.name ??
                                                                    'Unknown'
                                                                }

                                                                {' • '}

                                                                {formatDate(
                                                                    attachment.created_at,
                                                                )}

                                                                {attachment.size
                                                                    ? ` • ${formatFileSize(attachment.size)}`
                                                                    : ''}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    {attachment.path && (

                                                        <a
                                                            href={
                                                                attachment.path
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="ml-3 shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            View
                                                        </a>

                                                    )}

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
                        {/* WORKFLOW ACTIONS */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Actions
                                </h2>


                                <p className="mt-1 text-xs text-slate-500">
                                    Available workflow actions
                                </p>

                            </div>


                            <div className="space-y-3 p-5">


                                {/* ================================================== */}
                                {/* SUPERVISOR REVIEW */}
                                {/* ================================================== */}

                                {canReview && (

                                    <>

                                        <button
                                            type="button"
                                            disabled={
                                                reviewForm.processing
                                            }
                                            onClick={
                                                reviewRequest
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <Send className="h-4 w-4" />

                                            {reviewForm.processing
                                                ? 'Reviewing...'
                                                : 'Review & Forward to Head'}

                                        </button>


                                        <button
                                            type="button"
                                            disabled={
                                                actionForm.processing
                                            }
                                            onClick={
                                                rejectRequest
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <XCircle className="h-4 w-4" />

                                            Reject Request

                                        </button>

                                    </>

                                )}


                                {/* ================================================== */}
                                {/* HEAD APPROVAL */}
                                {/* ================================================== */}

                                {canApprove && (

                                    <>

                                        <button
                                            type="button"
                                            disabled={
                                                actionForm.processing
                                            }
                                            onClick={
                                                approveRequest
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <CheckCircle2 className="h-4 w-4" />

                                            {actionForm.processing
                                                ? 'Approving...'
                                                : 'Approve Request'}

                                        </button>


                                        <button
                                            type="button"
                                            disabled={
                                                actionForm.processing
                                            }
                                            onClick={
                                                rejectRequest
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <XCircle className="h-4 w-4" />

                                            Reject Request

                                        </button>

                                    </>

                                )}


                                {/* ================================================== */}
                                {/* START */}
                                {/* ================================================== */}

                                {canStart && (

                                    <button
                                        type="button"
                                        disabled={
                                            actionForm.processing
                                        }
                                        onClick={
                                            startRequest
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <Play className="h-4 w-4" />

                                        {actionForm.processing
                                            ? 'Starting...'
                                            : 'Start Request'}

                                    </button>

                                )}


                                {/* ================================================== */}
                                {/* COMPLETE */}
                                {/* ================================================== */}

                                {canComplete && (

                                    <button
                                        type="button"
                                        disabled={
                                            actionForm.processing
                                        }
                                        onClick={
                                            completeRequest
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <CheckCircle2 className="h-4 w-4" />

                                        {actionForm.processing
                                            ? 'Completing...'
                                            : 'Mark Completed'}

                                    </button>

                                )}


                                {/* ================================================== */}
                                {/* NO ACTION */}
                                {/* ================================================== */}

                                {!hasActions && (

                                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">

                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />


                                        <div>

                                            <p className="text-xs font-semibold text-slate-700">
                                                No action available
                                            </p>


                                            <p className="mt-1 text-xs leading-5 text-slate-500">

                                                {request.status ===
                                                    'pending' &&
                                                !supervisor
                                                    ? 'This request is waiting for the department supervisor.'
                                                    : request.status ===
                                                        'for_head_review' &&
                                                      !head
                                                    ? 'This request is waiting for the department head.'
                                                    : request.status ===
                                                        'completed'
                                                    ? 'This request has already been completed.'
                                                    : request.status ===
                                                        'rejected'
                                                    ? 'This request has been rejected.'
                                                    : 'There is no workflow action available for your role at this stage.'}

                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* REQUEST TIMELINE */}
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

                                                            {history.user?.name ??
                                                                'System'}

                                                            {' • '}

                                                            {formatDate(
                                                                history.created_at,
                                                            )}

                                                        </p>


                                                        {history.from_status &&
                                                        history.to_status && (

                                                            <p className="mt-1 text-[10px] text-slate-400">

                                                                {formatStatus(
                                                                    history.from_status,
                                                                )}

                                                                {' → '}

                                                                {formatStatus(
                                                                    history.to_status,
                                                                )}

                                                            </p>

                                                        )}


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

                                    <div className="py-6 text-center">

                                        <Clock3 className="mx-auto h-5 w-5 text-slate-300" />


                                        <p className="mt-2 text-xs text-slate-400">
                                            No activity recorded yet.
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* WORKFLOW INFORMATION */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Workflow Information
                                </h2>

                            </div>


                            <div className="divide-y divide-slate-100">


                                <WorkflowItem
                                    label="Supervisor Review"
                                    value={
                                        request.reviewed_by?.name ??
                                        'Not reviewed'
                                    }
                                    date={
                                        request.reviewed_at
                                    }
                                />


                                <WorkflowItem
                                    label="Head Approval"
                                    value={
                                        request.approved_by?.name ??
                                        'Not approved'
                                    }
                                    date={
                                        request.approved_at
                                    }
                                />


                                <WorkflowItem
                                    label="Completion"
                                    value={
                                        request.completed_by?.name ??
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
    icon: ReactNode;
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
| COST ITEM
|--------------------------------------------------------------------------
*/

function CostItem({
    label,
    value,
    currency = true,
}: {
    label: string;
    value?: number | string | null;
    currency?: boolean;
}) {

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
                {currency
                    ? formatCurrency(value)
                    : String(value ?? '—')}
            </p>

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
| BUILDING ICON
|--------------------------------------------------------------------------
*/

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