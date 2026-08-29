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
        | BASIC VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
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
            | PURCHASE / REIMBURSEMENT ITEMS
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
            | GENERAL COST
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

            'destination' => [
                'nullable',
                'string',
                'max:255',
            ],

            'travel_start_date' => [
                'nullable',
                'date',
            ],

            'travel_end_date' => [
                'nullable',
                'date',
                'after_or_equal:travel_start_date',
            ],

            'purpose' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'funding_source' => [
                'nullable',
                'string',
                'max:255',
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
        | NORMALIZE REQUEST TYPE
        |--------------------------------------------------------------------------
        */

        $typeCode = strtoupper(
            trim($requestType->code)
        );


        /*
        |--------------------------------------------------------------------------
        | TRANSACTION
        |--------------------------------------------------------------------------
        */

        $serviceRequest = DB::transaction(
            function () use (
                $validated,
                $user,
                $requestType,
                $typeCode
            ) {

                /*
                |--------------------------------------------------------------------------
                | CREATE MAIN REQUEST
                |--------------------------------------------------------------------------
                */

                $serviceRequest = ServiceRequest::create([

                    'request_code' =>
                        $this->generateRequestCode(),

                    'request_type_id' =>
                        $requestType->id,

                    /*
                    |--------------------------------------------------------------------------
                    | KEEP LEGACY FIELD
                    |--------------------------------------------------------------------------
                    */

                    'request_type' =>
                        $requestType->code,

                    'subject' =>
                        $validated['subject'],

                    'description' =>
                        $validated['description'] ?? null,

                    'priority' =>
                        $validated['priority'],

                    'status' =>
                        'pending',

                    'requested_by' =>
                        $user->id,

                    'department_id' =>
                        $user->department_id,

                    'location' =>
                        $validated['location'] ?? null,

                    'asset_id' =>
                        $validated['asset_id'] ?? null,

                    'requested_at' =>
                        now(),

                    'remarks' =>
                        $validated['remarks'] ?? null,
                ]);


                /*
                |--------------------------------------------------------------------------
                | PURCHASE REQUEST
                |--------------------------------------------------------------------------
                */

                if (
                    $typeCode === 'PURCHASE' ||
                    $typeCode === 'PROCUREMENT' ||
                    $typeCode === 'SUPPLIES'
                ) {

                    $items =
                        $validated['items'] ?? [];


                    foreach ($items as $item) {

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
                                ?? 1
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


                        PurchaseRequestItem::create([

                            'service_request_id' =>
                                $serviceRequest->id,

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
                | REIMBURSEMENT
                |--------------------------------------------------------------------------
                */

                if (
                    $typeCode === 'REIMBURSEMENT'
                ) {

                    $items =
                        $validated['items'] ?? [];


                    foreach ($items as $item) {

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


                        /*
                        |--------------------------------------------------------------------------
                        | IMPORTANT
                        |--------------------------------------------------------------------------
                        |
                        | The current React form does not yet send:
                        |
                        | expense_date
                        | expense_type
                        | amount
                        |
                        | so we only create reimbursement rows once those
                        | dedicated fields are added.
                        |
                        */

                        if (
                            !isset(
                                $item['amount']
                            )
                        ) {
                            continue;
                        }


                        ReimbursementItem::create([

                            'service_request_id' =>
                                $serviceRequest->id,

                            'expense_date' =>
                                $item['expense_date']
                                ?? now()->toDateString(),

                            'expense_type' =>
                                $item['expense_type']
                                ?? 'Other',

                            'description' =>
                                $description,

                            'amount' =>
                                (float) $item['amount'],

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
                | TRAVEL
                |--------------------------------------------------------------------------
                */

                if (
                    $typeCode === 'TRAVEL'
                ) {

                    if (
                        !empty(
                            $validated['destination']
                        ) &&
                        !empty(
                            $validated['travel_start_date']
                        ) &&
                        !empty(
                            $validated['travel_end_date']
                        )
                    ) {

                        TravelRequestDetail::create([

                            'service_request_id' =>
                                $serviceRequest->id,

                            'destination' =>
                                $validated['destination'],

                            'purpose' =>
                                $validated['purpose']
                                ?? null,

                            'departure_date' =>
                                $validated['travel_start_date'],

                            'return_date' =>
                                $validated['travel_end_date'],

                            'mode_of_travel' =>
                                null,

                            'accommodation' =>
                                null,

                            'estimated_transportation' =>
                                0,

                            'estimated_accommodation' =>
                                0,

                            'estimated_meals' =>
                                0,

                            'estimated_registration' =>
                                0,

                            'estimated_other' =>
                                0,

                            'estimated_total' =>
                                (float) (
                                    $validated['estimated_total_cost']
                                    ?? 0
                                ),

                            'funding_source' =>
                                $validated['funding_source']
                                ?? null,

                            'remarks' =>
                                $validated['remarks']
                                ?? null,
                        ]);
                    }
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
            'requestedBy.roles:id,name',

            'assignedDepartment:id,name,code',

            'assignedTo:id,name',

            'asset:id,asset_code,name,department_id',

            'reviewedBy:id,name',

            'approvedBy:id,name',

            'completedBy:id,name',
            'purchaseItems',
            'reimbursementItems',
            'travelDetails',

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
        | REVIEW AUTHORIZATION
        |--------------------------------------------------------------------------
        |
        | Normal request:
        | Staff → Supervisor → Head
        |
        | If the requester is already the supervisor:
        | Supervisor → Head
        |
        */

        $isSupervisor =
            $this->userIsSupervisor($user);

        $requesterIsSupervisor =
            $serviceRequest->requestedBy
                ? $this->userIsSupervisor(
                    $serviceRequest->requestedBy
                )
                : false;

        $isHead =
            $this->userIsHead($user);


        /*
        |--------------------------------------------------------------------------
        | NORMAL SUPERVISOR REVIEW
        |--------------------------------------------------------------------------
        */

        $canReviewAsSupervisor =
            $isSupervisor &&
            ! $requesterIsSupervisor;


        /*
        |--------------------------------------------------------------------------
        | HEAD MAY REVIEW SUPERVISOR'S OWN REQUEST
        |--------------------------------------------------------------------------
        */

        $canReviewAsHead =
            $isHead &&
            $requesterIsSupervisor;


        abort_unless(
            $canReviewAsSupervisor ||
            $canReviewAsHead,
            403,
            'You are not authorized to review this request.'
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

        abort_unless(
            $serviceRequest->department_id === $user->department_id,
            403
        );

        abort_unless(
            $this->userIsHead($user),
            403,
            'Only the department head can approve this request.'
        );

        if ($serviceRequest->status !== 'for_head_review') {
            return back()->withErrors([
                'workflow' => 'This request is not waiting for head approval.',
            ]);
        }

        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:5000'],
        ]);

        $serviceRequest->loadMissing('requestType');
        $requestType = $serviceRequest->requestType;

        $typeCode = strtoupper(trim((string) (
            $requestType?->code ?? $serviceRequest->request_type ?? ''
        )));
        $typeName = strtolower(trim((string) ($requestType?->name ?? '')));
        $typeCategory = strtolower(trim((string) ($requestType?->category ?? '')));

        $isMaintenance =
            str_contains($typeCode, 'MAINTENANCE') ||
            str_contains($typeName, 'maintenance') ||
            str_contains($typeCategory, 'maintenance');

        $isPurchase =
            str_contains($typeCode, 'PURCHASE') ||
            str_contains($typeCode, 'PROCUREMENT') ||
            str_contains($typeName, 'purchase') ||
            str_contains($typeName, 'procurement') ||
            str_contains($typeCategory, 'procurement');

        $isReimbursement =
            str_contains($typeCode, 'REIMBURSE') ||
            str_contains($typeName, 'reimburse') ||
            str_contains($typeCategory, 'reimbursement') ||
            str_contains($typeCategory, 'finance');

        $isTravel =
            str_contains($typeCode, 'TRAVEL') ||
            str_contains($typeName, 'travel') ||
            str_contains($typeCategory, 'travel');

        if ($isMaintenance) {
            $nextStatus = 'for_gso_review';
        } elseif ($isPurchase) {
            $nextStatus = 'for_procurement';
        } elseif ($isReimbursement) {
            $nextStatus = 'for_financial_review';
        } elseif ($isTravel) {
            $nextStatus = 'for_travel_authorization';
        } else {
            $nextStatus = 'approved';
        }

        DB::transaction(function () use (
            $serviceRequest,
            $user,
            $validated,
            $nextStatus
        ) {
            $oldStatus = $serviceRequest->status;

            $serviceRequest->update([
                'status' => $nextStatus,
                'approved_by' => $user->id,
                'approved_at' => now(),
                'remarks' => $validated['remarks'] ?? $serviceRequest->remarks,
            ]);

            $serviceRequest->histories()->create([
                'user_id' => $user->id,
                'action' => 'head_approved',
                'from_status' => $oldStatus,
                'to_status' => $nextStatus,
                'remarks' => $validated['remarks'] ?? 'Request approved by department head.',
            ]);
        });

        $message = match ($nextStatus) {
            'for_gso_review' => 'Request approved and forwarded to GSO review.',
            'for_procurement' => 'Purchase request approved and forwarded for procurement.',
            'for_financial_review' => 'Reimbursement approved and forwarded for financial processing.',
            'for_travel_authorization' => 'Travel request approved and forwarded for travel authorization.',
            default => 'Request approved successfully.',
        };

        return back()->with('success', $message);
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

        $serviceRequest->loadMissing('requestType');
        $requestType = $serviceRequest->requestType;

        $typeCode = strtoupper(trim((string) (
            $requestType?->code ?? $serviceRequest->request_type ?? ''
        )));
        $typeName = strtolower(trim((string) ($requestType?->name ?? '')));
        $typeCategory = strtolower(trim((string) ($requestType?->category ?? '')));

        $isMaintenance =
            str_contains($typeCode, 'MAINTENANCE') ||
            str_contains($typeName, 'maintenance') ||
            str_contains($typeCategory, 'maintenance');

        abort_unless(
            $isMaintenance,
            403,
            'This request type does not use the maintenance work workflow.'
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
    | REIMBURSEMENT - FINANCIAL REVIEW
    |--------------------------------------------------------------------------
    */

    public function financialApprove(
        Request $request,
        ServiceRequest $serviceRequest
    ) {
        $user = $request->user()->load(['department', 'roles']);

        abort_unless(
            $serviceRequest->department_id === $user->department_id,
            403
        );

        $isAccounting = $user->roles->contains(function ($role) {
            return strtolower(trim($role->name)) === 'accounting_officer';
        });

        abort_unless(
            $isAccounting,
            403,
            'Only the Accounting Officer can process this reimbursement.'
        );

        abort_unless(
            $serviceRequest->status === 'for_financial_review',
            422,
            'This reimbursement is not waiting for financial review.'
        );

        $validated = $request->validate([
            'accounting_reference_no' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($serviceRequest, $user, $validated) {
            $oldStatus = $serviceRequest->status;

            $serviceRequest->update([
                'status' => 'for_disbursement',
                'accounting_reviewed_by' => $user->id,
                'accounting_reviewed_at' => now(),
                'accounting_reference_no' => $validated['accounting_reference_no'] ?? null,
                'accounting_remarks' => $validated['remarks'] ?? null,
            ]);

            $serviceRequest->histories()->create([
                'user_id' => $user->id,
                'action' => 'financial_reviewed',
                'from_status' => $oldStatus,
                'to_status' => 'for_disbursement',
                'remarks' => $validated['remarks'] ?? 'Financial review completed. Request sent for disbursement.',
            ]);
        });

        return back()->with('success', 'Financial review completed. Request sent for disbursement.');
    }


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT - MARK REIMBURSED
    |--------------------------------------------------------------------------
    */

    public function markReimbursed(
        Request $request,
        ServiceRequest $serviceRequest
    ) {
        $user = $request->user()->load(['department', 'roles']);

        abort_unless(
            $serviceRequest->department_id === $user->department_id,
            403
        );

        $isAuthorized = $user->roles->contains(function ($role) {
            return in_array(
                strtolower(trim($role->name)),
                ['accounting_officer', 'system_admin'],
                true
            );
        });

        abort_unless(
            $isAuthorized,
            403,
            'You are not authorized to process this reimbursement.'
        );

        abort_unless(
            $serviceRequest->status === 'for_disbursement',
            422,
            'This reimbursement is not ready for disbursement.'
        );

        DB::transaction(function () use ($serviceRequest, $user) {
            $oldStatus = $serviceRequest->status;

            $serviceRequest->update([
                'status' => 'reimbursed',
                'completed_by' => $user->id,
                'completed_at' => now(),
            ]);

            $serviceRequest->histories()->create([
                'user_id' => $user->id,
                'action' => 'reimbursed',
                'from_status' => $oldStatus,
                'to_status' => 'reimbursed',
                'remarks' => 'Reimbursement paid.',
            ]);
        });

        return back()->with('success', 'Reimbursement marked as paid.');
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
                            'maintenance_supervisor',
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