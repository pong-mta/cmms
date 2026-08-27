import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    Archive,
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit,
    FileText,
    History,
    Package,
    User,
    Wrench,
} from 'lucide-react';


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


interface AssignedUser {
    id: number;
    name: string;
    phone?: string;
}


/*
|--------------------------------------------------------------------------
| MAINTENANCE TYPES
|--------------------------------------------------------------------------
*/

interface MaintenanceType {
    id: number;
    name: string;
    code: string;
}


interface MaintenanceRecord {
    id: number;

    maintenance_code: string;

    maintenance_type?: MaintenanceType | null;

    scheduled_date?: string | null;

    completed_at?: string | null;

    total_cost?: string | number | null;

    status:
        | 'pending'
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'cancelled';
}

interface MaintenanceRequest {
    id: number;

    request_code: string;

    title: string;

    description?: string | null;

    priority: string;

    status: string;

    requested_at?: string | null;

    completed_at?: string | null;

    requested_by?: {
        id: number;
        name: string;
    } | null;

    completed_by?: {
        id: number;
        name: string;
    } | null;
}


/*
|--------------------------------------------------------------------------
| ASSET
|--------------------------------------------------------------------------
*/

interface Asset {
    id: number;

    asset_code: string;

    name: string;

    serial_number?: string | null;

    description?: string | null;

    location?: string | null;

    acquisition_date?: string | null;

    acquisition_cost?: string | number | null;

    supplier?: string | null;

    warranty_start?: string | null;

    warranty_end?: string | null;

    status:
        | 'active'
        | 'under_maintenance'
        | 'out_of_service'
        | 'disposed'
        | 'lost';

    condition:
        | 'excellent'
        | 'good'
        | 'fair'
        | 'poor'
        | 'critical';

    notes?: string | null;

    category?: Category | null;

    department?: Department | null;

    assigned_user?: AssignedUser | null;

    maintenance_records?: MaintenanceRecord[];

    maintenance_requests?: MaintenanceRequest[];

    created_at: string;

    updated_at: string;
}


interface ShowAssetProps {
    asset: Asset;
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
        title: 'Asset Details',
        href: '#',
    },
];


/*
|--------------------------------------------------------------------------
| STATUS LABEL
|--------------------------------------------------------------------------
*/

function statusLabel(
    status: Asset['status'],
) {
    return status
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}


/*
|--------------------------------------------------------------------------
| CONDITION LABEL
|--------------------------------------------------------------------------
*/

function conditionLabel(
    condition: Asset['condition'],
) {
    return (
        condition.charAt(0).toUpperCase() +
        condition.slice(1)
    );
}


/*
|--------------------------------------------------------------------------
| STATUS CLASS
|--------------------------------------------------------------------------
*/

function statusClass(
    status: Asset['status'],
) {
    switch (status) {

        case 'active':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'under_maintenance':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'out_of_service':
            return 'bg-red-50 text-red-700 ring-red-200';

        case 'disposed':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        case 'lost':
            return 'bg-purple-50 text-purple-700 ring-purple-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


/*
|--------------------------------------------------------------------------
| CONDITION CLASS
|--------------------------------------------------------------------------
*/

function conditionClass(
    condition: Asset['condition'],
) {
    switch (condition) {

        case 'excellent':
            return 'text-emerald-700';

        case 'good':
            return 'text-green-700';

        case 'fair':
            return 'text-amber-700';

        case 'poor':
            return 'text-orange-700';

        case 'critical':
            return 'text-red-700';

        default:
            return 'text-slate-600';
    }
}


/*
|--------------------------------------------------------------------------
| MAINTENANCE STATUS CLASS
|--------------------------------------------------------------------------
*/

function maintenanceStatusClass(
    status: MaintenanceRecord['status'],
) {
    switch (status) {

        case 'completed':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';

        case 'in_progress':
            return 'bg-amber-50 text-amber-700 ring-amber-200';

        case 'scheduled':
            return 'bg-blue-50 text-blue-700 ring-blue-200';

        case 'cancelled':
            return 'bg-red-50 text-red-700 ring-red-200';

        case 'pending':
            return 'bg-slate-100 text-slate-600 ring-slate-200';

        default:
            return 'bg-slate-100 text-slate-600 ring-slate-200';
    }
}


/*
|--------------------------------------------------------------------------
| MAINTENANCE STATUS LABEL
|--------------------------------------------------------------------------
*/

function maintenanceStatusLabel(
    status: MaintenanceRecord['status'],
) {
    return status
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(
    value?: string | null,
) {

    if (!value) {
        return '—';
    }

    return new Date(
        value,
    ).toLocaleDateString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}


/*
|--------------------------------------------------------------------------
| DATE + TIME
|--------------------------------------------------------------------------
*/

function formatDateTime(
    value?: string | null,
) {

    if (!value) {
        return '—';
    }

    return new Date(
        value,
    ).toLocaleString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}


/*
|--------------------------------------------------------------------------
| CURRENCY
|--------------------------------------------------------------------------
*/

function formatCurrency(
    value?: string | number | null,
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
        },
    ).format(
        Number(value),
    );
}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function ShowAsset({
    asset,
}: ShowAssetProps) {

    /*
    |--------------------------------------------------------------------------
    | BREADCRUMBS
    |--------------------------------------------------------------------------
    */

    const breadcrumbsWithAsset: BreadcrumbItem[] = [
        {
            title: 'Assets',
            href: '/assets',
        },
        {
            title: asset.name,
            href: `/assets/${asset.id}`,
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | WARRANTY
    |--------------------------------------------------------------------------
    */

    const warrantyActive =
        asset.warranty_end &&
        new Date(
            asset.warranty_end,
        ) >= new Date();


    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE RECORDS
    |--------------------------------------------------------------------------
    */

    const maintenanceRecords =
    asset.maintenance_records ?? [];

    const maintenanceRequests =
    asset.maintenance_requests ?? [];


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbsWithAsset
            }
        >

            <Head
                title={`${asset.name} | CMMS`}
            />


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

                            <div className="flex items-center gap-2">

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {asset.name}
                                </h1>


                                <span
                                    className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset sm:inline-flex ${statusClass(
                                        asset.status,
                                    )}`}
                                >

                                    {statusLabel(
                                        asset.status,
                                    )}

                                </span>

                            </div>


                            <p className="mt-0.5 text-xs font-semibold text-blue-700">
                                {asset.asset_code}
                            </p>

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                        <Link
                            href="/assets"
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                        >

                            <ArrowLeft className="h-4 w-4" />

                            Back

                        </Link>


                        <Link
                            href={`/assets/${asset.id}/edit`}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
                        >

                            <Edit className="h-4 w-4" />

                            Edit Asset

                        </Link>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* MOBILE STATUS */}
                {/* ====================================================== */}

                <div className="sm:hidden">

                    <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClass(
                            asset.status,
                        )}`}
                    >

                        {statusLabel(
                            asset.status,
                        )}

                    </span>

                </div>


                {/* ====================================================== */}
                {/* OVERVIEW */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <OverviewCard
                        label="Category"
                        value={
                            asset.category
                                ?.name ??
                            '—'
                        }
                        icon={
                            <Archive className="h-4 w-4" />
                        }
                    />


                    <OverviewCard
                        label="Department"
                        value={
                            asset.department
                                ?.name ??
                            'Unassigned'
                        }
                        icon={
                            <Building2 className="h-4 w-4" />
                        }
                    />


                    <OverviewCard
                        label="Condition"
                        value={conditionLabel(
                            asset.condition,
                        )}
                        valueClass={
                            conditionClass(
                                asset.condition,
                            )
                        }
                        icon={
                            <CheckCircle2 className="h-4 w-4" />
                        }
                    />


                    <OverviewCard
                        label="Responsible Person"
                        value={
                            asset
                                .assigned_user
                                ?.name ??
                            'Unassigned'
                        }
                        icon={
                            <User className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* MAIN GRID */}
                {/* ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                    {/* ================================================== */}
                    {/* LEFT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* ASSET INFORMATION */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <Archive className="h-5 w-5" />
                            }
                            title="Asset Information"
                            description="Identification and classification details."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

                                <DetailItem
                                    label="Asset Code"
                                    value={
                                        asset.asset_code
                                    }
                                />


                                <DetailItem
                                    label="Serial Number"
                                    value={
                                        asset.serial_number
                                    }
                                />


                                <DetailItem
                                    label="Category"
                                    value={
                                        asset.category
                                            ? `${asset.category.name} (${asset.category.code})`
                                            : null
                                    }
                                />


                                <DetailItem
                                    label="Location"
                                    value={
                                        asset.location
                                    }
                                />


                                <DetailItem
                                    label="Department"
                                    value={
                                        asset.department
                                            ? `${asset.department.name} (${asset.department.code})`
                                            : null
                                    }
                                />


                                <DetailItem
                                    label="Responsible Person"
                                    value={
                                        asset
                                            .assigned_user
                                            ?.name
                                    }
                                />

                            </div>


                            {asset.description && (

                                <div className="mt-6 border-t border-slate-100 pt-5">

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Description
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {
                                            asset.description
                                        }
                                    </p>

                                </div>

                            )}

                        </DetailSection>


                        {/* ================================================== */}
                        {/* ACQUISITION */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <Package className="h-5 w-5" />
                            }
                            title="Acquisition Information"
                            description="Procurement and acquisition details."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

                                <DetailItem
                                    label="Acquisition Date"
                                    value={formatDate(
                                        asset.acquisition_date,
                                    )}
                                />


                                <DetailItem
                                    label="Acquisition Cost"
                                    value={formatCurrency(
                                        asset.acquisition_cost,
                                    )}
                                />


                                <DetailItem
                                    label="Supplier"
                                    value={
                                        asset.supplier
                                    }
                                />

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* WARRANTY */}
                        {/* ================================================== */}

                        <DetailSection
                            icon={
                                <CheckCircle2 className="h-5 w-5" />
                            }
                            title="Warranty"
                            description="Warranty coverage information."
                        >

                            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

                                <DetailItem
                                    label="Warranty Start"
                                    value={formatDate(
                                        asset.warranty_start,
                                    )}
                                />


                                <DetailItem
                                    label="Warranty End"
                                    value={formatDate(
                                        asset.warranty_end,
                                    )}
                                />

                            </div>


                            <div className="mt-5">

                                {warrantyActive ? (

                                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                                        <div>

                                            <p className="text-xs font-semibold text-emerald-800">
                                                Warranty Active
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-emerald-600">
                                                This asset is currently
                                                covered by warranty.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                                        <Clock3 className="h-5 w-5 text-slate-400" />

                                        <div>

                                            <p className="text-xs font-semibold text-slate-700">
                                                No Active Warranty
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                This asset currently has
                                                no active warranty coverage.
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </DetailSection>


                        {/* ================================================== */}
                        {/* NOTES */}
                        {/* ================================================== */}

                        {asset.notes && (

                            <DetailSection
                                icon={
                                    <FileText className="h-5 w-5" />
                                }
                                title="Notes"
                                description="Additional asset remarks."
                            >

                                <p className="text-sm leading-6 text-slate-600">
                                    {asset.notes}
                                </p>

                            </DetailSection>

                        )}

                    </div>


                    {/* ================================================== */}
                    {/* RIGHT */}
                    {/* ================================================== */}

                    <div className="space-y-6">


                        {/* ================================================== */}
                        {/* STATUS */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <Wrench className="h-5 w-5" />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Asset Status
                                    </h2>

                                    <p className="text-[10px] text-slate-500">
                                        Current operational state
                                    </p>

                                </div>

                            </div>


                            <div className="mt-5">

                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                                    <span className="text-xs font-medium text-slate-500">
                                        Status
                                    </span>


                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                            asset.status,
                                        )}`}
                                    >

                                        {statusLabel(
                                            asset.status,
                                        )}

                                    </span>

                                </div>


                                <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                                    <span className="text-xs font-medium text-slate-500">
                                        Condition
                                    </span>


                                    <span
                                        className={`text-xs font-bold ${conditionClass(
                                            asset.condition,
                                        )}`}
                                    >

                                        {conditionLabel(
                                            asset.condition,
                                        )}

                                    </span>

                                </div>

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* MAINTENANCE HISTORY */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                        <History className="h-5 w-5" />

                                    </div>


                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Maintenance History
                                        </h2>

                                        <p className="text-[10px] text-slate-500">
                                            Service records for this asset
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {maintenanceRecords.length > 0 ? (

                                <div className="divide-y divide-slate-100">

                                    {maintenanceRecords.map(
                                        (
                                            maintenance,
                                        ) => (

                                            <div
                                                key={
                                                    maintenance.id
                                                }
                                                className="p-5 transition hover:bg-slate-50"
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="flex min-w-0 items-start gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">

                                                            <Wrench className="h-4 w-4" />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="truncate text-xs font-bold text-slate-800">
                                                                {
                                                                    maintenance.maintenance_code
                                                                }
                                                            </p>


                                                            <p className="mt-1 text-[10px] text-slate-500">

                                                                {maintenance
                                                                    .maintenance_type
                                                                    ?.name ??
                                                                    'Maintenance'}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ring-1 ring-inset ${maintenanceStatusClass(
                                                            maintenance.status,
                                                        )}`}
                                                    >

                                                        {maintenanceStatusLabel(
                                                            maintenance.status,
                                                        )}

                                                    </span>

                                                </div>


                                                <div className="mt-3 flex items-center justify-between gap-3">

                                                    <div className="flex items-center gap-4">

                                                        <div>

                                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                                Date
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] font-medium text-slate-600">

                                                                {formatDate(
                                                                    maintenance.completed_at ??
                                                                        maintenance.scheduled_date,
                                                                )}

                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                                Cost
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] font-semibold text-slate-700">

                                                                {formatCurrency(
                                                                    maintenance.total_cost,
                                                                )}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <Link
                                                        href={`/maintenance/${maintenance.id}`}
                                                        className="text-[10px] font-semibold text-blue-700 hover:text-blue-800"
                                                    >
                                                        View
                                                    </Link>

                                                </div>

                                            </div>

                                        ),
                                    )}

                                </div>

                            ) : (

                                <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">

                                        <Wrench className="h-6 w-6" />

                                    </div>


                                    <p className="mt-3 text-xs font-semibold text-slate-700">
                                        No maintenance records
                                    </p>


                                    <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
                                        Maintenance history will appear
                                        here once service activities
                                        are recorded.
                                    </p>

                                </div>

                            )}

                        </section>

                        {/* ================================================== */}
                        {/* MAINTENANCE REQUEST HISTORY */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                        <Wrench className="h-5 w-5" />
                                    </div>

                                    <div>

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Maintenance Requests
                                        </h2>

                                        <p className="text-[10px] text-slate-500">
                                            Maintenance requests associated with this asset
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {maintenanceRequests.length > 0 ? (

                                <div className="divide-y divide-slate-100">

                                    {maintenanceRequests.map(
                                        (maintenanceRequest) => (

                                            <div
                                                key={
                                                    maintenanceRequest.id
                                                }
                                                className="p-5 transition hover:bg-slate-50"
                                            >

                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <p className="text-xs font-bold text-slate-800">
                                                            {
                                                                maintenanceRequest.request_code
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                                            {
                                                                maintenanceRequest.title
                                                            }
                                                        </p>

                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold capitalize text-slate-600">
                                                        {
                                                            maintenanceRequest.status
                                                                .replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )
                                                        }
                                                    </span>

                                                </div>


                                                <div className="mt-4 grid gap-4 sm:grid-cols-3">

                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Priority
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold capitalize text-slate-700">
                                                            {
                                                                maintenanceRequest.priority
                                                            }
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Requested
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-slate-600">
                                                            {formatDate(
                                                                maintenanceRequest.requested_at,
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Completed
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-slate-600">
                                                            {formatDate(
                                                                maintenanceRequest.completed_at,
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="mt-4 flex items-center justify-between gap-3">

                                                    <div className="text-[10px] text-slate-500">

                                                        Requested by:{' '}

                                                        <span className="font-semibold text-slate-700">
                                                            {
                                                                maintenanceRequest
                                                                    .requested_by
                                                                    ?.name ??
                                                                '—'
                                                            }
                                                        </span>

                                                    </div>
                                                    <div className="mt-1 text-[10px] text-slate-500">

                                                        Completed by:{' '}

                                                        <span className="font-semibold text-slate-700">
                                                            {
                                                                maintenanceRequest
                                                                    .completed_by
                                                                    ?.name ??
                                                                '—'
                                                            }
                                                        </span>

                                                    </div>


                                                    <Link
                                                        href={`/maintenance-requests/${maintenanceRequest.id}`}
                                                        className="text-[10px] font-semibold text-blue-700 hover:text-blue-800"
                                                    >
                                                        View Request
                                                    </Link>

                                                    

                                                </div>

                                            </div>

                                        ),
                                    )}

                                </div>

                            ) : (

                                <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                        <Wrench className="h-6 w-6" />
                                    </div>

                                    <p className="mt-3 text-xs font-semibold text-slate-700">
                                        No maintenance requests
                                    </p>

                                    <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
                                        Maintenance requests for this asset will appear here.
                                    </p>

                                </div>

                            )}

                        </section>


                        {/* ================================================== */}
                        {/* SYSTEM INFO */}
                        {/* ================================================== */}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <h2 className="text-sm font-bold text-slate-900">
                                Record Information
                            </h2>


                            <div className="mt-4 space-y-3">

                                <RecordItem
                                    label="Asset ID"
                                    value={`#${asset.id}`}
                                />


                                <RecordItem
                                    label="Created"
                                    value={formatDateTime(
                                        asset.created_at,
                                    )}
                                />


                                <RecordItem
                                    label="Last Updated"
                                    value={formatDateTime(
                                        asset.updated_at,
                                    )}
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
| OVERVIEW CARD
|--------------------------------------------------------------------------
*/

function OverviewCard({
    label,
    value,
    icon,
    valueClass = 'text-slate-800',
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    valueClass?: string;
}) {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                </div>


                <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                    </p>


                    <p
                        className={`mt-1 truncate text-xs font-bold ${valueClass}`}
                    >
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DETAIL SECTION
|--------------------------------------------------------------------------
*/

function DetailSection({
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

            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        {icon}
                    </div>


                    <div>

                        <h2 className="text-sm font-bold text-slate-900">
                            {title}
                        </h2>


                        <p className="mt-0.5 text-[10px] text-slate-500">
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
| DETAIL ITEM
|--------------------------------------------------------------------------
*/

function DetailItem({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {

    return (
        <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>


            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {value || '—'}
            </p>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| RECORD ITEM
|--------------------------------------------------------------------------
*/

function RecordItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {

    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-[10px] font-medium text-slate-400">
                {label}
            </span>


            <span className="text-right text-[10px] font-semibold text-slate-600">
                {value}
            </span>

        </div>
    );
}