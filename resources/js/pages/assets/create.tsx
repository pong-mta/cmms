import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    Archive,
    Building2,
    CalendarDays,
    CheckCircle2,
    FileText,
    MapPin,
    Package,
    Save,
    User,
    Wrench,
} from 'lucide-react';

import { FormEventHandler } from 'react';


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Category {
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

interface CreateAssetProps {
    categories: Category[];
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
        title: 'Assets',
        href: '/assets',
    },
    {
        title: 'Register Asset',
        href: '/assets/create',
    },
];


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function CreateAsset({
    categories,
    departments,
    users,
}: CreateAssetProps) {

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
        name: '',
        serial_number: '',
        description: '',

        asset_category_id: '',
        department_id: '',
        assigned_to: '',

        location: '',

        acquisition_date: '',
        acquisition_cost: '',
        supplier: '',

        warranty_start: '',
        warranty_end: '',

        status: 'active',
        condition: 'good',

        notes: '',
    });


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler =
        (event) => {

            event.preventDefault();

            post(
                '/assets',
            );
        };


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Register Asset | CMMS" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href="/assets"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >

                            <ArrowLeft className="h-4 w-4" />

                        </Link>


                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                            <Archive className="h-5 w-5" />

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Register Asset
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Add a municipal asset or equipment to CMMS.
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
                    {/* IDENTIFICATION */}
                    {/* ================================================== */}

                    <SimpleSection
                        title="Asset Information"
                        description="Basic information about the municipal asset."
                    >

                        <div className="grid gap-5 md:grid-cols-3">


                            {/* NAME */}

                            <Field
                                label="Asset Name"
                                required
                                error={
                                    errors.name
                                }
                            >

                                <input
                                    type="text"
                                    value={
                                        data.name
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'name',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="e.g. Municipal Ambulance"
                                    className={inputClass(
                                        errors.name,
                                    )}
                                />

                            </Field>


                            {/* SERIAL */}

                            <Field
                                label="Serial Number"
                                error={
                                    errors.serial_number
                                }
                            >

                                <input
                                    type="text"
                                    value={
                                        data.serial_number
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'serial_number',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Enter serial number"
                                    className={inputClass(
                                        errors.serial_number,
                                    )}
                                />

                            </Field>


                            {/* CATEGORY */}

                            <Field
                                label="Asset Category"
                                required
                                error={
                                    errors.asset_category_id
                                }
                            >

                                <select
                                    value={
                                        data.asset_category_id
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'asset_category_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.asset_category_id,
                                    )}
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (
                                            category,
                                        ) => (

                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }{' '}
                                                (
                                                {
                                                    category.code
                                                }
                                                )
                                            </option>

                                        ),
                                    )}

                                </select>

                            </Field>


                            {/* DESCRIPTION */}

                            <div className="md:col-span-3">

                                <Field
                                    label="Description"
                                    error={
                                        errors.description
                                    }
                                >

                                    <textarea
                                        rows={
                                            3
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
                                        placeholder="Describe the asset, model, specifications, or other identifying information..."
                                        className={`${inputClass(
                                            errors.description,
                                        )} min-h-[90px] resize-none py-3`}
                                    />

                                </Field>

                            </div>

                        </div>

                    </SimpleSection>


                    {/* ================================================== */}
                    {/* ASSIGNMENT */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <Building2 className="h-5 w-5" />
                        }
                        title="Department & Assignment"
                        description="Specify which department is responsible for this asset."
                    >

                        <div className="grid gap-5 md:grid-cols-3">


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


                            {/* ASSIGNED USER */}

                            <Field
                                label="Responsible Person"
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
                                        Not assigned
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


                            {/* LOCATION */}

                            <Field
                                label="Location"
                                error={
                                    errors.location
                                }
                            >

                                <div className="relative">

                                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={
                                            data.location
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'location',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="e.g. Municipal Garage"
                                        className={`${inputClass(
                                            errors.location,
                                        )} pl-9`}
                                    />

                                </div>

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* ACQUISITION */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <Package className="h-5 w-5" />
                        }
                        title="Acquisition Information"
                        description="Record how and when the municipality acquired the asset."
                    >

                        <div className="grid gap-5 md:grid-cols-3">


                            {/* DATE */}

                            <Field
                                label="Acquisition Date"
                                error={
                                    errors.acquisition_date
                                }
                            >

                                <div className="relative">

                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="date"
                                        value={
                                            data.acquisition_date
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'acquisition_date',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className={`${inputClass(
                                            errors.acquisition_date,
                                        )} pl-9`}
                                    />

                                </div>

                            </Field>


                            {/* COST */}

                            <Field
                                label="Acquisition Cost"
                                error={
                                    errors.acquisition_cost
                                }
                            >

                                <div className="relative">

                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                        ₱
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            data.acquisition_cost
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'acquisition_cost',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="0.00"
                                        className={`${inputClass(
                                            errors.acquisition_cost,
                                        )} pl-8`}
                                    />

                                </div>

                            </Field>


                            {/* SUPPLIER */}

                            <Field
                                label="Supplier"
                                error={
                                    errors.supplier
                                }
                            >

                                <input
                                    type="text"
                                    value={
                                        data.supplier
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'supplier',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Supplier / vendor"
                                    className={inputClass(
                                        errors.supplier,
                                    )}
                                />

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* WARRANTY */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                        title="Warranty"
                        description="Record the warranty coverage period for this asset."
                    >

                        <div className="grid gap-5 md:grid-cols-2">


                            {/* START */}

                            <Field
                                label="Warranty Start"
                                error={
                                    errors.warranty_start
                                }
                            >

                                <input
                                    type="date"
                                    value={
                                        data.warranty_start
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'warranty_start',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.warranty_start,
                                    )}
                                />

                            </Field>


                            {/* END */}

                            <Field
                                label="Warranty End"
                                error={
                                    errors.warranty_end
                                }
                            >

                                <input
                                    type="date"
                                    value={
                                        data.warranty_end
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'warranty_end',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.warranty_end,
                                    )}
                                />

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* STATUS */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <Wrench className="h-5 w-5" />
                        }
                        title="Asset Status"
                        description="Set the current operational status and physical condition."
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
                                                .value as any,
                                        )
                                    }
                                    className={inputClass(
                                        errors.status,
                                    )}
                                >

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="under_maintenance">
                                        Under Maintenance
                                    </option>

                                    <option value="out_of_service">
                                        Out of Service
                                    </option>

                                    <option value="disposed">
                                        Disposed
                                    </option>

                                    <option value="lost">
                                        Lost
                                    </option>

                                </select>

                            </Field>


                            {/* CONDITION */}

                            <Field
                                label="Condition"
                                required
                                error={
                                    errors.condition
                                }
                            >

                                <select
                                    value={
                                        data.condition
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'condition',
                                            event
                                                .target
                                                .value as any,
                                        )
                                    }
                                    className={inputClass(
                                        errors.condition,
                                    )}
                                >

                                    <option value="excellent">
                                        Excellent
                                    </option>

                                    <option value="good">
                                        Good
                                    </option>

                                    <option value="fair">
                                        Fair
                                    </option>

                                    <option value="poor">
                                        Poor
                                    </option>

                                    <option value="critical">
                                        Critical
                                    </option>

                                </select>

                            </Field>


                            {/* NOTES */}

                            <div className="md:col-span-2">

                                <Field
                                    label="Notes"
                                    error={
                                        errors.notes
                                    }
                                >

                                    <textarea
                                        rows={
                                            4
                                        }
                                        value={
                                            data.notes
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'notes',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Additional notes, remarks, specifications, or observations..."
                                        className={`${inputClass(
                                            errors.notes,
                                        )} min-h-[100px] resize-none py-3`}
                                    />

                                </Field>

                            </div>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* ACTIONS */}
                    {/* ================================================== */}

                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

                        <Link
                            href="/assets"
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
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

                                    Registering...
                                </>

                            ) : (

                                <>
                                    <Save className="h-4 w-4" />

                                    Register Asset
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
| SIMPLE SECTION
|--------------------------------------------------------------------------
*/

function SimpleSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 sm:px-6">
                <h2 className="text-sm font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                    {description}
                </p>
            </div>

            <div className="border-t border-slate-100 p-5 sm:p-6">
                {children}
            </div>
        </section>
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
| FIELD HINT
|--------------------------------------------------------------------------
*/

function FieldHint({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <p className="mt-1.5 text-[10px] text-slate-400">
            {children}
        </p>
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