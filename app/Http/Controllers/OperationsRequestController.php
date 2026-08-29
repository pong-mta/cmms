<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\RequestType;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\PurchaseRequestItem;
use App\Models\ReimbursementItem;
use App\Models\TravelRequestDetail;

class OperationsRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    |
    | Display requests belonging to the authenticated user's department.
    |
    */

    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'department',
            'roles',
        ]);

        $departmentId = $user->department_id;


        /*
        |--------------------------------------------------------------------------
        | FILTERS
        |--------------------------------------------------------------------------
        */

        $search = $request
            ->string('search')
            ->trim()
            ->toString();

        $status = $request
            ->string('status')
            ->trim()
            ->toString();

        $priority = $request
            ->string('priority')
            ->trim()
            ->toString();

        $requestType = $request
            ->string('request_type')
            ->trim()
            ->toString();


        /*
        |--------------------------------------------------------------------------
        | REQUEST QUERY
        |--------------------------------------------------------------------------
        */

        $query = ServiceRequest::query()
            ->with([
                'department:id,name,code',

                'requestedBy:id,name,department_id',

                'assignedDepartment:id,name,code',

                'assignedTo:id,name',

                'asset:id,asset_code,name',
            ])
            ->when(
                $departmentId,
                function ($query) use ($departmentId) {

                    $query->where(
                        'department_id',
                        $departmentId
                    );
                }
            )
            ->when(
                $search !== '',
                function ($query) use ($search) {

                    $query->where(function ($query) use ($search) {

                        $query
                            ->where(
                                'request_code',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'subject',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'description',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->when(
                $status !== '',
                function ($query) use ($status) {

                    $query->where(
                        'status',
                        $status
                    );
                }
            )
            ->when(
                $priority !== '',
                function ($query) use ($priority) {

                    $query->where(
                        'priority',
                        $priority
                    );
                }
            )
            ->when(
                $requestType !== '',
                function ($query) use ($requestType) {

                    $query->where(
                        'request_type',
                        $requestType
                    );
                }
            );


        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $requests = $query
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();


        /*
        |--------------------------------------------------------------------------
        | COUNTS
        |--------------------------------------------------------------------------
        */

        $baseQuery = ServiceRequest::query()
            ->when(
                $departmentId,
                function ($query) use ($departmentId) {

                    $query->where(
                        'department_id',
                        $departmentId
                    );
                }
            );


        $counts = [

            'all' =>
                (clone $baseQuery)->count(),

            'my' =>
                (clone $baseQuery)
                    ->where(
                        'requested_by',
                        $user->id
                    )
                    ->count(),

            'pending' =>
                (clone $baseQuery)
                    ->whereIn(
                        'status',
                        [
                            'pending',
                            'for_head_review',
                            'for_budget_review',
                            'for_gso_review',
                            'for_accounting_review',
                            'for_mayor_review',
                        ]
                    )
                    ->count(),

            'in_progress' =>
                (clone $baseQuery)
                    ->whereIn(
                        'status',
                        [
                            'approved',
                            'assigned',
                            'in_progress',
                        ]
                    )
                    ->count(),

            'completed' =>
                (clone $baseQuery)
                    ->where(
                        'status',
                        'completed'
                    )
                    ->count(),

            'archived' =>
                (clone $baseQuery)
                    ->where(
                        'status',
                        'archived'
                    )
                    ->count(),
        ];


        /*
        |--------------------------------------------------------------------------
        | REQUEST TYPES
        |--------------------------------------------------------------------------
        |
        | These are now coming from request_types instead of being extracted
        | from existing service_requests.
        |
        */

        $requestTypes = RequestType::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'code',
                'name',
                'category',
                'description',
                'icon',
                'workflow',
                'requires_items',
                'requires_cost',
                'requires_attachment',
                'active',
                'sort_order',
            ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENTS
        |--------------------------------------------------------------------------
        */

        $departments = Department::query()
            ->where(
                'status',
                true
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);


        /*
        |--------------------------------------------------------------------------
        | ASSETS
        |--------------------------------------------------------------------------
        |
        | Only assets belonging to the user's department.
        |
        */

        $assets = Asset::query()
            ->where(
                'department_id',
                $departmentId
            )
            ->orderBy('name')
            ->get([
                'id',
                'asset_code',
                'name',
            ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/requests/index',
            [

                'requests' =>
                    $requests,

                'counts' =>
                    $counts,

                'requestTypes' =>
                    $requestTypes,

                'departments' =>
                    $departments,

                'assets' =>
                    $assets,

                'filters' => [

                    'search' =>
                        $search,

                    'status' =>
                        $status,

                    'priority' =>
                        $priority,

                    'request_type' =>
                        $requestType,
                ],

                'user' =>
                    $user,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    |
    | Display the request creation form.
    |
    */

    public function create(Request $request): Response
    {
        $user = $request->user()->load([
            'department',
            'roles',
        ]);

        $departmentId =
            $user->department_id;


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT ASSETS
        |--------------------------------------------------------------------------
        */

        $assets = Asset::query()
            ->where(
                'department_id',
                $departmentId
            )
            ->orderBy('name')
            ->get([
                'id',
                'asset_code',
                'name',
            ]);


        /*
        |--------------------------------------------------------------------------
        | REQUEST TYPES
        |--------------------------------------------------------------------------
        */

        $requestTypes = RequestType::query()
            ->where('active', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'code',
                'name',
                'category',
                'description',
                'icon',
                'workflow',
                'requires_items',
                'requires_cost',
                'requires_attachment',
                'active',
                'sort_order',
            ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN CREATE PAGE
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/requests/create',
            [

                'user' =>
                    $user,

                'assets' =>
                    $assets,

                'requestTypes' =>
                    $requestTypes,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    |
    | Store a new service request.
    |
    */

   public function store(Request $request)
{
    $user = $request->user();

    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT SECURITY
    |--------------------------------------------------------------------------
    */

    if (!$user->department_id) {
        return back()
            ->withErrors([
                'department' =>
                    'Your account is not assigned to a department.',
            ])
            ->withInput();
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([

        /*
        |--------------------------------------------------------------------------
        | MAIN REQUEST
        |--------------------------------------------------------------------------
        */

        'request_type_id' => [
            'required',
            'integer',
            'exists:request_types,id',
        ],

        'subject' => [
            'required',
            'string',
            'max:255',
        ],

        'description' => [
            'nullable',
            'string',
        ],

        'priority' => [
            'required',
            'in:low,normal,high,critical',
        ],

        'location' => [
            'nullable',
            'string',
            'max:255',
        ],

        'asset_id' => [
            'nullable',
            'integer',
            'exists:assets,id',
        ],

        'remarks' => [
            'nullable',
            'string',
            'max:5000',
        ],


        /*
        |--------------------------------------------------------------------------
        | PURCHASE ITEMS
        |--------------------------------------------------------------------------
        */

        'items' => [
            'nullable',
            'array',
        ],

        'items.*.description' => [
            'nullable',
            'string',
            'max:255',
        ],

        'items.*.quantity' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'items.*.unit' => [
            'nullable',
            'string',
            'max:50',
        ],

        'items.*.estimated_unit_price' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'items.*.remarks' => [
            'nullable',
            'string',
            'max:1000',
        ],


        /*
        |--------------------------------------------------------------------------
        | REIMBURSEMENT ITEMS
        |--------------------------------------------------------------------------
        */

        'reimbursement_items' => [
            'nullable',
            'array',
        ],

        'reimbursement_items.*.expense_date' => [
            'nullable',
            'date',
        ],

        'reimbursement_items.*.expense_type' => [
            'nullable',
            'string',
            'max:100',
        ],

        'reimbursement_items.*.description' => [
            'nullable',
            'string',
            'max:255',
        ],

        'reimbursement_items.*.amount' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'reimbursement_items.*.receipt_reference' => [
            'nullable',
            'string',
            'max:255',
        ],

        'reimbursement_items.*.remarks' => [
            'nullable',
            'string',
            'max:1000',
        ],


        /*
        |--------------------------------------------------------------------------
        | GENERIC COST
        |--------------------------------------------------------------------------
        */

        'estimated_total_cost' => [
            'nullable',
            'numeric',
            'min:0',
        ],


        /*
        |--------------------------------------------------------------------------
        | TRAVEL
        |--------------------------------------------------------------------------
        */

        'travel' => [
            'nullable',
            'array',
        ],

        'travel.destination' => [
            'nullable',
            'string',
            'max:255',
        ],

        'travel.purpose' => [
            'nullable',
            'string',
            'max:5000',
        ],

        'travel.departure_date' => [
            'nullable',
            'date',
        ],

        'travel.return_date' => [
            'nullable',
            'date',
            'after_or_equal:travel.departure_date',
        ],

        'travel.mode_of_travel' => [
            'nullable',
            'string',
            'max:255',
        ],

        'travel.accommodation' => [
            'nullable',
            'string',
            'max:255',
        ],

        'travel.estimated_transportation' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'travel.estimated_accommodation' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'travel.estimated_meals' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'travel.estimated_registration' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'travel.estimated_other' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'travel.funding_source' => [
            'nullable',
            'string',
            'max:255',
        ],

        'travel.remarks' => [
            'nullable',
            'string',
            'max:5000',
        ],
    ]);


    /*
    |--------------------------------------------------------------------------
    | REQUEST TYPE
    |--------------------------------------------------------------------------
    */

    $requestType = RequestType::query()
        ->where('id', $validated['request_type_id'])
        ->where('active', true)
        ->first();


    if (!$requestType) {
        return back()
            ->withErrors([
                'request_type_id' =>
                    'The selected request type is not available.',
            ])
            ->withInput();
    }


    /*
    |--------------------------------------------------------------------------
    | REQUEST TYPE CODE
    |--------------------------------------------------------------------------
    */

    $typeCode = strtoupper(
        trim($requestType->code)
    );


    $typeName = strtolower(
        trim($requestType->name)
    );


    $typeCategory = strtolower(
        trim($requestType->category)
    );


    /*
    |--------------------------------------------------------------------------
    | DETERMINE SPECIALIZED TYPE
    |--------------------------------------------------------------------------
    */

    $isPurchase =
        str_contains($typeCode, 'PURCHASE') ||
        str_contains($typeCode, 'PROCUREMENT') ||
        str_contains($typeCode, 'SUPPLIES') ||
        str_contains($typeName, 'purchase') ||
        str_contains($typeName, 'procurement') ||
        str_contains($typeName, 'supplies');


    $isReimbursement =
        str_contains($typeCode, 'REIMBURSE') ||
        str_contains($typeName, 'reimburse');


    $isTravel =
        $typeCategory === 'travel' ||
        str_contains($typeCode, 'TRAVEL') ||
        str_contains($typeName, 'travel');


    /*
    |--------------------------------------------------------------------------
    | ASSET SECURITY
    |--------------------------------------------------------------------------
    */

    if (!empty($validated['asset_id'])) {

        $assetBelongsToDepartment =
            Asset::query()
                ->where(
                    'id',
                    $validated['asset_id']
                )
                ->where(
                    'department_id',
                    $user->department_id
                )
                ->exists();


        if (!$assetBelongsToDepartment) {
            return back()
                ->withErrors([
                    'asset_id' =>
                        'The selected asset does not belong to your department.',
                ])
                ->withInput();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PURCHASE TOTAL
    |--------------------------------------------------------------------------
    */

    $purchaseTotal = 0;


    if ($isPurchase) {

        foreach (
            $validated['items'] ?? []
            as $item
        ) {

            $description =
                trim(
                    (string) (
                        $item['description']
                        ?? ''
                    )
                );


            if ($description === '') {
                continue;
            }


            $quantity =
                (float) (
                    $item['quantity']
                    ?? 0
                );


            $unitPrice =
                (float) (
                    $item['estimated_unit_price']
                    ?? 0
                );


            $purchaseTotal +=
                $quantity *
                $unitPrice;
        }


        $purchaseTotal =
            round(
                $purchaseTotal,
                2
            );
    }


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT TOTAL
    |--------------------------------------------------------------------------
    */

    $reimbursementTotal = 0;


    if ($isReimbursement) {

        foreach (
            $validated['reimbursement_items'] ?? []
            as $item
        ) {

            $description =
                trim(
                    (string) (
                        $item['description']
                        ?? ''
                    )
                );


            if ($description === '') {
                continue;
            }


            $amount =
                (float) (
                    $item['amount']
                    ?? 0
                );


            $reimbursementTotal +=
                $amount;
        }


        $reimbursementTotal =
            round(
                $reimbursementTotal,
                2
            );
    }


    /*
    |--------------------------------------------------------------------------
    | TRAVEL TOTAL
    |--------------------------------------------------------------------------
    */

    $travelTotal = 0;


    if ($isTravel) {

        $travel =
            $validated['travel'] ?? [];


        $travelTotal =
            (
                (float) (
                    $travel['estimated_transportation']
                    ?? 0
                )
            ) +
            (
                (float) (
                    $travel['estimated_accommodation']
                    ?? 0
                )
            ) +
            (
                (float) (
                    $travel['estimated_meals']
                    ?? 0
                )
            ) +
            (
                (float) (
                    $travel['estimated_registration']
                    ?? 0
                )
            ) +
            (
                (float) (
                    $travel['estimated_other']
                    ?? 0
                )
            );


        $travelTotal =
            round(
                $travelTotal,
                2
            );
    }


    /*
    |--------------------------------------------------------------------------
    | DETERMINE TOTAL COST
    |--------------------------------------------------------------------------
    */

    $estimatedTotalCost = null;


    if ($isPurchase) {

        $estimatedTotalCost =
            $purchaseTotal;

    } elseif ($isReimbursement) {

        $estimatedTotalCost =
            $reimbursementTotal;

    } elseif ($isTravel) {

        $estimatedTotalCost =
            $travelTotal;

    } elseif (
        isset(
            $validated['estimated_total_cost']
        )
    ) {

        $estimatedTotalCost =
            round(
                (float)
                $validated['estimated_total_cost'],
                2
            );
    }


    /*
    |--------------------------------------------------------------------------
    | DATABASE TRANSACTION
    |--------------------------------------------------------------------------
    */

    $serviceRequest = DB::transaction(
        function () use (
            $validated,
            $user,
            $requestType,
            $isPurchase,
            $isReimbursement,
            $isTravel,
            $estimatedTotalCost
        ) {

            /*
            |--------------------------------------------------------------------------
            | MAIN SERVICE REQUEST
            |--------------------------------------------------------------------------
            */

            $serviceRequest =
                ServiceRequest::create([

                    'request_code' =>
                        $this->generateRequestCode(),

                    'request_type_id' =>
                        $requestType->id,

                    /*
                    |--------------------------------------------------------------------------
                    | KEEP LEGACY REQUEST TYPE
                    |--------------------------------------------------------------------------
                    */

                    'request_type' =>
                        $requestType->code,

                    'subject' =>
                        $validated['subject'],

                    'description' =>
                        $validated['description']
                        ?? null,

                    'priority' =>
                        $validated['priority'],

                    'status' =>
                        'pending',

                    'requested_by' =>
                        $user->id,

                    'department_id' =>
                        $user->department_id,

                    'location' =>
                        $validated['location']
                        ?? null,

                    'asset_id' =>
                        $validated['asset_id']
                        ?? null,

                    'requested_at' =>
                        now(),

                    'remarks' =>
                        $validated['remarks']
                        ?? null,
                ]);


            /*
            |--------------------------------------------------------------------------
            | PURCHASE ITEMS
            |--------------------------------------------------------------------------
            */

            if ($isPurchase) {

                foreach (
                    $validated['items'] ?? []
                    as $item
                ) {

                    $description =
                        trim(
                            (string) (
                                $item['description']
                                ?? ''
                            )
                        );


                    if ($description === '') {
                        continue;
                    }


                    $quantity =
                        (float) (
                            $item['quantity']
                            ?? 0
                        );


                    $unitPrice =
                        (float) (
                            $item['estimated_unit_price']
                            ?? 0
                        );


                    $amount =
                        round(
                            $quantity *
                            $unitPrice,
                            2
                        );


                    $serviceRequest
                        ->purchaseItems()
                        ->create([

                            'description' =>
                                $description,

                            'quantity' =>
                                $quantity,

                            'unit' =>
                                $item['unit']
                                ?? null,

                            'estimated_unit_price' =>
                                $unitPrice,

                            'estimated_amount' =>
                                $amount,

                            'remarks' =>
                                $item['remarks']
                                ?? null,
                        ]);
                }
            }


            /*
            |--------------------------------------------------------------------------
            | REIMBURSEMENT ITEMS
            |--------------------------------------------------------------------------
            */

            if ($isReimbursement) {

                foreach (
                    $validated['reimbursement_items'] ?? []
                    as $item
                ) {

                    $description =
                        trim(
                            (string) (
                                $item['description']
                                ?? ''
                            )
                        );


                    if ($description === '') {
                        continue;
                    }


                    $amount =
                        round(
                            (float) (
                                $item['amount']
                                ?? 0
                            ),
                            2
                        );


                    $serviceRequest
                        ->reimbursementItems()
                        ->create([

                            'expense_date' =>
                                $item['expense_date']
                                ?? now()->toDateString(),

                            'expense_type' =>
                                $item['expense_type']
                                ?? 'Other',

                            'description' =>
                                $description,

                            'amount' =>
                                $amount,

                            'receipt_reference' =>
                                $item['receipt_reference']
                                ?? null,

                            'remarks' =>
                                $item['remarks']
                                ?? null,
                        ]);
                }
            }


            /*
            |--------------------------------------------------------------------------
            | TRAVEL DETAILS
            |--------------------------------------------------------------------------
            */

            if ($isTravel) {

                $travel =
                    $validated['travel']
                    ?? [];


                $serviceRequest
                    ->travelDetails()
                    ->create([

                        'destination' =>
                            $travel['destination']
                            ?? null,

                        'purpose' =>
                            $travel['purpose']
                            ?? null,

                        'departure_date' =>
                            $travel['departure_date']
                            ?? null,

                        'return_date' =>
                            $travel['return_date']
                            ?? null,

                        'mode_of_travel' =>
                            $travel['mode_of_travel']
                            ?? null,

                        'accommodation' =>
                            $travel['accommodation']
                            ?? null,

                        'estimated_transportation' =>
                            (float) (
                                $travel[
                                    'estimated_transportation'
                                ] ?? 0
                            ),

                        'estimated_accommodation' =>
                            (float) (
                                $travel[
                                    'estimated_accommodation'
                                ] ?? 0
                            ),

                        'estimated_meals' =>
                            (float) (
                                $travel[
                                    'estimated_meals'
                                ] ?? 0
                            ),

                        'estimated_registration' =>
                            (float) (
                                $travel[
                                    'estimated_registration'
                                ] ?? 0
                            ),

                        'estimated_other' =>
                            (float) (
                                $travel[
                                    'estimated_other'
                                ] ?? 0
                            ),

                        'estimated_total' =>
                            $estimatedTotalCost ?? 0,

                        'funding_source' =>
                            $travel['funding_source']
                            ?? null,

                        'remarks' =>
                            $travel['remarks']
                            ?? null,
                    ]);
            }


            /*
            |--------------------------------------------------------------------------
            | HISTORY
            |--------------------------------------------------------------------------
            */

            $serviceRequest
                ->histories()
                ->create([

                    'user_id' =>
                        $user->id,

                    'action' =>
                        'created',

                    'from_status' =>
                        null,

                    'to_status' =>
                        'pending',

                    'remarks' =>
                        'Request created.',
                ]);


            return $serviceRequest;
        }
    );


    /*
    |--------------------------------------------------------------------------
    | REDIRECT
    |--------------------------------------------------------------------------
    */

    return redirect()
        ->route(
            'operations.requests.show',
            $serviceRequest
        )
        ->with(
            'success',
            'Request submitted successfully.'
        );
}

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    |
    | Display a single request.
    |
    */

    public function show(
        Request $request,
        ServiceRequest $serviceRequest
    ): Response {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | REQUEST DATA
        |--------------------------------------------------------------------------
        */

        $serviceRequest->load([

            'requestType:id,code,name,category,description,workflow',

            'department:id,name,code',

            'requestedBy:id,name,phone,department_id',

            'assignedDepartment:id,name,code',

            'assignedTo:id,name',

            'asset:id,asset_code,name,department_id',

            'reviewedBy:id,name',

            'approvedBy:id,name',

            'completedBy:id,name',

            'histories' => function ($query) {

                $query
                    ->with([
                        'user:id,name',
                    ])
                    ->latest();
            },

            'attachments' => function ($query) {

                $query
                    ->with([
                        'uploadedBy:id,name',
                    ])
                    ->latest();
            },
        ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/requests/show',
            [

                'request' =>
                    $serviceRequest,

                'user' =>
                    $user,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GENERATE REQUEST CODE
    |--------------------------------------------------------------------------
    */

    protected function generateRequestCode(): string
    {
        do {

            $code =
                'REQ-' .
                now()->format('Y') .
                '-' .
                strtoupper(
                    Str::random(6)
                );

        } while (
            ServiceRequest::query()
                ->where(
                    'request_code',
                    $code
                )
                ->exists()
        );


        return $code;
    }


    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR REVIEW
    |--------------------------------------------------------------------------
    |
    | PENDING
    |     ↓
    | FOR HEAD REVIEW
    |
    */

    public function review(
        Request $request,
        ServiceRequest $serviceRequest
    ) {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $this->userIsSupervisor($user),
            403,
            'Only a department supervisor can review this request.'
        );


        /*
        |--------------------------------------------------------------------------
        | STATUS SECURITY
        |--------------------------------------------------------------------------
        */

        if (
            $serviceRequest->status !==
            'pending'
        ) {

            return back()
                ->withErrors([
                    'workflow' =>
                        'This request is no longer waiting for supervisor review.',
                ]);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $serviceRequest,
                $user,
                $validated
            ) {

                $oldStatus =
                    $serviceRequest->status;


                $serviceRequest->update([

                    'status' =>
                        'for_head_review',

                    'reviewed_by' =>
                        $user->id,

                    'reviewed_at' =>
                        now(),

                    'remarks' =>
                        $validated['remarks']
                            ?? $serviceRequest->remarks,
                ]);


                $serviceRequest
                    ->histories()
                    ->create([

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'supervisor_reviewed',

                        'from_status' =>
                            $oldStatus,

                        'to_status' =>
                            'for_head_review',

                        'remarks' =>
                            $validated['remarks']
                                ??
                                'Request reviewed by supervisor.',
                    ]);
            }
        );


        return back()
            ->with(
                'success',
                'Request reviewed and forwarded to the department head.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | HEAD APPROVAL
    |--------------------------------------------------------------------------
    |
    | FOR HEAD REVIEW
    |       ↓
    | APPROVED
    |
    */

    public function approve(
        Request $request,
        ServiceRequest $serviceRequest
    ) {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $this->userIsHead($user),
            403,
            'Only the department head can approve this request.'
        );


        /*
        |--------------------------------------------------------------------------
        | STATUS SECURITY
        |--------------------------------------------------------------------------
        */

        if (
            $serviceRequest->status !==
            'for_head_review'
        ) {

            return back()
                ->withErrors([
                    'workflow' =>
                        'This request is not waiting for head approval.',
                ]);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $serviceRequest,
                $user,
                $validated
            ) {

                $oldStatus =
                    $serviceRequest->status;


                $serviceRequest->update([

                    'status' =>
                        'approved',

                    'approved_by' =>
                        $user->id,

                    'approved_at' =>
                        now(),

                    'remarks' =>
                        $validated['remarks']
                            ?? $serviceRequest->remarks,
                ]);


                $serviceRequest
                    ->histories()
                    ->create([

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'head_approved',

                        'from_status' =>
                            $oldStatus,

                        'to_status' =>
                            'approved',

                        'remarks' =>
                            $validated['remarks']
                                ??
                                'Request approved by department head.',
                    ]);
            }
        );


        return back()
            ->with(
                'success',
                'Request approved successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    |
    | Supervisor:
    | PENDING → REJECTED
    |
    | Head:
    | FOR HEAD REVIEW → REJECTED
    |
    */

    public function reject(
        Request $request,
        ServiceRequest $serviceRequest
    ) {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);


        $isSupervisor =
            $this->userIsSupervisor($user);

        $isHead =
            $this->userIsHead($user);


        /*
        |--------------------------------------------------------------------------
        | DETERMINE PERMITTED STATUS
        |--------------------------------------------------------------------------
        */

        $allowed = false;


        if (
            $isSupervisor &&
            $serviceRequest->status ===
                'pending'
        ) {

            $allowed = true;
        }


        if (
            $isHead &&
            $serviceRequest->status ===
                'for_head_review'
        ) {

            $allowed = true;
        }


        abort_unless(
            $allowed,
            403,
            'You are not authorized to reject this request.'
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $serviceRequest,
                $user,
                $validated
            ) {

                $oldStatus =
                    $serviceRequest->status;


                $serviceRequest->update([

                    'status' =>
                        'rejected',

                    'remarks' =>
                        $validated['remarks'],
                ]);


                $serviceRequest
                    ->histories()
                    ->create([

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'rejected',

                        'from_status' =>
                            $oldStatus,

                        'to_status' =>
                            'rejected',

                        'remarks' =>
                            $validated['remarks'],
                    ]);
            }
        );


        return back()
            ->with(
                'success',
                'Request rejected.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | START REQUEST
    |--------------------------------------------------------------------------
    |
    | APPROVED
    |    ↓
    | IN PROGRESS
    |
    */

    public function start(
        Request $request,
        ServiceRequest $serviceRequest
    ) {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $this->userIsSupervisor($user) ||
            $this->userIsHead($user),
            403,
            'You are not authorized to start this request.'
        );


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            !in_array(
                $serviceRequest->status,
                [
                    'approved',
                    'assigned',
                ],
                true
            )
        ) {

            return back()
                ->withErrors([
                    'workflow' =>
                        'This request cannot be started from its current status.',
                ]);
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $serviceRequest,
                $user
            ) {

                $oldStatus =
                    $serviceRequest->status;


                $serviceRequest->update([

                    'status' =>
                        'in_progress',

                    'assigned_to' =>
                        $serviceRequest->assigned_to
                            ??
                            $user->id,

                    'assigned_at' =>
                        $serviceRequest->assigned_at
                            ??
                            now(),
                ]);


                $serviceRequest
                    ->histories()
                    ->create([

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'started',

                        'from_status' =>
                            $oldStatus,

                        'to_status' =>
                            'in_progress',

                        'remarks' =>
                            'Request work started.',
                    ]);
            }
        );


        return back()
            ->with(
                'success',
                'Request is now in progress.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETE REQUEST
    |--------------------------------------------------------------------------
    |
    | IN PROGRESS
    |      ↓
    | COMPLETED
    |
    */

    public function complete(
        Request $request,
        ServiceRequest $serviceRequest
    ) {

        $user = $request->user()->load([
            'department',
            'roles',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $serviceRequest->department_id ===
                $user->department_id,
            403
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE SECURITY
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $this->userIsSupervisor($user) ||
            $this->userIsHead($user),
            403,
            'You are not authorized to complete this request.'
        );


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $serviceRequest->status !==
            'in_progress'
        ) {

            return back()
                ->withErrors([
                    'workflow' =>
                        'Only requests currently in progress can be completed.',
                ]);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $serviceRequest,
                $user,
                $validated
            ) {

                $oldStatus =
                    $serviceRequest->status;


                $serviceRequest->update([

                    'status' =>
                        'completed',

                    'completed_by' =>
                        $user->id,

                    'completed_at' =>
                        now(),

                    'remarks' =>
                        $validated['remarks']
                            ??
                            $serviceRequest->remarks,
                ]);


                $serviceRequest
                    ->histories()
                    ->create([

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'completed',

                        'from_status' =>
                            $oldStatus,

                        'to_status' =>
                            'completed',

                        'remarks' =>
                            $validated['remarks']
                                ??
                                'Request completed.',
                    ]);
            }
        );


        return back()
            ->with(
                'success',
                'Request marked as completed.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | ROLE: SUPERVISOR
    |--------------------------------------------------------------------------
    */

    protected function userIsSupervisor($user): bool
    {
        return $user->roles
            ->contains(
                function ($role) {

                    $name = strtolower(
                        trim($role->name)
                    );

                    $name = str_replace(
                        ['-', ' '],
                        '_',
                        $name
                    );

                    return in_array(
                        $name,
                        [
                            'supervisor',
                            'department_supervisor',
                        ],
                        true
                    );
                }
            );
    }


    /*
    |--------------------------------------------------------------------------
    | ROLE: HEAD
    |--------------------------------------------------------------------------
    */

    protected function userIsHead($user): bool
    {
        return $user->roles
            ->contains(
                function ($role) {

                    $name = strtolower(
                        trim($role->name)
                    );

                    $name = str_replace(
                        ['-', ' '],
                        '_',
                        $name
                    );

                    return in_array(
                        $name,
                        [
                            'head',
                            'department_head',
                            'office_head',
                        ],
                        true
                    );
                }
            );
    }
}