import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    ClipboardList,
    FileText,
    MapPin,
    Package,
    Send,
} from 'lucide-react';


interface Department {
    id: number;
    name: string;
    code: string;
}

interface Asset {
    id: number;
    asset_code: string;
    name: string;
}

interface AuthUser {
    id: number;
    name: string;
    phone?: string;
    department_id?: number | null;
    department?: Department | null;
}

interface Props {
    user: AuthUser;
    assets: Asset[];
}


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
        title: 'New Request',
        href: '/operations/requests/create',
    },
];


export default function CreateRequest({
    user,
    assets,
}: Props) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        request_type: '',
        subject: '',
        description: '',
        priority: 'normal',
        location: '',
        asset_id: '',
        remarks: '',
    });


    function submit(
        event: React.FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        post('/operations/requests');
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="New Request" />

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


                    <div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            New Request
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Submit a request for your department.
                        </p>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* DEPARTMENT */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                            <ClipboardList className="h-5 w-5" />

                        </div>


                        <div>

                            <p className="text-xs font-medium text-blue-600">
                                Requesting Department
                            </p>

                            <p className="text-sm font-semibold text-slate-800">
                                {user.department?.name ?? 'No Department'}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                    {/* ================================================== */}
                    {/* REQUEST INFORMATION */}
                    {/* ================================================== */}

                    <div className="border-b border-slate-100 p-6">

                        <div className="mb-5">

                            <h2 className="text-sm font-bold text-slate-900">
                                Request Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Describe what your department needs.
                            </p>

                        </div>


                        <div className="grid gap-5 md:grid-cols-2">


                            {/* REQUEST TYPE */}

                            <div>

                                <label
                                    htmlFor="request_type"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Request Type
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="request_type"
                                    value={data.request_type}
                                    onChange={(event) =>
                                        setData(
                                            'request_type',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        Select request type
                                    </option>

                                    <option value="general">
                                        General Request
                                    </option>

                                    <option value="maintenance">
                                        Maintenance
                                    </option>

                                    <option value="document">
                                        Document
                                    </option>

                                    <option value="procurement">
                                        Procurement
                                    </option>

                                    <option value="administrative">
                                        Administrative
                                    </option>

                                    <option value="it">
                                        IT / Technical
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>


                                {errors.request_type && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.request_type}
                                    </p>

                                )}

                            </div>


                            {/* PRIORITY */}

                            <div>

                                <label
                                    htmlFor="priority"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Priority
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(event) =>
                                        setData(
                                            'priority',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="normal">
                                        Normal
                                    </option>

                                    <option value="high">
                                        High
                                    </option>

                                    <option value="critical">
                                        Critical
                                    </option>

                                </select>


                                {errors.priority && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.priority}
                                    </p>

                                )}

                            </div>


                            {/* SUBJECT */}

                            <div className="md:col-span-2">

                                <label
                                    htmlFor="subject"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Subject
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>


                                <input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(event) =>
                                        setData(
                                            'subject',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter a short description of your request"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />


                                {errors.subject && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.subject}
                                    </p>

                                )}

                            </div>


                            {/* DESCRIPTION */}

                            <div className="md:col-span-2">

                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Description
                                </label>


                                <textarea
                                    id="description"
                                    rows={5}
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Provide the details of your request..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />


                                {errors.description && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.description}
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* LOCATION / ASSET */}
                    {/* ================================================== */}

                    <div className="border-b border-slate-100 p-6">

                        <div className="mb-5">

                            <h2 className="text-sm font-bold text-slate-900">
                                Related Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Add location or asset information when applicable.
                            </p>

                        </div>


                        <div className="grid gap-5 md:grid-cols-2">


                            {/* LOCATION */}

                            <div>

                                <label
                                    htmlFor="location"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Location
                                </label>


                                <div className="relative">

                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                                    <input
                                        id="location"
                                        type="text"
                                        value={data.location}
                                        onChange={(event) =>
                                            setData(
                                                'location',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Where is this request related to?"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {errors.location && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.location}
                                    </p>

                                )}

                            </div>


                            {/* ASSET */}

                            <div>

                                <label
                                    htmlFor="asset_id"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Related Asset
                                </label>


                                <div className="relative">

                                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                                    <select
                                        id="asset_id"
                                        value={data.asset_id}
                                        onChange={(event) =>
                                            setData(
                                                'asset_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            No related asset
                                        </option>

                                        {assets.map(
                                            (asset) => (

                                                <option
                                                    key={asset.id}
                                                    value={asset.id}
                                                >
                                                    {asset.asset_code}
                                                    {' — '}
                                                    {asset.name}
                                                </option>

                                            ),
                                        )}

                                    </select>

                                </div>


                                {errors.asset_id && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.asset_id}
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* REMARKS */}
                    {/* ================================================== */}

                    <div className="p-6">

                        <div className="mb-5">

                            <h2 className="text-sm font-bold text-slate-900">
                                Additional Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Add any additional instructions or remarks.
                            </p>

                        </div>


                        <div>

                            <label
                                htmlFor="remarks"
                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                            >
                                Remarks
                            </label>


                            <textarea
                                id="remarks"
                                rows={4}
                                value={data.remarks}
                                onChange={(event) =>
                                    setData(
                                        'remarks',
                                        event.target.value,
                                    )
                                }
                                placeholder="Additional notes..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />


                            {errors.remarks && (

                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.remarks}
                                </p>

                            )}

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* FORM FOOTER */}
                    {/* ================================================== */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2 text-xs text-slate-400">

                            <FileText className="h-4 w-4" />

                            <span>
                                Your request will be submitted to your department.
                            </span>

                        </div>


                        <div className="flex items-center gap-3">

                            <Link
                                href="/operations/requests"
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <Send className="h-4 w-4" />

                                {processing
                                    ? 'Submitting...'
                                    : 'Submit Request'}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </AppLayout>
    );
}