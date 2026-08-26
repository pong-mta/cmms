import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    ClipboardList,
    FileText,
    Save,
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
    department_id?: number | null;
}


interface Department {
    id: number;
    name: string;
    code: string;
}


interface Props {
    assets: Asset[];
    departments: Department[];
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance Requests',
        href: '/maintenance-requests',
    },
    {
        title: 'New Request',
        href: '/maintenance-requests/create',
    },
];


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function CreateMaintenanceRequest({
    assets,
    departments,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        asset_id: '',
        department_id: '',
        title: '',
        description: '',
        priority: 'normal',
        remarks: '',
    });


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(
        event: React.FormEvent,
    ) {

        event.preventDefault();

        post(
            '/maintenance-requests',
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="New Maintenance Request" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

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

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            New Maintenance Request
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Report an asset problem or request maintenance service.
                        </p>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form
                    onSubmit={submit}
                    className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"
                >


                    {/* ================================================== */}
                    {/* LEFT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* REQUEST DETAILS */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                        <FileText className="h-5 w-5" />

                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Request Details
                                        </h2>

                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Describe the maintenance issue.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="space-y-5 p-5 sm:p-6">


                                {/* TITLE */}

                                <div>

                                    <label
                                        htmlFor="title"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Request Title
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(event) =>
                                            setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. Vehicle engine overheating"
                                        className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            errors.title
                                                ? 'border-red-300'
                                                : 'border-slate-200'
                                        }`}
                                    />


                                    {errors.title && (

                                        <p className="mt-1.5 text-[10px] font-medium text-red-600">
                                            {errors.title}
                                        </p>

                                    )}

                                </div>


                                {/* DESCRIPTION */}

                                <div>

                                    <label
                                        htmlFor="description"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Problem Description
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>


                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe the problem, symptoms, or service needed..."
                                        rows={6}
                                        className={`w-full resize-none rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            errors.description
                                                ? 'border-red-300'
                                                : 'border-slate-200'
                                        }`}
                                    />


                                    {errors.description && (

                                        <p className="mt-1.5 text-[10px] font-medium text-red-600">
                                            {errors.description}
                                        </p>

                                    )}

                                </div>


                                {/* REMARKS */}

                                <div>

                                    <label
                                        htmlFor="remarks"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Remarks
                                    </label>


                                    <textarea
                                        id="remarks"
                                        value={data.remarks}
                                        onChange={(event) =>
                                            setData(
                                                'remarks',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Additional information, recommendations, or notes..."
                                        rows={4}
                                        className={`w-full resize-none rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            errors.remarks
                                                ? 'border-red-300'
                                                : 'border-slate-200'
                                        }`}
                                    />


                                    {errors.remarks && (

                                        <p className="mt-1.5 text-[10px] font-medium text-red-600">
                                            {errors.remarks}
                                        </p>

                                    )}

                                </div>

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
                                            Select the asset requiring service.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-5 sm:p-6">

                                <label
                                    htmlFor="asset_id"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Asset
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="asset_id"
                                    value={data.asset_id}
                                    onChange={(event) =>
                                        setData(
                                            'asset_id',
                                            event.target.value,
                                        )
                                    }
                                    className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                        errors.asset_id
                                            ? 'border-red-300'
                                            : 'border-slate-200'
                                    }`}
                                >

                                    <option value="">
                                        Select an asset
                                    </option>


                                    {assets.map(
                                        (
                                            asset,
                                        ) => (

                                            <option
                                                key={
                                                    asset.id
                                                }
                                                value={
                                                    asset.id
                                                }
                                            >
                                                {asset.asset_code}
                                                {' — '}
                                                {asset.name}
                                            </option>

                                        ),
                                    )}

                                </select>


                                {errors.asset_id && (

                                    <p className="mt-1.5 text-[10px] font-medium text-red-600">
                                        {errors.asset_id}
                                    </p>

                                )}

                            </div>

                        </section>

                    </div>


                    {/* ================================================== */}
                    {/* RIGHT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* PRIORITY */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">

                                    <AlertTriangle className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Priority
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        How urgent is this request?
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5 grid grid-cols-2 gap-2">

                                {[
                                    {
                                        value: 'low',
                                        label: 'Low',
                                    },
                                    {
                                        value: 'normal',
                                        label: 'Normal',
                                    },
                                    {
                                        value: 'high',
                                        label: 'High',
                                    },
                                    {
                                        value: 'critical',
                                        label: 'Critical',
                                    },
                                ].map(
                                    (
                                        priority,
                                    ) => (

                                        <button
                                            key={
                                                priority.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'priority',
                                                    priority.value,
                                                )
                                            }
                                            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                                                data.priority ===
                                                priority.value
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {
                                                priority.label
                                            }
                                        </button>

                                    ),
                                )}

                            </div>


                            {errors.priority && (

                                <p className="mt-2 text-[10px] font-medium text-red-600">
                                    {errors.priority}
                                </p>

                            )}

                        </section>


                        {/* ================================================== */}
                        {/* DEPARTMENT */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <Building2 className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Department
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Department responsible for the request.
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5">

                                <label
                                    htmlFor="department_id"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Department
                                </label>


                                <select
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(event) =>
                                        setData(
                                            'department_id',
                                            event.target.value,
                                        )
                                    }
                                    className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                        errors.department_id
                                            ? 'border-red-300'
                                            : 'border-slate-200'
                                    }`}
                                >

                                    <option value="">
                                        Select department
                                    </option>


                                    {departments.map(
                                        (
                                            department,
                                        ) => (

                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >
                                                {department.name}
                                                {' ('}
                                                {
                                                    department.code
                                                }
                                                {')'}
                                            </option>

                                        ),
                                    )}

                                </select>


                                {errors.department_id && (

                                    <p className="mt-1.5 text-[10px] font-medium text-red-600">
                                        {
                                            errors.department_id
                                        }
                                    </p>

                                )}

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* SUBMISSION INFO */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

                            <div className="flex gap-3">

                                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                                <div>

                                    <p className="text-xs font-bold text-blue-900">
                                        What happens after submission?
                                    </p>


                                    <p className="mt-1 text-[10px] leading-5 text-blue-700">

                                        Your request will be submitted for
                                        review. A department head or authorized
                                        personnel can review and assign the
                                        maintenance work.

                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* ACTIONS */}
                        {/* ================================================== */}

                        <div className="flex flex-col gap-2 sm:flex-row">

                            <Link
                                href="/maintenance-requests"
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <Save className="h-4 w-4" />

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