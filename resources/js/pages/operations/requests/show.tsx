import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, CheckCircle2, Clock3, FileText, UserRound } from 'lucide-react';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
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
}

interface PageProps {
    request: OperationRequest;
}

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

const statusConfig = {
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

const priorityConfig = {
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

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

function formatDateTime(date: string) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

export default function ShowRequest({ request }: PageProps) {
    const status = statusConfig[request.status] ?? statusConfig.pending;

    const priority = priorityConfig[request.priority] ?? priorityConfig.normal;

    const requestType = requestTypeLabels[request.type] ?? request.type;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={request.request_no} />

            <div className="flex w-full flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

                    <Link
                        href="/operations/requests"
                        className="hidden h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
                    >
                        Back to Requests
                    </Link>
                </div>

                {/* ====================================================== */}
                {/* REQUEST SUMMARY */}
                {/* ====================================================== */}

                <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{requestType}</p>

                                        <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{request.title}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">Priority</span>

                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priority.className}`}>{priority.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* REQUESTER */}
                    {/* ================================================== */}

                    <div className="grid w-full gap-5 p-6 lg:grid-cols-3">
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
                    {/* ================================================== */}
                    {/* REQUEST INFORMATION */}
                    {/* ================================================== */}

                    <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Request Information</h2>

                            <p className="mt-0.5 text-xs text-slate-500">Details submitted by the requester.</p>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Description */}

                            <div>
                                <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Description</p>

                                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    {request.description ? (
                                        <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">{request.description}</p>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No description provided.</p>
                                    )}
                                </div>
                            </div>

                            {/* Purchase Request Placeholder */}

                            {request.type === 'purchase' && (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Purchase Items</p>

                                            <p className="mt-1 text-xs text-slate-500">Purchase request items will appear here.</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                        <FileText className="mx-auto h-6 w-6 text-slate-300" />

                                        <p className="mt-2 text-xs font-medium text-slate-500">Purchase details are not loaded yet.</p>

                                        <p className="mt-1 text-[10px] text-slate-400">
                                            We will connect the purchase request items after the purchase tables are created.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ================================================== */}
                    {/* STATUS / WORKFLOW */}
                    {/* ================================================== */}

                    <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h2 className="text-sm font-semibold text-slate-900">Request Status</h2>

                            <p className="mt-0.5 text-xs text-slate-500">Current request progress.</p>
                        </div>

                        <div className="p-6">
                            <div className="relative">
                                {/* Vertical line */}

                                <div className="absolute top-3 left-3 h-[calc(100%-24px)] w-px bg-slate-200" />

                                {/* Submitted */}

                                <div className="relative flex gap-4">
                                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>

                                    <div className="pb-7">
                                        <p className="text-xs font-semibold text-slate-800">Request Submitted</p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">{formatDateTime(request.created_at)}</p>
                                    </div>
                                </div>

                                {/* Department Review */}

                                <div className="relative flex gap-4">
                                    <div
                                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                            request.status === 'approved'
                                                ? 'bg-emerald-500 text-white'
                                                : 'border-2 border-slate-200 bg-white text-transparent'
                                        }`}
                                    >
                                        {request.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>

                                    <div className="pb-7">
                                        <p className="text-xs font-semibold text-slate-800">Department Review</p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">Awaiting department approval.</p>
                                    </div>
                                </div>

                                {/* Processing */}

                                <div className="relative flex gap-4">
                                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white ring-4 ring-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Processing</p>

                                        <p className="mt-1 text-[10px] leading-4 text-slate-400">Will begin after approval.</p>
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
        </AppLayout>
    );
}
