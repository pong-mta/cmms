import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Calculator,
    CalendarDays,
    ClipboardList,
    FileText,
    MapPin,
    Package,
    Paperclip,
    Plus,
    Receipt,
    Send,
    Trash2,
    User,
    Wallet,
    Plane,
    Hotel,
} from 'lucide-react';

import type {
    ChangeEvent,
    FormEvent,
} from 'react';


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


interface RequestType {
    id: number;
    code: string;
    name: string;
    category: string;
    description?: string | null;
    icon?: string | null;
    workflow: string;
    requires_items: boolean;
    requires_cost: boolean;
    requires_attachment: boolean;
    active: boolean;
    sort_order: number;
}


/*
|--------------------------------------------------------------------------
| PURCHASE ITEM
|--------------------------------------------------------------------------
*/

interface PurchaseItem {
    description: string;
    quantity: number | string;
    unit: string;
    estimated_unit_price: number | string;
    remarks: string;
}


/*
|--------------------------------------------------------------------------
| REIMBURSEMENT ITEM
|--------------------------------------------------------------------------
*/

interface ReimbursementItem {
    expense_date: string;
    expense_type: string;
    description: string;
    amount: number | string;
    receipt_reference: string;
    remarks: string;
}


/*
|--------------------------------------------------------------------------
| TRAVEL
|--------------------------------------------------------------------------
*/

interface TravelDetails {
    destination: string;
    purpose: string;

    departure_date: string;
    return_date: string;

    mode_of_travel: string;
    accommodation: string;

    estimated_transportation: number | string;
    estimated_accommodation: number | string;
    estimated_meals: number | string;
    estimated_registration: number | string;
    estimated_other: number | string;

    funding_source: string;
    remarks: string;
}


interface Props {
    user: AuthUser;
    assets: Asset[];
    requestTypes: RequestType[];
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| CATEGORY ORDER
|--------------------------------------------------------------------------
*/

const categoryOrder = [
    'General',
    'Procurement',
    'Asset & Facilities',
    'Finance',
    'Travel',
    'Documents',
    'Information Technology',
    'Human Resources',
    'Events',
    'Legal',
];


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function CreateRequest({
    user,
    assets,
    requestTypes,
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
        reset,
    } = useForm<{
        request_type_id: string;

        subject: string;
        description: string;
        priority: string;

        location: string;
        asset_id: string;

        remarks: string;

        /*
        |--------------------------------------------------------------------------
        | PURCHASE
        |--------------------------------------------------------------------------
        */

        items: PurchaseItem[];

        /*
        |--------------------------------------------------------------------------
        | REIMBURSEMENT
        |--------------------------------------------------------------------------
        */

        reimbursement_items: ReimbursementItem[];

        /*
        |--------------------------------------------------------------------------
        | COST
        |--------------------------------------------------------------------------
        */

        estimated_total_cost: string;

        /*
        |--------------------------------------------------------------------------
        | TRAVEL
        |--------------------------------------------------------------------------
        */

        travel: TravelDetails;

        /*
        |--------------------------------------------------------------------------
        | ATTACHMENTS
        |--------------------------------------------------------------------------
        */

        attachments: File[];
    }>({

        request_type_id: '',

        subject: '',
        description: '',
        priority: 'normal',

        location: '',
        asset_id: '',

        remarks: '',

        items: [],

        reimbursement_items: [],

        estimated_total_cost: '',

        travel: {
            destination: '',
            purpose: '',

            departure_date: '',
            return_date: '',

            mode_of_travel: '',
            accommodation: '',

            estimated_transportation: '',
            estimated_accommodation: '',
            estimated_meals: '',
            estimated_registration: '',
            estimated_other: '',

            funding_source: '',
            remarks: '',
        },

        attachments: [],
    });


    /*
    |--------------------------------------------------------------------------
    | SELECTED REQUEST TYPE
    |--------------------------------------------------------------------------
    */

    const selectedRequestType =
        requestTypes.find(
            (type) =>
                String(type.id) ===
                String(data.request_type_id),
        );


    /*
    |--------------------------------------------------------------------------
    | REQUEST TYPE HELPERS
    |--------------------------------------------------------------------------
    */

    const selectedTypeCode =
        selectedRequestType?.code
            ?.toLowerCase()
            .trim() ?? '';

    const selectedTypeName =
        selectedRequestType?.name
            ?.toLowerCase()
            .trim() ?? '';

    const selectedCategory =
        selectedRequestType?.category
            ?.toLowerCase()
            .trim() ?? '';


    /*
    |--------------------------------------------------------------------------
    | PURCHASE REQUEST?
    |--------------------------------------------------------------------------
    */

    const isPurchaseRequest =
        selectedCategory === 'procurement' ||
        selectedTypeCode.includes('purchase') ||
        selectedTypeCode.includes('procurement') ||
        selectedTypeCode.includes('supplies') ||
        selectedTypeName.includes('purchase') ||
        selectedTypeName.includes('procurement') ||
        selectedTypeName.includes('supplies');


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT REQUEST?
    |--------------------------------------------------------------------------
    */

    const isReimbursementRequest =
        selectedCategory === 'finance' &&
        (
            selectedTypeCode.includes('reimburse') ||
            selectedTypeName.includes('reimburse')
        );


    /*
    |--------------------------------------------------------------------------
    | TRAVEL REQUEST?
    |--------------------------------------------------------------------------
    */

    const isTravelRequest =
        selectedCategory === 'travel' ||
        selectedTypeCode.includes('travel') ||
        selectedTypeCode.includes('travel_order') ||
        selectedTypeName.includes('travel');


    /*
    |--------------------------------------------------------------------------
    | GROUP REQUEST TYPES
    |--------------------------------------------------------------------------
    */

    const groupedRequestTypes =
        requestTypes
            .filter(
                (type) =>
                    type.active,
            )
            .sort(
                (a, b) =>
                    a.sort_order -
                    b.sort_order,
            )
            .reduce(
                (
                    groups,
                    type,
                ) => {

                    if (
                        !groups[type.category]
                    ) {
                        groups[type.category] = [];
                    }

                    groups[type.category].push(
                        type,
                    );

                    return groups;

                },
                {} as Record<
                    string,
                    RequestType[]
                >,
            );


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        post(
            '/operations/requests',
            {
                forceFormData: true,

                onSuccess: () => {
                    reset();
                },
            },
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REQUEST TYPE CHANGE
    |--------------------------------------------------------------------------
    */

    function handleRequestTypeChange(
        event: ChangeEvent<HTMLSelectElement>,
    ) {

        const requestTypeId =
            event.target.value;

        setData(
            'request_type_id',
            requestTypeId,
        );


        /*
        |--------------------------------------------------------------------------
        | CLEAR PURCHASE
        |--------------------------------------------------------------------------
        */

        setData(
            'items',
            [],
        );


        /*
        |--------------------------------------------------------------------------
        | CLEAR REIMBURSEMENT
        |--------------------------------------------------------------------------
        */

        setData(
            'reimbursement_items',
            [],
        );


        /*
        |--------------------------------------------------------------------------
        | CLEAR COST
        |--------------------------------------------------------------------------
        */

        setData(
            'estimated_total_cost',
            '',
        );


        /*
        |--------------------------------------------------------------------------
        | CLEAR TRAVEL
        |--------------------------------------------------------------------------
        */

        setData(
            'travel',
            {
                destination: '',
                purpose: '',

                departure_date: '',
                return_date: '',

                mode_of_travel: '',
                accommodation: '',

                estimated_transportation: '',
                estimated_accommodation: '',
                estimated_meals: '',
                estimated_registration: '',
                estimated_other: '',

                funding_source: '',
                remarks: '',
            },
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PURCHASE ITEMS
    |--------------------------------------------------------------------------
    */

    function addPurchaseItem() {

        setData(
            'items',
            [
                ...data.items,

                {
                    description: '',
                    quantity: 1,
                    unit: 'pcs',
                    estimated_unit_price: '',
                    remarks: '',
                },
            ],
        );
    }


    function removePurchaseItem(
        index: number,
    ) {

        setData(
            'items',
            data.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );
    }


    function updatePurchaseItem(
        index: number,
        field: keyof PurchaseItem,
        value: string | number,
    ) {

        const items =
            [...data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        setData(
            'items',
            items,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PURCHASE ITEM AMOUNT
    |--------------------------------------------------------------------------
    */

    function purchaseItemAmount(
        item: PurchaseItem,
    ): number {

        const quantity =
            Number(item.quantity) || 0;

        const price =
            Number(
                item.estimated_unit_price,
            ) || 0;

        return quantity * price;
    }


    /*
    |--------------------------------------------------------------------------
    | PURCHASE TOTAL
    |--------------------------------------------------------------------------
    */

    const purchaseTotal =
        data.items.reduce(
            (
                total,
                item,
            ) =>
                total +
                purchaseItemAmount(item),
            0,
        );


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT ITEMS
    |--------------------------------------------------------------------------
    */

    function addReimbursementItem() {

        setData(
            'reimbursement_items',
            [
                ...data.reimbursement_items,

                {
                    expense_date: '',
                    expense_type: 'Other',
                    description: '',
                    amount: '',
                    receipt_reference: '',
                    remarks: '',
                },
            ],
        );
    }


    function removeReimbursementItem(
        index: number,
    ) {

        setData(
            'reimbursement_items',
            data.reimbursement_items.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );
    }


    function updateReimbursementItem(
        index: number,
        field: keyof ReimbursementItem,
        value: string,
    ) {

        const items =
            [...data.reimbursement_items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        setData(
            'reimbursement_items',
            items,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT TOTAL
    |--------------------------------------------------------------------------
    */

    const reimbursementTotal =
        data.reimbursement_items.reduce(
            (
                total,
                item,
            ) =>
                total +
                (Number(item.amount) || 0),
            0,
        );


    /*
    |--------------------------------------------------------------------------
    | TRAVEL TOTAL
    |--------------------------------------------------------------------------
    */

    const travelTotal =
        (
            Number(
                data.travel.estimated_transportation,
            ) || 0
        ) +
        (
            Number(
                data.travel.estimated_accommodation,
            ) || 0
        ) +
        (
            Number(
                data.travel.estimated_meals,
            ) || 0
        ) +
        (
            Number(
                data.travel.estimated_registration,
            ) || 0
        ) +
        (
            Number(
                data.travel.estimated_other,
            ) || 0
        );


    /*
    |--------------------------------------------------------------------------
    | ATTACHMENTS
    |--------------------------------------------------------------------------
    */

    function handleAttachments(
        event: ChangeEvent<HTMLInputElement>,
    ) {

        const files =
            Array.from(
                event.target.files ??
                    [],
            );

        setData(
            'attachments',
            files,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CATEGORY ICON
    |--------------------------------------------------------------------------
    */

    function categoryIcon(
        category: string,
    ) {

        switch (category) {

            case 'Procurement':
                return (
                    <Package className="h-4 w-4" />
                );

            case 'Finance':
                return (
                    <Wallet className="h-4 w-4" />
                );

            case 'Travel':
                return (
                    <MapPin className="h-4 w-4" />
                );

            case 'Documents':
                return (
                    <FileText className="h-4 w-4" />
                );

            case 'Asset & Facilities':
                return (
                    <ClipboardList className="h-4 w-4" />
                );

            case 'Information Technology':
                return (
                    <Calculator className="h-4 w-4" />
                );

            case 'Human Resources':
                return (
                    <User className="h-4 w-4" />
                );

            default:
                return (
                    <FileText className="h-4 w-4" />
                );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | MONEY FORMAT
    |--------------------------------------------------------------------------
    */

    function money(
        value: number,
    ) {

        return value.toLocaleString(
            'en-PH',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
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

            <Head
                title="New Request"
            />


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


                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        New Request
                    </h1>


                    <p className="mt-1 text-sm text-slate-500">
                        Submit a request for your department.
                    </p>

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
                                {user.department?.name ??
                                    'No Department'}
                            </p>

                            {user.department?.code && (

                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                    {user.department.code}
                                </p>

                            )}

                        </div>

                    </div>

                </div>


                {/* ====================================================== */}
                {/* FORM */}
                {/* ====================================================== */}

                <form
                    onSubmit={submit}
                    encType="multipart/form-data"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
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
                                Select what your department needs.
                            </p>

                        </div>


                        <div className="grid gap-5 md:grid-cols-2">


                            {/* REQUEST TYPE */}

                            <div>

                                <label
                                    htmlFor="request_type_id"
                                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                                >
                                    Request Type

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <select
                                    id="request_type_id"
                                    value={
                                        data.request_type_id
                                    }
                                    onChange={
                                        handleRequestTypeChange
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        Select request type
                                    </option>


                                    {categoryOrder.map(
                                        (
                                            category,
                                        ) => {

                                            const types =
                                                groupedRequestTypes[
                                                    category
                                                ];


                                            if (
                                                !types ||
                                                types.length === 0
                                            ) {
                                                return null;
                                            }


                                            return (

                                                <optgroup
                                                    key={category}
                                                    label={category}
                                                >

                                                    {types.map(
                                                        (
                                                            type,
                                                        ) => (

                                                            <option
                                                                key={type.id}
                                                                value={type.id}
                                                            >
                                                                {type.name}
                                                            </option>

                                                        ),
                                                    )}

                                                </optgroup>

                                            );
                                        },
                                    )}


                                    {Object.entries(
                                        groupedRequestTypes,
                                    )
                                        .filter(
                                            ([category]) =>
                                                !categoryOrder.includes(
                                                    category,
                                                ),
                                        )
                                        .map(
                                            ([
                                                category,
                                                types,
                                            ]) => (

                                                <optgroup
                                                    key={category}
                                                    label={category}
                                                >

                                                    {types.map(
                                                        (
                                                            type,
                                                        ) => (

                                                            <option
                                                                key={type.id}
                                                                value={type.id}
                                                            >
                                                                {type.name}
                                                            </option>

                                                        ),
                                                    )}

                                                </optgroup>

                                            ),
                                        )}

                                </select>


                                {errors.request_type_id && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {
                                            errors.request_type_id
                                        }
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
                                    value={
                                        data.priority
                                    }
                                    onChange={(
                                        event,
                                    ) =>
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

                            </div>


                            {/* SELECTED TYPE DESCRIPTION */}

                            {selectedRequestType && (

                                <div className="md:col-span-2">

                                    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">

                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">

                                            {categoryIcon(
                                                selectedRequestType.category,
                                            )}

                                        </div>


                                        <div>

                                            <p className="text-xs font-semibold text-blue-700">
                                                {
                                                    selectedRequestType.name
                                                }
                                            </p>


                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">

                                                {
                                                    selectedRequestType.description ??
                                                    'Complete the information required for this request.'
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}


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
                                    value={
                                        data.subject
                                    }
                                    onChange={(
                                        event,
                                    ) =>
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
                                        {
                                            errors.subject
                                        }
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
                                    value={
                                        data.description
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Provide the details of your request..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>

                    </div>


                    {/* ====================================================== */}
                    {/* PURCHASE */}
                    {/* ====================================================== */}

                    {isPurchaseRequest && (

                        <div className="border-b border-slate-100 p-6">

                            <div className="mb-5 flex items-start justify-between gap-4">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <Package className="h-4 w-4 text-blue-600" />

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Purchase Items
                                        </h2>

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Add the supplies, materials, equipment, or other items being requested.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        addPurchaseItem
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >

                                    <Plus className="h-4 w-4" />

                                    Add Item

                                </button>

                            </div>


                            {data.items.length === 0 ? (

                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

                                    <Package className="mx-auto h-6 w-6 text-slate-300" />

                                    <p className="mt-2 text-xs font-semibold text-slate-600">
                                        No purchase items added
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Add items to calculate the estimated purchase cost.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {data.items.map(
                                        (
                                            item,
                                            index,
                                        ) => (

                                            <div
                                                key={index}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >

                                                <div className="mb-4 flex items-center justify-between">

                                                    <p className="text-xs font-semibold text-slate-700">
                                                        Item #{index + 1}
                                                    </p>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removePurchaseItem(
                                                                index,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
                                                    >

                                                        <Trash2 className="h-3.5 w-3.5" />

                                                        Remove

                                                    </button>

                                                </div>


                                                <div className="grid gap-4 md:grid-cols-12">


                                                    {/* DESCRIPTION */}

                                                    <div className="md:col-span-5">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Item Description
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.description
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updatePurchaseItem(
                                                                    index,
                                                                    'description',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="e.g. Bond paper A4"
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>


                                                    {/* QUANTITY */}

                                                    <div className="md:col-span-2">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Quantity
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updatePurchaseItem(
                                                                    index,
                                                                    'quantity',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>


                                                    {/* UNIT */}

                                                    <div className="md:col-span-2">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Unit
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.unit
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updatePurchaseItem(
                                                                    index,
                                                                    'unit',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="pcs"
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>


                                                    {/* UNIT PRICE */}

                                                    <div className="md:col-span-3">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Estimated Unit Price
                                                        </label>

                                                        <div className="relative">

                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                                ₱
                                                            </span>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    item.estimated_unit_price
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePurchaseItem(
                                                                        index,
                                                                        'estimated_unit_price',
                                                                        event.target.value,
                                                                    )
                                                                }
                                                                placeholder="0.00"
                                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                            />

                                                        </div>

                                                    </div>


                                                    {/* AMOUNT */}

                                                    <div className="md:col-span-12">

                                                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">

                                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                Estimated Amount
                                                            </span>

                                                            <span className="text-sm font-bold text-slate-800">

                                                                ₱
                                                                {money(
                                                                    purchaseItemAmount(
                                                                        item,
                                                                    ),
                                                                )}

                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        ),
                                    )}


                                    <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">

                                                <Calculator className="h-4 w-4" />

                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold text-slate-700">
                                                    Estimated Purchase Total
                                                </p>

                                                <p className="text-[10px] text-slate-400">
                                                    Based on the items above
                                                </p>

                                            </div>

                                        </div>


                                        <span className="text-lg font-bold text-blue-700">
                                            ₱{money(purchaseTotal)}
                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>

                    )}


                    {/* ====================================================== */}
                    {/* REIMBURSEMENT */}
                    {/* ====================================================== */}

                    {isReimbursementRequest && (

                        <div className="border-b border-slate-100 p-6">

                            <div className="mb-5 flex items-start justify-between gap-4">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <Receipt className="h-4 w-4 text-blue-600" />

                                        <h2 className="text-sm font-bold text-slate-900">
                                            Reimbursement Expenses
                                        </h2>

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        List the actual expenses you are requesting for reimbursement.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        addReimbursementItem
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >

                                    <Plus className="h-4 w-4" />

                                    Add Expense

                                </button>

                            </div>


                            {data.reimbursement_items.length === 0 ? (

                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

                                    <Receipt className="mx-auto h-6 w-6 text-slate-300" />

                                    <p className="mt-2 text-xs font-semibold text-slate-600">
                                        No expenses added
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Add each expense that you want reimbursed.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {data.reimbursement_items.map(
                                        (
                                            item,
                                            index,
                                        ) => (

                                            <div
                                                key={index}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >

                                                <div className="mb-4 flex items-center justify-between">

                                                    <p className="text-xs font-semibold text-slate-700">
                                                        Expense #{index + 1}
                                                    </p>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeReimbursementItem(
                                                                index,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
                                                    >

                                                        <Trash2 className="h-3.5 w-3.5" />

                                                        Remove

                                                    </button>

                                                </div>


                                                <div className="grid gap-4 md:grid-cols-12">


                                                    {/* DATE */}

                                                    <div className="md:col-span-3">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Expense Date
                                                        </label>

                                                        <input
                                                            type="date"
                                                            value={
                                                                item.expense_date
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateReimbursementItem(
                                                                    index,
                                                                    'expense_date',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>


                                                    {/* TYPE */}

                                                    <div className="md:col-span-3">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Expense Type
                                                        </label>

                                                        <select
                                                            value={
                                                                item.expense_type
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateReimbursementItem(
                                                                    index,
                                                                    'expense_type',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        >

                                                            <option value="Transportation">
                                                                Transportation
                                                            </option>

                                                            <option value="Meals">
                                                                Meals
                                                            </option>

                                                            <option value="Accommodation">
                                                                Accommodation
                                                            </option>

                                                            <option value="Supplies">
                                                                Supplies
                                                            </option>

                                                            <option value="Registration">
                                                                Registration
                                                            </option>

                                                            <option value="Communication">
                                                                Communication
                                                            </option>

                                                            <option value="Other">
                                                                Other
                                                            </option>

                                                        </select>

                                                    </div>


                                                    {/* AMOUNT */}

                                                    <div className="md:col-span-3">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Amount
                                                        </label>

                                                        <div className="relative">

                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                                ₱
                                                            </span>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    item.amount
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateReimbursementItem(
                                                                        index,
                                                                        'amount',
                                                                        event.target.value,
                                                                    )
                                                                }
                                                                placeholder="0.00"
                                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                            />

                                                        </div>

                                                    </div>


                                                    {/* RECEIPT */}

                                                    <div className="md:col-span-3">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Receipt Reference
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.receipt_reference
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateReimbursementItem(
                                                                    index,
                                                                    'receipt_reference',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="OR / receipt no."
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>


                                                    {/* DESCRIPTION */}

                                                    <div className="md:col-span-12">

                                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                            Description
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.description
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateReimbursementItem(
                                                                    index,
                                                                    'description',
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="Describe the expense"
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                        />

                                                    </div>

                                                </div>

                                            </div>

                                        ),
                                    )}


                                    <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">

                                                <Wallet className="h-4 w-4" />

                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold text-slate-700">
                                                    Total Reimbursement
                                                </p>

                                                <p className="text-[10px] text-slate-400">
                                                    Total amount being claimed
                                                </p>

                                            </div>

                                        </div>


                                        <span className="text-lg font-bold text-blue-700">
                                            ₱{money(reimbursementTotal)}
                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>

                    )}


                    {/* ====================================================== */}
                    {/* TRAVEL */}
                    {/* ====================================================== */}

                    {isTravelRequest && (

                        <div className="border-b border-slate-100 p-6">

                            <div className="mb-5">

                                <div className="flex items-center gap-2">

                                    <Plane className="h-4 w-4 text-blue-600" />

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Travel Details
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    Provide the details and estimated expenses for the official travel.
                                </p>

                            </div>


                            <div className="grid gap-5 md:grid-cols-2">


                                {/* DESTINATION */}

                                <div className="md:col-span-2">

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Destination
                                    </label>

                                    <div className="relative">

                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            value={
                                                data.travel.destination
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'travel',
                                                    {
                                                        ...data.travel,
                                                        destination:
                                                            event.target.value,
                                                    },
                                                )
                                            }
                                            placeholder="City / Municipality / Province"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* PURPOSE */}

                                <div className="md:col-span-2">

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Travel Purpose
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            data.travel.purpose
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'travel',
                                                {
                                                    ...data.travel,
                                                    purpose:
                                                        event.target.value,
                                                },
                                            )
                                        }
                                        placeholder="Purpose of official travel..."
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* DEPARTURE */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Departure Date
                                    </label>

                                    <div className="relative">

                                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            value={
                                                data.travel.departure_date
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'travel',
                                                    {
                                                        ...data.travel,
                                                        departure_date:
                                                            event.target.value,
                                                    },
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* RETURN */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Return Date
                                    </label>

                                    <div className="relative">

                                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            value={
                                                data.travel.return_date
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'travel',
                                                    {
                                                        ...data.travel,
                                                        return_date:
                                                            event.target.value,
                                                    },
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* MODE */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Mode of Travel
                                    </label>

                                    <select
                                        value={
                                            data.travel.mode_of_travel
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'travel',
                                                {
                                                    ...data.travel,
                                                    mode_of_travel:
                                                        event.target.value,
                                                },
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select mode
                                        </option>

                                        <option value="Government Vehicle">
                                            Government Vehicle
                                        </option>

                                        <option value="Private Vehicle">
                                            Private Vehicle
                                        </option>

                                        <option value="Public Transportation">
                                            Public Transportation
                                        </option>

                                        <option value="Air Travel">
                                            Air Travel
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* ACCOMMODATION */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Accommodation
                                    </label>

                                    <div className="relative">

                                        <Hotel className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            value={
                                                data.travel.accommodation
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'travel',
                                                    {
                                                        ...data.travel,
                                                        accommodation:
                                                            event.target.value,
                                                    },
                                                )
                                            }
                                            placeholder="Hotel / lodging"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* ================================================== */}
                            {/* TRAVEL COST */}
                            {/* ================================================== */}

                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

                                <div className="mb-4">

                                    <h3 className="text-xs font-bold text-slate-800">
                                        Estimated Travel Expenses
                                    </h3>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Provide an estimated amount for each expense category.
                                    </p>

                                </div>


                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">


                                    {/* TRANSPORTATION */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Transportation
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.travel.estimated_transportation
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'travel',
                                                        {
                                                            ...data.travel,
                                                            estimated_transportation:
                                                                event.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* ACCOMMODATION */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Accommodation
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.travel.estimated_accommodation
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'travel',
                                                        {
                                                            ...data.travel,
                                                            estimated_accommodation:
                                                                event.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* MEALS */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Meals
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.travel.estimated_meals
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'travel',
                                                        {
                                                            ...data.travel,
                                                            estimated_meals:
                                                                event.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* REGISTRATION */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Registration
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.travel.estimated_registration
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'travel',
                                                        {
                                                            ...data.travel,
                                                            estimated_registration:
                                                                event.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* OTHER */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Other
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.travel.estimated_other
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setData(
                                                        'travel',
                                                        {
                                                            ...data.travel,
                                                            estimated_other:
                                                                event.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* FUNDING */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Funding Source
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                data.travel.funding_source
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'travel',
                                                    {
                                                        ...data.travel,
                                                        funding_source:
                                                            event.target.value,
                                                    },
                                                )
                                            }
                                            placeholder="e.g. General Fund"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* TRAVEL TOTAL */}

                                <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">

                                            <Calculator className="h-4 w-4" />

                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-slate-700">
                                                Estimated Travel Cost
                                            </p>

                                            <p className="text-[10px] text-slate-400">
                                                Total estimated official travel expenses
                                            </p>

                                        </div>

                                    </div>


                                    <span className="text-lg font-bold text-blue-700">
                                        ₱{money(travelTotal)}
                                    </span>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* ====================================================== */}
                    {/* GENERIC COST */}
                    {/* ====================================================== */}

                    {selectedRequestType?.requires_cost &&
                        !isPurchaseRequest &&
                        !isReimbursementRequest &&
                        !isTravelRequest && (

                            <div className="border-b border-slate-100 p-6">

                                <div className="mb-5">

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Estimated Cost
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Provide the estimated amount for this request.
                                    </p>

                                </div>


                                <div className="max-w-sm">

                                    <label
                                        htmlFor="estimated_total_cost"
                                        className="mb-1.5 block text-xs font-semibold text-slate-700"
                                    >
                                        Estimated Total Cost
                                    </label>


                                    <div className="relative">

                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                            ₱
                                        </span>


                                        <input
                                            id="estimated_total_cost"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.estimated_total_cost
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'estimated_total_cost',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>

                        )}


                    {/* ====================================================== */}
                    {/* LOCATION / ASSET */}
                    {/* ====================================================== */}

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
                                        value={
                                            data.location
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'location',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Where is this request related to?"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {errors.location && (

                                    <p className="mt-1.5 text-xs text-red-600">
                                        {
                                            errors.location
                                        }
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
                                        value={
                                            data.asset_id
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'asset_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            No related asset
                                        </option>


                                        {assets.map(
                                            (
                                                asset,
                                            ) => (

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
                                        {
                                            errors.asset_id
                                        }
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ====================================================== */}
                    {/* ATTACHMENTS */}
                    {/* ====================================================== */}

                    {selectedRequestType?.requires_attachment && (

                        <div className="border-b border-slate-100 p-6">

                            <div className="mb-5">

                                <h2 className="text-sm font-bold text-slate-900">
                                    Supporting Documents
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Attach receipts, quotations, documents, or other supporting files.
                                </p>

                            </div>


                            <label
                                htmlFor="attachments"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
                            >

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                                    <Paperclip className="h-5 w-5" />

                                </div>


                                <p className="mt-3 text-xs font-semibold text-slate-700">
                                    Choose supporting files
                                </p>


                                <p className="mt-1 text-[10px] text-slate-400">
                                    PDF, JPG, PNG, DOCX, XLSX
                                </p>


                                <input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={
                                        handleAttachments
                                    }
                                />

                            </label>


                            {data.attachments.length > 0 && (

                                <div className="mt-3 space-y-2">

                                    {data.attachments.map(
                                        (
                                            file,
                                            index,
                                        ) => (

                                            <div
                                                key={index}
                                                className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
                                            >

                                                <FileText className="h-4 w-4 shrink-0 text-blue-600" />

                                                <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                                                    {file.name}
                                                </span>

                                            </div>

                                        ),
                                    )}

                                </div>

                            )}

                        </div>

                    )}


                    {/* ====================================================== */}
                    {/* REMARKS */}
                    {/* ====================================================== */}

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
                                value={
                                    data.remarks
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'remarks',
                                        event.target.value,
                                    )
                                }
                                placeholder="Additional notes..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />


                            {errors.remarks && (

                                <p className="mt-1.5 text-xs text-red-600">
                                    {
                                        errors.remarks
                                    }
                                </p>

                            )}

                        </div>

                    </div>


                    {/* ====================================================== */}
                    {/* FOOTER */}
                    {/* ====================================================== */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2 text-xs text-slate-400">

                            <FileText className="h-4 w-4" />

                            <span>
                                This request will be submitted to your department.
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
                                disabled={
                                    processing
                                }
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