import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, ClipboardList, FileText, UserRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requests',
        href: '/operations/requests',
    },
    {
        title: 'New Request',
        href: '/operations/requests/create',
    },
];

interface Department {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    department?: Department | null;
}

interface PageProps {
    auth: {
        user: User;
    };
}

interface RequestForm {
    type: string;
    title: string;
    description: string;
    priority: string;
}

const requestTypes = [
    {
        value: 'general',
        label: 'General Request',
    },
    {
        value: 'purchase',
        label: 'Purchase Request',
    },
    {
        value: 'procurement',
        label: 'Procurement Request',
    },
    {
        value: 'service',
        label: 'Service Request',
    },
    {
        value: 'maintenance',
        label: 'Maintenance Request',
    },
    {
        value: 'repair',
        label: 'Repair Request',
    },
    {
        value: 'equipment',
        label: 'Equipment Request',
    },
    {
        value: 'vehicle',
        label: 'Vehicle Request',
    },
    {
        value: 'personnel',
        label: 'Personnel Request',
    },
    {
        value: 'travel',
        label: 'Travel Request',
    },
    {
        value: 'training',
        label: 'Training Request',
    },
    {
        value: 'supply',
        label: 'Supply Request',
    },
    {
        value: 'it_support',
        label: 'IT Support Request',
    },
    {
        value: 'facility',
        label: 'Facility Request',
    },
    {
        value: 'document',
        label: 'Document Request',
    },
    {
        value: 'financial',
        label: 'Financial Request',
    },
    {
        value: 'event',
        label: 'Event Request',
    },
    {
        value: 'project',
        label: 'Project Request',
    },
    {
        value: 'inspection',
        label: 'Inspection Request',
    },
    {
        value: 'permit_clearance',
        label: 'Permit / Clearance Request',
    },
    {
        value: 'assistance',
        label: 'Assistance Request',
    },
    {
        value: 'other',
        label: 'Other Request',
    },
];

const priorities = [
    {
        value: 'low',
        label: 'Low',
        description: 'Can be handled normally',
    },
    {
        value: 'normal',
        label: 'Normal',
        description: 'Regular priority',
    },
    {
        value: 'high',
        label: 'High',
        description: 'Needs attention soon',
    },
    {
        value: 'urgent',
        label: 'Urgent',
        description: 'Requires immediate attention',
    },
];

export default function CreateRequest() {
    const { auth } = usePage<PageProps>().props;

    const user = auth.user;

    const { data, setData, post, processing, errors } = useForm<RequestForm>({
        type: 'general',
        title: '',
        description: '',
        priority: 'normal',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/operations/requests');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Request" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex items-start gap-3">
                    <Link
                        href="/operations/requests"
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-blue-600" />

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New Request</h1>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">Submit a request for municipal operations.</p>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form onSubmit={submit} className="w-full max-w-4xl">
                    <div className="space-y-6">
                        {/* ================================================== */}
                        {/* REQUESTER */}
                        {/* ================================================== */}

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <UserRound className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Requester Information</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">Automatically assigned from your account.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Requested By</label>

                                    <div className="mt-2 flex min-h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                                        {user.name}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Department</label>

                                    <div className="mt-2 flex min-h-10 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <span className="text-sm text-slate-700">{user.department?.name ?? 'No Department'}</span>

                                        {user.department?.code && (
                                            <span className="ml-3 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                {user.department.code}
                                            </span>
                                        )}
                                    </div>

                                    {errors.department && <p className="mt-1.5 text-xs text-red-600">{errors.department}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ================================================== */}
                        {/* REQUEST DETAILS */}
                        {/* ================================================== */}

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Request Details</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">Provide the information needed to process your request.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-6">
                                {/* Request Type */}

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="type" className="text-xs font-semibold text-slate-700">
                                            Request Type
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>
                                    </div>

                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    >
                                        {requestTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.type && <p className="mt-1.5 text-xs text-red-600">{errors.type}</p>}
                                </div>

                                {/* Title */}

                                <div>
                                    <label htmlFor="title" className="text-xs font-semibold text-slate-700">
                                        Request Title
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter a short title for your request"
                                        className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />

                                    {errors.title && <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>}
                                </div>

                                {/* Description */}

                                <div>
                                    <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Provide details about your request..."
                                        rows={6}
                                        className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />

                                    {errors.description && <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>}
                                </div>

                                {/* Priority */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Priority
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {priorities.map((priority) => {
                                            const selected = data.priority === priority.value;

                                            return (
                                                <button
                                                    key={priority.value}
                                                    type="button"
                                                    onClick={() => setData('priority', priority.value)}
                                                    className={`relative rounded-lg border p-3 text-left transition ${
                                                        selected
                                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {selected && (
                                                        <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                                                            <Check className="h-2.5 w-2.5" />
                                                        </div>
                                                    )}

                                                    <p className={`text-xs font-semibold ${selected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                        {priority.label}
                                                    </p>

                                                    <p className="mt-1 pr-3 text-[10px] leading-4 text-slate-400">{priority.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {errors.priority && <p className="mt-1.5 text-xs text-red-600">{errors.priority}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ================================================== */}
                        {/* ACTIONS */}
                        {/* ================================================== */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <Link
                                href="/operations/requests"
                                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="button"
                                disabled={processing}
                                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Save Draft
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
