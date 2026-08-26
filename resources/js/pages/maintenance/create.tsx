import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowLeft,
    Archive,
    Building2,
    CalendarDays,
    ClipboardList,
    DollarSign,
    FileText,
    Save,
    User,
    Wrench,
} from 'lucide-react';

import {
    FormEventHandler,
    useEffect,
} from 'react';


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

interface MaintenanceType {
    id: number;
    name: string;
    code: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface UserOption {
    id: number;
    name: string;
    department_id?: number | null;
}

interface CreateMaintenanceProps {
    assets: Asset[];
    types: MaintenanceType[];
    departments: Department[];
    users: UserOption[];
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
    {
        title: 'Create Maintenance',
        href: '#',
    },
];


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function CreateMaintenance({
    assets,
    types,
    departments,
    users,
}: CreateMaintenanceProps) {

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

        maintenance_code: '',

        asset_id: '',

        maintenance_type_id: '',

        department_id: '',

        requested_by: '',

        assigned_to: '',

        scheduled_date: '',

        started_at: '',

        completed_at: '',

        problem: '',

        description: '',

        work_performed: '',

        labor_cost: '',

        parts_cost: '',

        other_cost: '',

        total_cost: '0.00',

        status: 'pending',

        priority: 'normal',

        remarks: '',
    });


    /*
    |--------------------------------------------------------------------------
    | TOTAL COST
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const labor =
            Number(
                data.labor_cost || 0,
            );

        const parts =
            Number(
                data.parts_cost || 0,
            );

        const other =
            Number(
                data.other_cost || 0,
            );

        const total =
            labor +
            parts +
            other;

        setData(
            'total_cost',
            total.toFixed(2),
        );

    }, [
        data.labor_cost,
        data.parts_cost,
        data.other_cost,
    ]);


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler =
        (event) => {

            event.preventDefault();

            post(
                '/maintenance',
            );
        };


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Create Maintenance | CMMS" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/maintenance"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >

                            <ArrowLeft className="h-4 w-4" />

                        </Link>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">

                            <Wrench className="h-5 w-5" />

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                New Maintenance Record
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Record a maintenance activity for an LGU asset.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form
                    onSubmit={submit}
                    className="space-y-6"
                >


                    {/* ================================================== */}
                    {/* MAINTENANCE INFORMATION */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <ClipboardList className="h-5 w-5" />
                        }
                        title="Maintenance Information"
                        description="Identify the asset and type of maintenance activity."
                    >

                        <div className="grid gap-5 md:grid-cols-2">


                            {/* MAINTENANCE CODE */}

                            <Field
                                label="Maintenance Code"
                                required
                                error={
                                    errors.maintenance_code
                                }
                            >

                                <input
                                    type="text"
                                    value={
                                        data.maintenance_code
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'maintenance_code',
                                            event
                                                .target
                                                .value
                                                .toUpperCase(),
                                        )
                                    }
                                    placeholder="e.g. MR-2026-0001"
                                    className={inputClass(
                                        errors.maintenance_code,
                                    )}
                                />

                                <p className="mt-1.5 text-[10px] text-slate-400">
                                    Use a unique maintenance reference number.
                                </p>

                            </Field>


                            {/* ASSET */}

                            <Field
                                label="Asset"
                                required
                                error={
                                    errors.asset_id
                                }
                            >

                                <select
                                    value={
                                        data.asset_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'asset_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.asset_id,
                                    )}
                                >

                                    <option value="">
                                        Select asset
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
                                                {
                                                    asset.asset_code
                                                }{' '}
                                                —{' '}
                                                {
                                                    asset.name
                                                }
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>


                            {/* MAINTENANCE TYPE */}

                            <Field
                                label="Maintenance Type"
                                required
                                error={
                                    errors.maintenance_type_id
                                }
                            >

                                <select
                                    value={
                                        data.maintenance_type_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'maintenance_type_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.maintenance_type_id,
                                    )}
                                >

                                    <option value="">
                                        Select maintenance type
                                    </option>

                                    {types.map(
                                        (
                                            type,
                                        ) => (

                                            <option
                                                key={
                                                    type.id
                                                }
                                                value={
                                                    type.id
                                                }
                                            >
                                                {
                                                    type.name
                                                }{' '}
                                                (
                                                {
                                                    type.code
                                                }
                                                )
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>


                            {/* DEPARTMENT */}

                            <Field
                                label="Department"
                                error={
                                    errors.department_id
                                }
                            >

                                <select
                                    value={
                                        data.department_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'department_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.department_id,
                                    )}
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
                                                {
                                                    department.name
                                                }{' '}
                                                (
                                                {
                                                    department.code
                                                }
                                                )
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* REQUEST / ASSIGNMENT */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <User className="h-5 w-5" />
                        }
                        title="Request & Assignment"
                        description="Identify who requested and who is responsible for the maintenance."
                    >

                        <div className="grid gap-5 md:grid-cols-2">


                            {/* REQUESTED BY */}

                            <Field
                                label="Requested By"
                                error={
                                    errors.requested_by
                                }
                            >

                                <select
                                    value={
                                        data.requested_by
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'requested_by',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.requested_by,
                                    )}
                                >

                                    <option value="">
                                        Select requester
                                    </option>

                                    {users.map(
                                        (
                                            user,
                                        ) => (

                                            <option
                                                key={
                                                    user.id
                                                }
                                                value={
                                                    user.id
                                                }
                                            >
                                                {
                                                    user.name
                                                }
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>


                            {/* ASSIGNED TO */}

                            <Field
                                label="Assigned To"
                                error={
                                    errors.assigned_to
                                }
                            >

                                <select
                                    value={
                                        data.assigned_to
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'assigned_to',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.assigned_to,
                                    )}
                                >

                                    <option value="">
                                        Select technician / staff
                                    </option>

                                    {users.map(
                                        (
                                            user,
                                        ) => (

                                            <option
                                                key={
                                                    user.id
                                                }
                                                value={
                                                    user.id
                                                }
                                            >
                                                {
                                                    user.name
                                                }
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* SCHEDULE */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                        title="Schedule"
                        description="Set the maintenance schedule and actual service dates."
                    >

                        <div className="grid gap-5 md:grid-cols-3">


                            {/* SCHEDULED */}

                            <Field
                                label="Scheduled Date"
                                error={
                                    errors.scheduled_date
                                }
                            >

                                <input
                                    type="date"
                                    value={
                                        data.scheduled_date
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'scheduled_date',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.scheduled_date,
                                    )}
                                />

                            </Field>


                            {/* STARTED */}

                            <Field
                                label="Started At"
                                error={
                                    errors.started_at
                                }
                            >

                                <input
                                    type="datetime-local"
                                    value={
                                        data.started_at
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'started_at',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.started_at,
                                    )}
                                />

                            </Field>


                            {/* COMPLETED */}

                            <Field
                                label="Completed At"
                                error={
                                    errors.completed_at
                                }
                            >

                                <input
                                    type="datetime-local"
                                    value={
                                        data.completed_at
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'completed_at',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.completed_at,
                                    )}
                                />

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* MAINTENANCE DETAILS */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <FileText className="h-5 w-5" />
                        }
                        title="Maintenance Details"
                        description="Document the problem, diagnosis, and work performed."
                    >

                        <div className="space-y-5">


                            {/* PROBLEM */}

                            <Field
                                label="Problem / Complaint"
                                error={
                                    errors.problem
                                }
                            >

                                <input
                                    type="text"
                                    value={
                                        data.problem
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'problem',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Describe the reported problem or reason for maintenance..."
                                    className={inputClass(
                                        errors.problem,
                                    )}
                                />

                            </Field>


                            {/* DESCRIPTION */}

                            <Field
                                label="Description / Diagnosis"
                                error={
                                    errors.description
                                }
                            >

                                <textarea
                                    rows={
                                        4
                                    }
                                    value={
                                        data.description
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'description',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Describe the inspection findings, diagnosis, or maintenance requirements..."
                                    className={`${inputClass(
                                        errors.description,
                                    )} h-auto resize-none py-3`}
                                />

                            </Field>


                            {/* WORK */}

                            <Field
                                label="Work Performed"
                                error={
                                    errors.work_performed
                                }
                            >

                                <textarea
                                    rows={
                                        5
                                    }
                                    value={
                                        data.work_performed
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'work_performed',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Describe the repairs, replacement of parts, servicing, inspection, or other work performed..."
                                    className={`${inputClass(
                                        errors.work_performed,
                                    )} h-auto resize-none py-3`}
                                />

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* COST */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <DollarSign className="h-5 w-5" />
                        }
                        title="Maintenance Cost"
                        description="Record the financial cost associated with this maintenance activity."
                    >

                        <div className="grid gap-5 md:grid-cols-3">


                            {/* LABOR */}

                            <Field
                                label="Labor Cost"
                                error={
                                    errors.labor_cost
                                }
                            >

                                <MoneyInput
                                    value={
                                        data.labor_cost
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'labor_cost',
                                            value,
                                        )
                                    }
                                />

                            </Field>


                            {/* PARTS */}

                            <Field
                                label="Parts Cost"
                                error={
                                    errors.parts_cost
                                }
                            >

                                <MoneyInput
                                    value={
                                        data.parts_cost
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'parts_cost',
                                            value,
                                        )
                                    }
                                />

                            </Field>


                            {/* OTHER */}

                            <Field
                                label="Other Cost"
                                error={
                                    errors.other_cost
                                }
                            >

                                <MoneyInput
                                    value={
                                        data.other_cost
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setData(
                                            'other_cost',
                                            value,
                                        )
                                    }
                                />

                            </Field>

                        </div>


                        {/* TOTAL */}

                        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center">

                            <div>

                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                                    Total Maintenance Cost
                                </p>

                                <p className="mt-1 text-xs text-blue-700">
                                    Labor + Parts + Other
                                </p>

                            </div>


                            <p className="text-2xl font-bold text-blue-800">
                                ₱
                                {Number(
                                    data.total_cost ||
                                        0,
                                ).toLocaleString(
                                    'en-PH',
                                    {
                                        minimumFractionDigits: 2,
                                    },
                                )}
                            </p>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* STATUS / PRIORITY */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <AlertTriangle className="h-5 w-5" />
                        }
                        title="Status & Priority"
                        description="Set the current maintenance workflow state and urgency."
                    >

                        <div className="grid gap-5 md:grid-cols-2">


                            {/* STATUS */}

                            <Field
                                label="Status"
                                required
                                error={
                                    errors.status
                                }
                            >

                                <select
                                    value={
                                        data.status
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'status',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.status,
                                    )}
                                >

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="scheduled">
                                        Scheduled
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </Field>


                            {/* PRIORITY */}

                            <Field
                                label="Priority"
                                required
                                error={
                                    errors.priority
                                }
                            >

                                <select
                                    value={
                                        data.priority
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'priority',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.priority,
                                    )}
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

                            </Field>


                            {/* REMARKS */}

                            <div className="md:col-span-2">

                                <Field
                                    label="Remarks"
                                    error={
                                        errors.remarks
                                    }
                                >

                                    <textarea
                                        rows={
                                            4
                                        }
                                        value={
                                            data.remarks
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'remarks',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Additional remarks, recommendations, observations, or follow-up actions..."
                                        className={`${inputClass(
                                            errors.remarks,
                                        )} h-auto resize-none py-3`}
                                    />

                                </Field>

                            </div>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* ACTIONS */}
                    {/* ================================================== */}

                    <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">

                        <Link
                            href="/maintenance"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >

                            <ArrowLeft className="h-4 w-4" />

                            Cancel

                        </Link>


                        <button
                            type="submit"
                            disabled={
                                processing
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {processing ? (

                                <>
                                    <Wrench className="h-4 w-4 animate-pulse" />

                                    Saving...
                                </>

                            ) : (

                                <>
                                    <Save className="h-4 w-4" />

                                    Save Maintenance Record
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </AppLayout>
    );
}


/*
|--------------------------------------------------------------------------
| FORM SECTION
|--------------------------------------------------------------------------
*/

function FormSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                        {icon}

                    </div>

                    <div>

                        <h2 className="text-sm font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-500">
                            {description}
                        </p>

                    </div>

                </div>

            </div>


            <div className="p-5 sm:p-6">

                {children}

            </div>

        </section>
    );
}


/*
|--------------------------------------------------------------------------
| FIELD
|--------------------------------------------------------------------------
*/

function Field({
    label,
    required = false,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {

    return (
        <div>

            <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| INPUT CLASS
|--------------------------------------------------------------------------
*/

function inputClass(
    error?: string,
) {

    return `
        h-10
        w-full
        rounded-xl
        border
        ${
            error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-50'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
        }
        bg-slate-50
        px-3
        text-sm
        text-slate-800
        outline-none
        transition
        placeholder:text-slate-400
        focus:bg-white
        focus:ring-4
    `;
}


/*
|--------------------------------------------------------------------------
| MONEY INPUT
|--------------------------------------------------------------------------
*/

function MoneyInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (
        value: string,
    ) => void;
}) {

    return (
        <div className="relative">

            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₱
            </span>

            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                placeholder="0.00"
                className={`${inputClass()} pl-8`}
            />

        </div>
    );
}