import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList } from 'lucide-react';

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
                {/* Header */}

                <div className="flex items-center gap-3">
                    <Link
                        href="/operations/requests"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-blue-600" />

                            <h1 className="text-2xl font-semibold text-slate-900">New Request</h1>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">Create a new municipal request.</p>
                    </div>
                </div>

                {/* Form */}

                <form onSubmit={submit} className="max-w-3xl">
                    <div className="rounded-xl border bg-white shadow-sm">
                        {/* Requester */}

                        <div className="border-b p-6">
                            <h2 className="text-sm font-semibold text-slate-900">Requester</h2>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Requested By</label>

                                    <div className="mt-1.5 rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{user.name}</div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-600">Department</label>

                                    <div className="mt-1.5 rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                                        {user.department?.name ?? 'No Department'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Request Information */}

                        <div className="space-y-5 p-6">
                            <h2 className="text-sm font-semibold text-slate-900">Request Information</h2>

                            {/* Type */}

                            <div>
                                <label htmlFor="type" className="text-xs font-medium text-slate-600">
                                    Request Type
                                </label>

                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                >
                                    <option value="general">General Request</option>

                                    <option value="purchase">Purchase Request</option>

                                    <option value="procurement">Procurement Request</option>

                                    <option value="service">Service Request</option>

                                    <option value="maintenance">Maintenance Request</option>

                                    <option value="repair">Repair Request</option>

                                    <option value="equipment">Equipment Request</option>

                                    <option value="vehicle">Vehicle Request</option>

                                    <option value="personnel">Personnel Request</option>

                                    <option value="travel">Travel Request</option>

                                    <option value="training">Training Request</option>

                                    <option value="supply">Supply Request</option>

                                    <option value="it_support">IT Support Request</option>

                                    <option value="facility">Facility Request</option>

                                    <option value="document">Document Request</option>

                                    <option value="financial">Financial Request</option>

                                    <option value="event">Event Request</option>

                                    <option value="project">Project Request</option>

                                    <option value="inspection">Inspection Request</option>

                                    <option value="permit_clearance">Permit / Clearance Request</option>

                                    <option value="assistance">Assistance Request</option>

                                    <option value="other">Other Request</option>
                                </select>

                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            {/* Title */}

                            <div>
                                <label htmlFor="title" className="text-xs font-medium text-slate-600">
                                    Title
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter request title"
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />

                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            {/* Description */}

                            <div>
                                <label htmlFor="description" className="text-xs font-medium text-slate-600">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe your request..."
                                    rows={5}
                                    className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />

                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>

                            {/* Priority */}

                            <div>
                                <label htmlFor="priority" className="text-xs font-medium text-slate-600">
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                >
                                    <option value="low">Low</option>

                                    <option value="normal">Normal</option>

                                    <option value="high">High</option>

                                    <option value="urgent">Urgent</option>
                                </select>

                                {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                            <Link
                                href="/operations/requests"
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
