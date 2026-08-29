import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Eye, Plus, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requests',
        href: '/operations/requests',
    },
];

interface RequestUser {
    id: number;
    name: string;
}

interface RequestDepartment {
    id: number;
    name: string;
    code: string;
}

interface OperationRequest {
    id: number;
    request_no: string;
    type: string;
    title: string;
    description?: string | null;
    priority: string;
    status: string;
    created_at: string;
    user?: RequestUser;
    department?: RequestDepartment;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRequests {
    data: OperationRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface PageProps {
    requests: PaginatedRequests;
}

export default function RequestsIndex({ requests }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requests" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <ClipboardList className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Requests</h1>

                                <p className="text-sm text-slate-500">Manage municipal requests.</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/operations/requests/create"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        New Request
                    </Link>
                </div>

                {/* ====================================================== */}
                {/* FILTERS */}
                {/* ====================================================== */}

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row">
                        {/* Search */}

                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search requests..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-10 text-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Status */}

                        <select
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-500"
                            defaultValue=""
                        >
                            <option value="">All Status</option>

                            <option value="draft">Draft</option>

                            <option value="submitted">Submitted</option>

                            <option value="pending">Pending</option>

                            <option value="approved">Approved</option>

                            <option value="rejected">Rejected</option>

                            <option value="completed">Completed</option>
                        </select>

                        {/* Priority */}

                        <select
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-500"
                            defaultValue=""
                        >
                            <option value="">All Priority</option>

                            <option value="low">Low</option>

                            <option value="normal">Normal</option>

                            <option value="high">High</option>

                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* REQUEST TABLE */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Request</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Type</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Department</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Requested By</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Priority</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>

                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">Date</th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                    <ClipboardList className="h-6 w-6" />
                                                </div>

                                                <p className="mt-4 text-sm font-semibold text-slate-700">No requests found</p>

                                                <p className="mt-1 text-xs text-slate-400">There are no requests to display.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((request) => (
                                        <tr key={request.id} className="transition hover:bg-slate-50">
                                            {/* Request */}

                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-blue-600">{request.request_no}</p>

                                                    <p className="mt-1 max-w-xs truncate text-sm font-medium text-slate-800">{request.title}</p>
                                                </div>
                                            </td>

                                            {/* Type */}

                                            <td className="px-5 py-4">
                                                <span className="text-xs text-slate-600 capitalize">{request.type.replace(/_/g, ' ')}</span>
                                            </td>

                                            {/* Department */}

                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-700">{request.department?.name ?? '—'}</p>

                                                    {request.department?.code && (
                                                        <p className="mt-0.5 text-[10px] text-slate-400">{request.department.code}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Requested By */}

                                            <td className="px-5 py-4">
                                                <span className="text-xs text-slate-600">{request.user?.name ?? '—'}</span>
                                            </td>

                                            {/* Priority */}

                                            <td className="px-5 py-4">
                                                <PriorityBadge priority={request.priority} />
                                            </td>

                                            {/* Status */}

                                            <td className="px-5 py-4">
                                                <StatusBadge status={request.status} />
                                            </td>

                                            {/* Date */}

                                            <td className="px-5 py-4">
                                                <span className="text-xs text-slate-500">{formatDate(request.created_at)}</span>
                                            </td>

                                            {/* Action */}

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end">
                                                    <Link
                                                        href={`/operations/requests/${request.id}`}
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        title="View Request"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />

                                                        <span>View</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ================================================== */}
                    {/* PAGINATION */}
                    {/* ================================================== */}

                    {requests.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Showing <span className="font-medium">{requests.data.length}</span> of{' '}
                                <span className="font-medium">{requests.total}</span> requests
                            </p>

                            <div className="flex gap-1">
                                {requests.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                  ? 'text-slate-600 hover:bg-slate-100'
                                                  : 'cursor-not-allowed text-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-600',

        submitted: 'bg-blue-50 text-blue-700',

        pending: 'bg-amber-50 text-amber-700',

        approved: 'bg-emerald-50 text-emerald-700',

        rejected: 'bg-red-50 text-red-700',

        completed: 'bg-green-50 text-green-700',
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}
        >
            {status.replace(/_/g, ' ')}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| PRIORITY BADGE
|--------------------------------------------------------------------------
*/

function PriorityBadge({ priority }: { priority: string }) {
    const styles: Record<string, string> = {
        low: 'bg-slate-100 text-slate-600',

        normal: 'bg-blue-50 text-blue-700',

        high: 'bg-orange-50 text-orange-700',

        urgent: 'bg-red-50 text-red-700',
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
                styles[priority] ?? 'bg-slate-100 text-slate-600'
            }`}
        >
            {priority}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
