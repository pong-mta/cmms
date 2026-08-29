import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Check, ClipboardList, FileText, Plus, Trash2, UserRound } from 'lucide-react';
import { useMemo } from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

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

interface PurchaseRequestItem {
    id: number;
    description: string;
    quantity: string | number;
    unit: string;
    estimated_unit_cost: string | number;
    estimated_amount?: string | number;
}

interface PurchaseRequest {
    id: number;
    operation_request_id: number;
    purpose: string;
    justification: string;
    requested_date: string;
    items: PurchaseRequestItem[];
}

interface OperationRequest {
    id: number;
    request_no: string;
    type: string;
    title: string;
    description: string | null;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    updated_at: string;

    user?: User | null;
    department?: Department | null;

    purchaseRequest?: PurchaseRequest | null;
}

interface PageProps {
    request: OperationRequest;
}

/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requests',
        href: '/operations/requests',
    },
    {
        title: 'Request Details',
        href: '#',
    },
    {
        title: 'Edit Request',
        href: '#',
    },
];

/*
|--------------------------------------------------------------------------
| PRIORITIES
|--------------------------------------------------------------------------
*/

const priorities = [
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
        value: 'urgent',
        label: 'Urgent',
    },
];

/*
|--------------------------------------------------------------------------
| FORM TYPES
|--------------------------------------------------------------------------
*/

interface EditItem {
    id: number;
    description: string;
    quantity: string;
    unit: string;
    estimated_unit_cost: string;
}

interface EditRequestForm {
    description: string;
    priority: string;

    purpose: string;
    justification: string;
    requested_date: string;

    items: EditItem[];
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function createItem(item?: PurchaseRequestItem): EditItem {
    return {
        id: item?.id ?? Date.now() + Math.random(),

        description: item?.description ?? '',

        quantity: item?.quantity !== undefined ? String(item.quantity) : '1',

        unit: item?.unit ?? '',

        estimated_unit_cost: item?.estimated_unit_cost !== undefined ? String(item.estimated_unit_cost) : '',
    };
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function EditRequest({ request }: PageProps) {
    const purchaseRequest = request.purchaseRequest ?? null;

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const { data, setData, put, processing, errors } = useForm<EditRequestForm>({
        description: request.description ?? '',

        priority: request.priority,

        purpose: purchaseRequest?.purpose ?? '',

        justification: purchaseRequest?.justification ?? '',

        requested_date: purchaseRequest?.requested_date
            ? String(purchaseRequest.requested_date).substring(0, 10)
            : new Date().toISOString().split('T')[0],

        items: purchaseRequest?.items?.map(createItem) ?? [createItem()],
    });

    /*
    |--------------------------------------------------------------------------
    | ITEM HELPERS
    |--------------------------------------------------------------------------
    */

    function updateItem(id: number, field: keyof EditItem, value: string) {
        setData(
            'items',
            data.items.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item,
            ),
        );
    }

    function addItem() {
        setData('items', [...data.items, createItem()]);
    }

    function removeItem(id: number) {
        if (data.items.length === 1) {
            return;
        }

        setData(
            'items',
            data.items.filter((item) => item.id !== id),
        );
    }

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    const totalEstimatedCost = useMemo(() => {
        return data.items.reduce((total, item) => {
            const quantity = Number(item.quantity) || 0;

            const unitCost = Number(item.estimated_unit_cost) || 0;

            return total + quantity * unitCost;
        }, 0);
    }, [data.items]);

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(`/operations/requests/${request.id}`, {
            preserveScroll: true,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SAFETY
    |--------------------------------------------------------------------------
    */

    if (!purchaseRequest) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Edit ${request.request_no}`} />

                <div className="flex w-full flex-1 flex-col gap-6 p-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-sm font-semibold text-red-700">Purchase Request Details Not Found</h1>

                        <p className="mt-1 text-xs text-red-600">This request does not contain purchase request information.</p>

                        <Link
                            href={`/operations/requests/${request.id}`}
                            className="mt-4 inline-flex h-10 items-center rounded-lg bg-white px-4 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                        >
                            Back to Request
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${request.request_no}`} />

            <div className="flex w-full flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* PAGE HEADER */}
                {/* ====================================================== */}

                <div className="flex items-start gap-3">
                    <Link
                        href={`/operations/requests/${request.id}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <ClipboardList className="h-4 w-4" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit Request</h1>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">Correct the returned request before resubmitting it.</p>
                    </div>
                </div>

                {/* ====================================================== */}
                {/* RETURN NOTICE */}
                {/* ====================================================== */}

                <section className="w-full overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
                    <div className="flex items-start gap-3 p-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <FileText className="h-4 w-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-amber-900">Request Returned for Correction</h2>

                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                Your request was returned by the Department Head. Review and correct the information below, then save your changes
                                before resubmitting.
                            </p>

                            <p className="mt-2 text-[10px] font-semibold tracking-wide text-amber-600 uppercase">Request No.</p>

                            <p className="text-sm font-bold text-amber-900">{request.request_no}</p>
                        </div>
                    </div>
                </section>

                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form onSubmit={submit} className="w-full">
                    <div className="w-full space-y-5">
                        {/* ================================================== */}
                        {/* REQUESTER INFORMATION */}
                        {/* ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <UserRound className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Requester Information</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">Requester and department information.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid w-full gap-5 p-6 lg:grid-cols-2">
                                {/* Requested By */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Requested By</label>

                                    <div className="mt-2 flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <UserRound className="h-4 w-4 shrink-0 text-slate-400" />

                                        <span className="truncate text-sm font-medium text-slate-700">{request.user?.name ?? 'Unknown User'}</span>
                                    </div>
                                </div>

                                {/* Department */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Department</label>

                                    <div className="mt-2 flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                            <span className="truncate text-sm font-medium text-slate-700">
                                                {request.department?.name ?? 'No Department'}
                                            </span>
                                        </div>

                                        {request.department?.code && (
                                            <span className="ml-3 shrink-0 rounded-md bg-white px-2 py-1 text-[9px] font-semibold tracking-wide text-slate-400 ring-1 ring-slate-200">
                                                {request.department.code}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* REQUEST DETAILS */}
                        {/* ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">Request Details</h2>

                                        <p className="mt-0.5 text-xs text-slate-500">Correct the information that needs to be changed.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-6 p-6">
                                {/* ================================================== */}
                                {/* PRIORITY */}
                                {/* ================================================== */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-700">
                                        Priority
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {priorities.map((priority) => {
                                            const selected = data.priority === priority.value;

                                            return (
                                                <button
                                                    key={priority.value}
                                                    type="button"
                                                    onClick={() => setData('priority', priority.value)}
                                                    className={`flex h-11 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                                                        selected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {selected && <Check className="mr-1 h-3 w-3" />}

                                                    {priority.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {errors.priority && <p className="mt-1.5 text-xs text-red-600">{errors.priority}</p>}
                                </div>

                                {/* ================================================== */}
                                {/* PURPOSE + DATE */}
                                {/* ================================================== */}

                                <div className="grid w-full gap-6 lg:grid-cols-2">
                                    {/* Purpose */}

                                    <div>
                                        <label htmlFor="purpose" className="text-xs font-semibold text-slate-700">
                                            Purpose
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            id="purpose"
                                            type="text"
                                            value={data.purpose}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                        />

                                        {errors.purpose && <p className="mt-1.5 text-xs text-red-600">{errors.purpose}</p>}
                                    </div>

                                    {/* Requested Date */}

                                    <div>
                                        <label htmlFor="requested_date" className="text-xs font-semibold text-slate-700">
                                            Requested Date
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <input
                                            id="requested_date"
                                            type="date"
                                            value={data.requested_date}
                                            onChange={(e) => setData('requested_date', e.target.value)}
                                            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                        />

                                        {errors.requested_date && <p className="mt-1.5 text-xs text-red-600">{errors.requested_date}</p>}
                                    </div>
                                </div>

                                {/* ================================================== */}
                                {/* JUSTIFICATION */}
                                {/* ================================================== */}

                                <div>
                                    <label htmlFor="justification" className="text-xs font-semibold text-slate-700">
                                        Justification
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <textarea
                                        id="justification"
                                        value={data.justification}
                                        onChange={(e) => setData('justification', e.target.value)}
                                        rows={5}
                                        className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />

                                    {errors.justification && <p className="mt-1.5 text-xs text-red-600">{errors.justification}</p>}
                                </div>

                                {/* ================================================== */}
                                {/* ITEMS */}
                                {/* ================================================== */}

                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-800">Requested Items</h3>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Correct quantities, units, descriptions, or estimated costs.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Item
                                        </button>
                                    </div>

                                    {/* Desktop */}

                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="w-full">
                                            <thead className="border-b border-slate-200 bg-white">
                                                <tr>
                                                    <th className="w-12 px-3 py-3 text-center text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        #
                                                    </th>

                                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Item Description
                                                    </th>

                                                    <th className="w-28 px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Quantity
                                                    </th>

                                                    <th className="w-32 px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Unit
                                                    </th>

                                                    <th className="w-44 px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Est. Unit Cost
                                                    </th>

                                                    <th className="w-44 px-3 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Est. Amount
                                                    </th>

                                                    <th className="w-12 px-3 py-3"></th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {data.items.map((item, index) => {
                                                    const quantity = Number(item.quantity) || 0;

                                                    const unitCost = Number(item.estimated_unit_cost) || 0;

                                                    const amount = quantity * unitCost;

                                                    return (
                                                        <tr key={item.id}>
                                                            <td className="px-3 py-3 text-center text-xs font-medium text-slate-400">{index + 1}</td>

                                                            <td className="px-3 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={item.description}
                                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                                />

                                                                {errors[`items.${index}.description`] && (
                                                                    <p className="mt-1 text-[10px] text-red-600">
                                                                        {errors[`items.${index}.description`]}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                                />
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={item.unit}
                                                                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                                />
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <div className="relative">
                                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                                                                        ₱
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={item.estimated_unit_cost}
                                                                        onChange={(e) => updateItem(item.id, 'estimated_unit_cost', e.target.value)}
                                                                        className="h-10 w-full rounded-lg border border-slate-200 py-2 pr-3 pl-7 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                                    />
                                                                </div>
                                                            </td>

                                                            <td className="px-3 py-3 text-right">
                                                                <span className="text-xs font-semibold text-slate-700">{formatCurrency(amount)}</span>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(item.id)}
                                                                    disabled={data.items.length === 1}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile */}

                                    <div className="divide-y divide-slate-100 lg:hidden">
                                        {data.items.map((item, index) => {
                                            const quantity = Number(item.quantity) || 0;

                                            const unitCost = Number(item.estimated_unit_cost) || 0;

                                            const amount = quantity * unitCost;

                                            return (
                                                <div key={item.id} className="space-y-4 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-slate-500">Item {index + 1}</span>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            disabled={data.items.length === 1}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-semibold text-slate-500">Item Description</label>

                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] font-semibold text-slate-500">Quantity</label>

                                                            <input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-semibold text-slate-500">Unit</label>

                                                            <input
                                                                type="text"
                                                                value={item.unit}
                                                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] font-semibold text-slate-500">Est. Unit Cost</label>

                                                            <div className="relative">
                                                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                                                                    ₱
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={item.estimated_unit_cost}
                                                                    onChange={(e) => updateItem(item.id, 'estimated_unit_cost', e.target.value)}
                                                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 py-2 pr-3 pl-7 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-semibold text-slate-500">Estimated Amount</label>

                                                            <div className="mt-1.5 flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700">
                                                                {formatCurrency(amount)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* TOTAL */}

                                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600">Total Estimated Cost</p>

                                            <p className="mt-0.5 text-[10px] text-slate-400">Based on the estimated unit costs.</p>
                                        </div>

                                        <p className="text-lg font-bold text-slate-900">{formatCurrency(totalEstimatedCost)}</p>
                                    </div>
                                </div>

                                {/* ================================================== */}
                                {/* ADDITIONAL NOTES */}
                                {/* ================================================== */}

                                <div>
                                    <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                                        Additional Notes
                                    </label>

                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />

                                    {errors.description && <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>}
                                </div>
                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* ACTIONS */}
                        {/* ================================================== */}

                        <div className="flex w-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600">Save your corrections</p>

                                <p className="mt-0.5 text-[10px] text-slate-400">After saving, you can review the request before resubmitting it.</p>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <Link
                                    href={`/operations/requests/${request.id}`}
                                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
