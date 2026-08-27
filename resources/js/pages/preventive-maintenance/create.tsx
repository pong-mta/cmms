import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    Save,
    User,
    Wrench,
} from 'lucide-react';

import { FormEventHandler } from 'react';

interface Asset {
    id: number;
    asset_code: string;
    name: string;
    department_id?: number | null;
}

interface UserOption {
    id: number;
    name: string;
    department_id?: number | null;
}

interface CreatePreventiveMaintenanceProps {
    asset: Asset;
    users: UserOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assets',
        href: '/assets',
    },
    {
        title: 'Preventive Maintenance',
        href: '#',
    },
    {
        title: 'Create Schedule',
        href: '#',
    },
];

export default function CreatePreventiveMaintenance({
    asset,
    users,
}: CreatePreventiveMaintenanceProps) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        title: '',
        description: '',

        frequency_type: 'months',
        frequency_value: '3',

        start_date: '',
        next_due_date: '',

        assigned_to: '',

        notes: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(
            `/assets/${asset.id}/preventive-maintenance`,
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Create Preventive Maintenance | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <Link
                            href={`/assets/${asset.id}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <CalendarDays className="h-5 w-5" />
                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Create Preventive Maintenance
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Schedule recurring maintenance for this asset.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* ASSET */}
                {/* ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Wrench className="h-5 w-5" />
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-900">
                                    Asset
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Preventive maintenance will be attached to this asset.
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Asset
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {asset.name}
                            </p>

                        </div>

                        <div>

                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Asset Code
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {asset.asset_code}
                            </p>

                        </div>

                    </div>

                </section>


                <form
                    onSubmit={submit}
                    className="space-y-6"
                >

                    {/* ================================================== */}
                    {/* SCHEDULE */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                        title="Maintenance Schedule"
                        description="Define what maintenance should be performed and how often."
                    >

                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="Schedule Title"
                                required
                                error={errors.title}
                            >

                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(event) =>
                                        setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. Generator Preventive Maintenance"
                                    className={inputClass(
                                        errors.title,
                                    )}
                                />

                            </Field>


                            <Field
                                label="Frequency"
                                required
                                error={
                                    errors.frequency_value ||
                                    errors.frequency_type
                                }
                            >

                                <div className="grid grid-cols-2 gap-2">

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            data.frequency_value
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'frequency_value',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass(
                                            errors.frequency_value,
                                        )}
                                    />

                                    <select
                                        value={
                                            data.frequency_type
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'frequency_type',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass(
                                            errors.frequency_type,
                                        )}
                                    >

                                        <option value="days">
                                            Days
                                        </option>

                                        <option value="weeks">
                                            Weeks
                                        </option>

                                        <option value="months">
                                            Months
                                        </option>

                                        <option value="years">
                                            Years
                                        </option>

                                    </select>

                                </div>

                            </Field>


                            <div className="md:col-span-2">

                                <Field
                                    label="Description"
                                    error={
                                        errors.description
                                    }
                                >

                                    <textarea
                                        rows={4}
                                        value={
                                            data.description
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe the maintenance work that should be performed..."
                                        className={`${inputClass(
                                            errors.description,
                                        )} min-h-[100px] resize-none py-3`}
                                    />

                                </Field>

                            </div>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* DATES */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <CalendarDays className="h-5 w-5" />
                        }
                        title="Schedule Dates"
                        description="Set when the preventive maintenance cycle begins and when it is next due."
                    >

                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="Start Date"
                                required
                                error={
                                    errors.start_date
                                }
                            >

                                <input
                                    type="date"
                                    value={
                                        data.start_date
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'start_date',
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.start_date,
                                    )}
                                />

                            </Field>


                            <Field
                                label="Next Due Date"
                                required
                                error={
                                    errors.next_due_date
                                }
                            >

                                <input
                                    type="date"
                                    value={
                                        data.next_due_date
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'next_due_date',
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass(
                                        errors.next_due_date,
                                    )}
                                />

                            </Field>

                        </div>

                    </FormSection>


                    {/* ================================================== */}
                    {/* ASSIGNMENT */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <User className="h-5 w-5" />
                        }
                        title="Assignment"
                        description="Optionally assign responsibility for this preventive maintenance schedule."
                    >

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
                                onChange={(event) =>
                                    setData(
                                        'assigned_to',
                                        event.target.value,
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
                                    (user) => (
                                        <option
                                            key={
                                                user.id
                                            }
                                            value={
                                                user.id
                                            }
                                        >
                                            {user.name}
                                        </option>
                                    ),
                                )}

                            </select>

                        </Field>

                    </FormSection>


                    {/* ================================================== */}
                    {/* NOTES */}
                    {/* ================================================== */}

                    <FormSection
                        icon={
                            <Wrench className="h-5 w-5" />
                        }
                        title="Notes"
                        description="Add additional instructions or information for the maintenance team."
                    >

                        <Field
                            label="Notes"
                            error={errors.notes}
                        >

                            <textarea
                                rows={4}
                                value={data.notes}
                                onChange={(event) =>
                                    setData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                                placeholder="Additional instructions, specifications, or observations..."
                                className={`${inputClass(
                                    errors.notes,
                                )} min-h-[100px] resize-none py-3`}
                            />

                        </Field>

                    </FormSection>


                    {/* ================================================== */}
                    {/* ACTIONS */}
                    {/* ================================================== */}

                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

                        <Link
                            href={`/assets/${asset.id}`}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            disabled={processing}
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
                                    Create Schedule
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