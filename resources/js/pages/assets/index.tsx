import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

import {
    Archive,
    Building2,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Filter,
    Plus,
    Search,
    User,
    Wrench,
    X,
} from 'lucide-react';

import {
    useMemo,
    useState,
} from 'react';


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
}

interface Asset {
    id: number;
    asset_code: string;
    name: string;
    serial_number?: string | null;
    location?: string | null;

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

    category?: Category | null;

    department?: Department | null;

    assigned_user?: AssignedUser | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAssets {
    data: Asset[];

    current_page: number;
    last_page: number;
    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    links: PaginationLink[];
}

interface AssetsProps {
    assets: PaginatedAssets;

    categories: Category[];

    departments: Department[];
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
        condition
            .charAt(0)
            .toUpperCase() +
        condition.slice(1)
    );
}


/*
|--------------------------------------------------------------------------
| STATUS STYLE
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
| CONDITION STYLE
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
| PAGE
|--------------------------------------------------------------------------
*/

export default function AssetsIndex({
    assets,
    categories,
    departments,
}: AssetsProps) {

    /*
    |--------------------------------------------------------------------------
    | FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState('');

    const [categoryId, setCategoryId] =
        useState('');

    const [departmentId, setDepartmentId] =
        useState('');

    const [status, setStatus] =
        useState('');

    const [showFilters, setShowFilters] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | FILTERED DATA
    |--------------------------------------------------------------------------
    |
    | The backend pagination is already active.
    | These filters currently work against
    | the loaded page.
    |
    | We'll move filtering into Laravel
    | once the basic UI is confirmed.
    |
    */

    const filteredAssets =
        useMemo(() => {

            return assets.data.filter(
                (asset) => {

                    const searchValue =
                        search
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !searchValue ||
                        asset.asset_code
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        asset.name
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        asset.serial_number
                            ?.toLowerCase()
                            .includes(
                                searchValue,
                            );

                    const matchesCategory =
                        !categoryId ||
                        String(
                            asset.category
                                ?.id,
                        ) ===
                            categoryId;

                    const matchesDepartment =
                        !departmentId ||
                        String(
                            asset.department
                                ?.id,
                        ) ===
                            departmentId;

                    const matchesStatus =
                        !status ||
                        asset.status ===
                            status;

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesDepartment &&
                        matchesStatus
                    );
                },
            );

        }, [
            assets.data,
            search,
            categoryId,
            departmentId,
            status,
        ]);


    /*
    |--------------------------------------------------------------------------
    | RESET FILTERS
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setDepartmentId('');
        setStatus('');
    };


    /*
    |--------------------------------------------------------------------------
    | HAS FILTER
    |--------------------------------------------------------------------------
    */

    const hasFilters =
        Boolean(
            search ||
            categoryId ||
            departmentId ||
            status,
        );


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (
        url: string | null,
    ) => {

        if (!url) {
            return;
        }

        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
        });
    };


    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Assets | CMMS" />


            <div className="flex flex-1 flex-col gap-6 p-6">


                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                <Archive className="h-5 w-5" />

                            </div>

                            <div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Assets
                                </h1>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Manage municipal assets and equipment.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ADD ASSET */}

                    <Link
                        href="/assets/create"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                    >

                        <Plus className="h-4 w-4" />

                        Register Asset

                    </Link>

                </div>


                {/* ====================================================== */}
                {/* SUMMARY */}
                {/* ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Total Assets"
                        value={assets.total}
                        icon={
                            <Archive className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Showing"
                        value={
                            filteredAssets.length
                        }
                        icon={
                            <Wrench className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="Current Page"
                        value={`${assets.current_page} / ${assets.last_page}`}
                        icon={
                            <Building2 className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ====================================================== */}
                {/* SEARCH / FILTER */}
                {/* ====================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search asset code, name, or serial number..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />

                        </div>


                        {/* FILTER BUTTON */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters,
                                )
                            }
                            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                                showFilters ||
                                hasFilters
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >

                            <Filter className="h-4 w-4" />

                            Filters

                            {hasFilters && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-bold text-white">
                                    {
                                        [
                                            categoryId,
                                            departmentId,
                                            status,
                                        ].filter(
                                            Boolean,
                                        ).length
                                    }
                                </span>
                            )}

                        </button>


                        {/* RESET */}

                        {hasFilters && (

                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            >

                                <X className="h-3.5 w-3.5" />

                                Clear

                            </button>

                        )}

                    </div>


                    {/* FILTER PANEL */}

                    {showFilters && (

                        <div className="border-t border-slate-100 bg-slate-50/70 p-4">

                            <div className="grid gap-4 md:grid-cols-3">

                                {/* CATEGORY */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Category
                                    </label>

                                    <select
                                        value={
                                            categoryId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setCategoryId(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    >

                                        <option value="">
                                            All Categories
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
                                                    }
                                                </option>
                                            ),
                                        )}

                                    </select>

                                </div>


                                {/* DEPARTMENT */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        value={
                                            departmentId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setDepartmentId(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    >

                                        <option value="">
                                            All Departments
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
                                                    }
                                                </option>
                                            ),
                                        )}

                                    </select>

                                </div>


                                {/* STATUS */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setStatus(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    >

                                        <option value="">
                                            All Statuses
                                        </option>

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

                                </div>

                            </div>

                        </div>

                    )}

                </div>


                {/* ====================================================== */}
                {/* TABLE */}
                {/* ====================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead>

                                <tr className="border-b border-slate-100 bg-slate-50/80">

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Asset
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Category
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Department
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Assigned To
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Condition
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {filteredAssets.length ===
                                0 ? (

                                    <tr>

                                        <td
                                            colSpan={
                                                7
                                            }
                                            className="px-6 py-16 text-center"
                                        >

                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                                <Archive className="h-7 w-7" />

                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                                No assets found
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                                {hasFilters
                                                    ? 'Try changing your search or filters.'
                                                    : 'There are no assets registered in the CMMS yet.'}
                                            </p>

                                            {!hasFilters && (

                                                <Link
                                                    href="/assets/create"
                                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                                                >

                                                    <Plus className="h-4 w-4" />

                                                    Register First Asset

                                                </Link>

                                            )}

                                        </td>

                                    </tr>

                                ) : (

                                    filteredAssets.map(
                                        (
                                            asset,
                                        ) => (

                                            <tr
                                                key={
                                                    asset.id
                                                }
                                                className="group transition hover:bg-slate-50/70"
                                            >

                                                {/* ASSET */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                                            <Archive className="h-4 w-4" />

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                                {
                                                                    asset.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] font-medium text-blue-700">
                                                                {
                                                                    asset.asset_code
                                                                }
                                                            </p>

                                                            {asset.serial_number && (

                                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                                    SN:{' '}
                                                                    {
                                                                        asset.serial_number
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CATEGORY */}

                                                <td className="px-5 py-4">

                                                    {asset.category ? (

                                                        <div>

                                                            <p className="text-xs font-medium text-slate-700">
                                                                {
                                                                    asset
                                                                        .category
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                                                {
                                                                    asset
                                                                        .category
                                                                        .code
                                                                }
                                                            </p>

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-slate-400">
                                                            —
                                                        </span>

                                                    )}

                                                </td>


                                                {/* DEPARTMENT */}

                                                <td className="px-5 py-4">

                                                    {asset.department ? (

                                                        <div className="flex items-center gap-2">

                                                            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                            <div>

                                                                <p className="text-xs font-medium text-slate-700">
                                                                    {
                                                                        asset
                                                                            .department
                                                                            .name
                                                                    }
                                                                </p>

                                                                <p className="text-[10px] text-slate-400">
                                                                    {
                                                                        asset
                                                                            .department
                                                                            .code
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-slate-400">
                                                            Unassigned
                                                        </span>

                                                    )}

                                                </td>


                                                {/* ASSIGNED USER */}

                                                <td className="px-5 py-4">

                                                    {asset.assigned_user ? (

                                                        <div className="flex items-center gap-2">

                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">

                                                                <User className="h-3.5 w-3.5" />

                                                            </div>

                                                            <span className="text-xs font-medium text-slate-700">
                                                                {
                                                                    asset
                                                                        .assigned_user
                                                                        .name
                                                                }
                                                            </span>

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-slate-400">
                                                            Unassigned
                                                        </span>

                                                    )}

                                                </td>


                                                {/* CONDITION */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`text-xs font-semibold ${conditionClass(
                                                            asset.condition,
                                                        )}`}
                                                    >
                                                        {
                                                            conditionLabel(
                                                                asset.condition,
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusClass(
                                                            asset.status,
                                                        )}`}
                                                    >
                                                        {
                                                            statusLabel(
                                                                asset.status,
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">

                                                        <Link
                                                            href={`/assets/${asset.id}`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                                                            title="View asset"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </Link>


                                                        <Link
                                                            href={`/assets/${asset.id}/edit`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                                                            title="Edit asset"
                                                        >

                                                            <Edit className="h-4 w-4" />

                                                        </Link>

                                                    </div>

                                                </td>

                                            </tr>

                                        ),
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ================================================== */}
                    {/* PAGINATION */}
                    {/* ================================================== */}

                    {assets.last_page >
                        1 && (

                        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">

                            <p className="text-xs text-slate-500">

                                Showing{' '}

                                <span className="font-semibold text-slate-700">
                                    {assets.from ??
                                        0}
                                </span>

                                {' '}to{' '}

                                <span className="font-semibold text-slate-700">
                                    {assets.to ??
                                        0}
                                </span>

                                {' '}of{' '}

                                <span className="font-semibold text-slate-700">
                                    {
                                        assets.total
                                    }
                                </span>

                                {' '}assets

                            </p>


                            <div className="flex items-center gap-1">

                                {assets.links.map(
                                    (
                                        link,
                                        index,
                                    ) => {

                                        /*
                                        |--------------------------------------------------------------------------
                                        | PREVIOUS / NEXT
                                        |--------------------------------------------------------------------------
                                        */

                                        if (
                                            index ===
                                                0 ||
                                            index ===
                                                assets
                                                    .links
                                                    .length -
                                                    1
                                        ) {

                                            return (
                                                <button
                                                    key={
                                                        index
                                                    }
                                                    type="button"
                                                    disabled={
                                                        !link.url
                                                    }
                                                    onClick={() =>
                                                        goToPage(
                                                            link.url,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >

                                                    {index ===
                                                    0 ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}

                                                </button>
                                            );
                                        }


                                        return (
                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                disabled={
                                                    !link.url
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        link.url,
                                                    )
                                                }
                                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-700 text-white'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    },
                                )}

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
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
}) {

    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                    {value}
                </p>

            </div>


            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                {icon}

            </div>

        </div>
    );
}