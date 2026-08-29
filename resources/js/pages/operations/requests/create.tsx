import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Check, ClipboardList, FileText, Plus, Trash2, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

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

interface PurchaseItem {
    id: number;
    description: string;
    quantity: string;
    unit: string;
    estimated_unit_cost: string;
}

interface RequestForm {
    type: string;
    title: string;
    description: string;
    priority: string;

    purpose: string;
    justification: string;
    requested_date: string;

    items: PurchaseItem[];
}

const requestTypes = [
    { value: 'general', label: 'General Request' },
    { value: 'purchase', label: 'Purchase Request' },
    { value: 'procurement', label: 'Procurement Request' },
    { value: 'service', label: 'Service Request' },
    { value: 'maintenance', label: 'Maintenance Request' },
    { value: 'repair', label: 'Repair Request' },
    { value: 'equipment', label: 'Equipment Request' },
    { value: 'vehicle', label: 'Vehicle Request' },
    { value: 'personnel', label: 'Personnel Request' },
    { value: 'travel', label: 'Travel Request' },
    { value: 'training', label: 'Training Request' },
    { value: 'supply', label: 'Supply Request' },
    { value: 'it_support', label: 'IT Support Request' },
    { value: 'facility', label: 'Facility Request' },
    { value: 'document', label: 'Document Request' },
    { value: 'financial', label: 'Financial Request' },
    { value: 'event', label: 'Event Request' },
    { value: 'project', label: 'Project Request' },
    { value: 'inspection', label: 'Inspection Request' },
    {
        value: 'permit_clearance',
        label: 'Permit / Clearance Request',
    },
    { value: 'assistance', label: 'Assistance Request' },
    { value: 'other', label: 'Other Request' },
];

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

function createPurchaseItem(): PurchaseItem {
    return {
        id: Date.now() + Math.random(),
        description: '',
        quantity: '1',
        unit: '',
        estimated_unit_cost: '',
    };
}

export default function CreateRequest() {
    const { auth } = usePage<PageProps>().props;

    const user = auth.user;

    const [items, setItems] = useState<PurchaseItem[]>([createPurchaseItem()]);

    const { data, setData, post, processing, errors, transform } = useForm<RequestForm>({
        type: 'purchase',
        title: '',
        description: '',
        priority: 'normal',

        purpose: '',
        justification: '',
        requested_date: new Date().toISOString().split('T')[0],

        items: [],
    });

    /*
    |--------------------------------------------------------------------------
    | PURCHASE ITEM HELPERS
    |--------------------------------------------------------------------------
    */

    function updateItem(id: number, field: keyof PurchaseItem, value: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
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
        setItems((currentItems) => [...currentItems, createPurchaseItem()]);
    }

    function removeItem(id: number) {
        setItems((currentItems) => {
            if (currentItems.length === 1) {
                return currentItems;
            }

            return currentItems.filter((item) => item.id !== id);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    const totalEstimatedCost = useMemo(() => {
        return items.reduce((total, item) => {
            const quantity = Number(item.quantity) || 0;

            const unitCost = Number(item.estimated_unit_cost) || 0;

            return total + quantity * unitCost;
        }, 0);
    }, [items]);

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(e: React.FormEvent) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            items: items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                estimated_unit_cost: item.estimated_unit_cost,
            })),
        }));

        post('/operations/requests', {
            preserveScroll: true,
        });
    }

    const isPurchaseRequest = data.type === 'purchase';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Request" />

            <div className="flex w-full flex-1 flex-col gap-6 p-6">
                {/* ====================================================== */}
                {/* PAGE HEADER */}
                {/* ====================================================== */}

                <div className="flex items-start gap-3">
                    <Link
                        href="/operations/requests"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <ClipboardList className="h-4 w-4" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New Request</h1>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">Submit a request for municipal operations.</p>
                    </div>
                </div>

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

                                        <p className="mt-0.5 text-xs text-slate-500">Automatically assigned from your account.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid w-full gap-5 p-6 lg:grid-cols-2">
                                {/* Requested By */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Requested By</label>

                                    <div className="mt-2 flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <UserRound className="h-4 w-4 shrink-0 text-slate-400" />

                                        <span className="truncate text-sm font-medium text-slate-700">{user.name}</span>
                                    </div>
                                </div>

                                {/* Department */}

                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Department</label>

                                    <div className="mt-2 flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                            <span className="truncate text-sm font-medium text-slate-700">
                                                {user.department?.name ?? 'No Department'}
                                            </span>
                                        </div>

                                        {user.department?.code && (
                                            <span className="ml-3 shrink-0 rounded-md bg-white px-2 py-1 text-[9px] font-semibold tracking-wide text-slate-400 ring-1 ring-slate-200">
                                                {user.department.code}
                                            </span>
                                        )}
                                    </div>

                                    {errors.department && <p className="mt-1.5 text-xs text-red-600">{errors.department}</p>}
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

                                        <p className="mt-0.5 text-xs text-slate-500">Provide the information needed to process your request.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-6 p-6">
                                {/* ================================================== */}
                                {/* TYPE + PRIORITY */}
                                {/* ================================================== */}

                                <div className="grid w-full gap-6 lg:grid-cols-2">
                                    {/* Request Type */}

                                    <div>
                                        <label htmlFor="type" className="text-xs font-semibold text-slate-700">
                                            Request Type
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

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

                                    {/* Priority */}

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700">
                                            Priority
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <div className="mt-2 grid grid-cols-4 gap-2">
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
                                </div>

                                {/* ================================================== */}
                                {/* PURCHASE REQUEST */}
                                {/* ================================================== */}

                                {isPurchaseRequest && (
                                    <>
                                        {/* Purpose + Date */}

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
                                                    placeholder="e.g. Office supplies for daily operations"
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

                                        {/* Justification */}

                                        <div>
                                            <label htmlFor="justification" className="text-xs font-semibold text-slate-700">
                                                Justification
                                                <span className="ml-1 text-red-500">*</span>
                                            </label>

                                            <textarea
                                                id="justification"
                                                value={data.justification}
                                                onChange={(e) => setData('justification', e.target.value)}
                                                rows={4}
                                                placeholder="Explain why these items are needed and how they will support your department's operations..."
                                                className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                            />

                                            {errors.justification && <p className="mt-1.5 text-xs text-red-600">{errors.justification}</p>}
                                        </div>

                                        {/* ================================================== */}
                                        {/* ITEMS */}
                                        {/* ================================================== */}

                                        <div className="overflow-hidden rounded-lg border border-slate-200">
                                            {/* Items Header */}

                                            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-800">Requested Items</h3>

                                                    <p className="mt-0.5 text-xs text-slate-500">Add all items required for this purchase.</p>
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

                                            {/* Desktop Table */}

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
                                                        {items.map((item, index) => {
                                                            const quantity = Number(item.quantity) || 0;

                                                            const unitCost = Number(item.estimated_unit_cost) || 0;

                                                            const amount = quantity * unitCost;

                                                            return (
                                                                <tr key={item.id} className="bg-white">
                                                                    <td className="px-3 py-3 text-center text-xs font-medium text-slate-400">
                                                                        {index + 1}
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={item.description}
                                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                            placeholder="Item description"
                                                                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                                        />
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={item.quantity}
                                                                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                                        />
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={item.unit}
                                                                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                                            placeholder="ream"
                                                                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                                                                                onChange={(e) =>
                                                                                    updateItem(item.id, 'estimated_unit_cost', e.target.value)
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="h-10 w-full rounded-lg border border-slate-200 py-2 pr-3 pl-7 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-3 py-3 text-right">
                                                                        <span className="text-xs font-semibold text-slate-700">
                                                                            {formatCurrency(amount)}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeItem(item.id)}
                                                                            disabled={items.length === 1}
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

                                            {/* Mobile / Tablet Cards */}

                                            <div className="divide-y divide-slate-100 lg:hidden">
                                                {items.map((item, index) => {
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
                                                                    disabled={items.length === 1}
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
                                                                    placeholder="Item description"
                                                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500"
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[10px] font-semibold text-slate-500">Quantity</label>

                                                                    <input
                                                                        type="number"
                                                                        min="1"
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
                                                                        placeholder="ream"
                                                                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500"
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
                                                                            onChange={(e) =>
                                                                                updateItem(item.id, 'estimated_unit_cost', e.target.value)
                                                                            }
                                                                            placeholder="0.00"
                                                                            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 py-2 pr-3 pl-7 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="text-[10px] font-semibold text-slate-500">
                                                                        Estimated Amount
                                                                    </label>

                                                                    <div className="mt-1.5 flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700">
                                                                        {formatCurrency(amount)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Total */}

                                            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600">Total Estimated Cost</p>

                                                    <p className="mt-0.5 text-[10px] text-slate-400">Based on the estimated unit costs provided.</p>
                                                </div>

                                                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalEstimatedCost)}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ================================================== */}
                                {/* GENERIC DESCRIPTION */}
                                {/* ================================================== */}

                                <div>
                                    <label htmlFor="description" className="text-xs font-semibold text-slate-700">
                                        {isPurchaseRequest ? 'Additional Notes' : 'Description'}
                                    </label>

                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={isPurchaseRequest ? 4 : 7}
                                        placeholder={
                                            isPurchaseRequest
                                                ? 'Add any additional information or notes...'
                                                : 'Provide additional details about your request...'
                                        }
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
                                <p className="text-xs font-medium text-slate-600">Ready to submit?</p>

                                <p className="mt-0.5 text-[10px] text-slate-400">Review your information before submitting.</p>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <Link
                                    href="/operations/requests"
                                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
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
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
