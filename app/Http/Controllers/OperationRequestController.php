<?php

namespace App\Http\Controllers;

use App\Models\OperationRequest;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OperationRequestController extends Controller
{
    /**
     * Display requests visible to the authenticated user.
     *
     * A normal user can see:
     *
     * 1. Requests they personally submitted.
     *
     * 2. Requests whose CURRENT workflow step is assigned
     *    to their department and role.
     *
     * A system administrator can see everything.
     */
    public function index(Request $request): Response
{
    $user = $request->user();

    if (!$user) {
        abort(403);
    }

    /*
    |--------------------------------------------------------------------------
    | USER ROLES
    |--------------------------------------------------------------------------
    */

    $userRoleIds = $user->roles()
        ->pluck('roles.id')
        ->toArray();

    /*
    |--------------------------------------------------------------------------
    | SYSTEM ADMIN
    |--------------------------------------------------------------------------
    */

    $isSystemAdmin = $user->roles()
        ->where('name', 'system_admin')
        ->exists();

    /*
    |--------------------------------------------------------------------------
    | BASE QUERY
    |--------------------------------------------------------------------------
    */

    $query = OperationRequest::query()
        ->with([
            'user',
            'department',
            'purchaseRequest',
            'workflow',
            'currentWorkflowStep',
        ]);

    /*
    |--------------------------------------------------------------------------
    | REQUEST VISIBILITY
    |--------------------------------------------------------------------------
    |
    | System administrators can see everything.
    |
    | Other users can see:
    |
    | A. Requests they submitted.
    |
    | B. Requests currently assigned to them through
    |    the current workflow step.
    |
    | IMPORTANT:
    |
    | Draft / Returned requests must NOT appear in the
    | workflow department's queue.
    |
    | Rejected requests must NOT appear in the
    | workflow department's queue.
    |
    */

    if (!$isSystemAdmin) {

        $query->where(function ($query) use (
            $user,
            $userRoleIds
        ) {

            /*
            |--------------------------------------------------------------------------
            | A. REQUESTS SUBMITTED BY THE USER
            |--------------------------------------------------------------------------
            |
            | The requester can always see their own request,
            | including Draft, Returned, Pending, Approved,
            | Rejected, and Completed requests.
            |
            */

            $query->where(
                'operation_requests.user_id',
                $user->id
            );

            /*
            |--------------------------------------------------------------------------
            | B. REQUESTS CURRENTLY ASSIGNED TO THE USER
            |--------------------------------------------------------------------------
            |
            | Only active workflow requests can appear here.
            |
            | Draft / Returned:
            |     NOT visible to workflow departments.
            |
            | Rejected:
            |     NOT visible to workflow departments.
            |
            */

            $query->orWhere(function ($query) use (
                $user,
                $userRoleIds
            ) {

                /*
                |--------------------------------------------------------------------------
                | ONLY ACTIVE WORKFLOW REQUESTS
                |--------------------------------------------------------------------------
                */

                $query->whereIn(
                    'operation_requests.status',
                    [
                        'pending',
                        'approved',
                        'completed',
                    ]
                );

                /*
                |--------------------------------------------------------------------------
                | REQUEST MUST HAVE A CURRENT WORKFLOW STEP
                |--------------------------------------------------------------------------
                */

                $query->whereNotNull(
                    'operation_requests.current_workflow_step_id'
                );

                /*
                |--------------------------------------------------------------------------
                | CURRENT WORKFLOW STEP
                |--------------------------------------------------------------------------
                */

                $query->whereHas(
                    'currentWorkflowStep',
                    function ($stepQuery) use (
                        $user,
                        $userRoleIds
                    ) {

                        /*
                        |--------------------------------------------------------------------------
                        | REQUESTING DEPARTMENT
                        |--------------------------------------------------------------------------
                        |
                        | Example:
                        |
                        | Engineering Supervisor
                        |          ↓
                        | Engineering Department Head
                        |
                        | Only users in the requesting department
                        | with the required role can see this step.
                        |
                        */

                        $stepQuery->where(function (
                            $assignmentQuery
                        ) use (
                            $user,
                            $userRoleIds
                        ) {

                            $assignmentQuery
                                ->where(
                                    'assignment_type',
                                    'requesting_department'
                                )
                                ->where(function (
                                    $roleQuery
                                ) use (
                                    $userRoleIds
                                ) {

                                    /*
                                    |--------------------------------------------------------------------------
                                    | STEP DOES NOT REQUIRE SPECIFIC ROLE
                                    |--------------------------------------------------------------------------
                                    */

                                    $roleQuery->whereNull(
                                        'role_id'
                                    );

                                    /*
                                    |--------------------------------------------------------------------------
                                    | USER ROLE MATCHES WORKFLOW STEP
                                    |--------------------------------------------------------------------------
                                    */

                                    if (!empty($userRoleIds)) {

                                        $roleQuery->orWhereIn(
                                            'role_id',
                                            $userRoleIds
                                        );
                                    }
                                });

                        });

                        /*
                        |--------------------------------------------------------------------------
                        | FIXED DEPARTMENT
                        |--------------------------------------------------------------------------
                        |
                        | Example:
                        |
                        | Engineering Department Head
                        |          ↓
                        | Budget Office
                        |
                        | Only users belonging to the fixed department
                        | with the required role can see this step.
                        |
                        */

                        $stepQuery->orWhere(function (
                            $assignmentQuery
                        ) use (
                            $user,
                            $userRoleIds
                        ) {

                            $assignmentQuery
                                ->where(
                                    'assignment_type',
                                    'fixed'
                                )
                                ->where(
                                    'department_id',
                                    $user->department_id
                                )
                                ->where(function (
                                    $roleQuery
                                ) use (
                                    $userRoleIds
                                ) {

                                    /*
                                    |--------------------------------------------------------------------------
                                    | STEP DOES NOT REQUIRE SPECIFIC ROLE
                                    |--------------------------------------------------------------------------
                                    */

                                    $roleQuery->whereNull(
                                        'role_id'
                                    );

                                    /*
                                    |--------------------------------------------------------------------------
                                    | USER ROLE MATCHES WORKFLOW STEP
                                    |--------------------------------------------------------------------------
                                    */

                                    if (!empty($userRoleIds)) {

                                        $roleQuery->orWhereIn(
                                            'role_id',
                                            $userRoleIds
                                        );
                                    }
                                });

                        });
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | REQUESTING DEPARTMENT MUST MATCH USER DEPARTMENT
                |--------------------------------------------------------------------------
                |
                | This prevents a user from another department from
                | seeing a requesting_department workflow step.
                |
                */

                $query->where(
                    'operation_requests.department_id',
                    $user->department_id
                );
            });
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if ($request->filled('search')) {

        $search = $request->input('search');

        $query->where(function ($q) use ($search) {

            $q->where(
                'request_no',
                'like',
                "%{$search}%"
            )
            ->orWhere(
                'title',
                'like',
                "%{$search}%"
            )
            ->orWhere(
                'type',
                'like',
                "%{$search}%"
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    */

    if ($request->filled('status')) {

        $query->where(
            'status',
            $request->input('status')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PRIORITY FILTER
    |--------------------------------------------------------------------------
    */

    if ($request->filled('priority')) {

        $query->where(
            'priority',
            $request->input('priority')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    $requests = $query
        ->latest()
        ->paginate(15)
        ->withQueryString();

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return Inertia::render(
        'operations/requests/index',
        [
            'requests' => $requests,
        ]
    );
}

    /**
     * Show the create request form.
     */
    public function create(): Response
    {
        return Inertia::render(
            'operations/requests/create'
        );
    }

    /**
     * Display a specific request.
     */
    public function show(
        OperationRequest $operationRequest
    ): Response {
        $operationRequest->load([
            'user',
            'department',
            'purchaseRequest.items',
            'workflow',
            'currentWorkflowStep',
            'actions.user',
            'actions.workflowStep',
        ]);

        return Inertia::render(
            'operations/requests/show',
            [
                'request' => $operationRequest,
            ]
        );
    }

    /**
     * Store a new request.
     */
    public function store(
        Request $request
    ): RedirectResponse {
        /*
        |--------------------------------------------------------------------------
        | COMMON VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'type' => [
                'required',
                'string',
                'max:50',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'priority' => [
                'required',
                'in:low,normal,high,urgent',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PURCHASE REQUEST VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            $request->input('type') === 'purchase'
        ) {

            $purchaseValidated = $request->validate([
                'purpose' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'justification' => [
                    'required',
                    'string',
                ],

                'requested_date' => [
                    'required',
                    'date',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'items.*.description' => [
                    'required',
                    'string',
                    'max:1000',
                ],

                'items.*.quantity' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],

                'items.*.unit' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'items.*.estimated_unit_cost' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
            ]);

            $validated = array_merge(
                $validated,
                $purchaseValidated
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT CHECK
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
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

        $operationRequest = DB::transaction(
            function () use (
                $validated,
                $user
            ) {

                /*
                |--------------------------------------------------------------------------
                | REQUEST TITLE
                |--------------------------------------------------------------------------
                */

                $title = 'General Request';

                if (
                    $validated['type'] === 'purchase'
                    && !empty($validated['purpose'])
                ) {

                    $title =
                        $validated['purpose'];
                }

                /*
                |--------------------------------------------------------------------------
                | FIND WORKFLOW
                |--------------------------------------------------------------------------
                */

                $workflow = null;

                if (
                    $validated['type'] === 'purchase'
                ) {

                    $workflow = Workflow::query()
                        ->where(
                            'code',
                            'PURCHASE_REQUEST'
                        )
                        ->where(
                            'is_active',
                            true
                        )
                        ->orderByDesc(
                            'version'
                        )
                        ->first();

                    if (!$workflow) {

                        throw new \RuntimeException(
                            'No active Purchase Request workflow is configured.'
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | FIND FIRST ACTIONABLE STEP
                |--------------------------------------------------------------------------
                |
                | Step 1 = Request Submission
                | Step 2 = Department Head Review
                |
                */

                $currentWorkflowStep = null;

                if ($workflow) {

                    $currentWorkflowStep =
                        $workflow
                            ->steps()
                            ->where(
                                'step_order',
                                '>',
                                1
                            )
                            ->orderBy(
                                'step_order'
                            )
                            ->first();

                    if (
                        !$currentWorkflowStep
                    ) {

                        throw new \RuntimeException(
                            'The Purchase Request workflow has no review step.'
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | CREATE OPERATION REQUEST
                |--------------------------------------------------------------------------
                */

                $operationRequest =
                    OperationRequest::create([
                        'request_no' =>
                            $this->generateRequestNumber(),

                        'user_id' =>
                            $user->id,

                        'department_id' =>
                            $user->department_id,

                        'type' =>
                            $validated['type'],

                        'title' =>
                            $title,

                        'description' =>
                            $validated['description']
                            ?? null,

                        'priority' =>
                            $validated['priority'],

                        'status' =>
                            'pending',

                        'workflow_id' =>
                            $workflow?->id,

                        'current_workflow_step_id' =>
                            $currentWorkflowStep?->id,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | CREATE PURCHASE REQUEST
                |--------------------------------------------------------------------------
                */

                if (
                    $validated['type'] === 'purchase'
                ) {

                    $purchaseRequest =
                        $operationRequest
                            ->purchaseRequest()
                            ->create([
                                'purpose' =>
                                    $validated['purpose'],

                                'justification' =>
                                    $validated['justification'],

                                'requested_date' =>
                                    $validated['requested_date'],
                            ]);

                    /*
                    |--------------------------------------------------------------------------
                    | CREATE PURCHASE ITEMS
                    |--------------------------------------------------------------------------
                    */

                    foreach (
                        $validated['items']
                        as $item
                    ) {

                        $quantity =
                            (float)
                            $item['quantity'];

                        $unitCost =
                            (float)
                            $item[
                                'estimated_unit_cost'
                            ];

                        $estimatedAmount =
                            round(
                                $quantity *
                                $unitCost,
                                2
                            );

                        $purchaseRequest
                            ->items()
                            ->create([
                                'description' =>
                                    $item['description'],

                                'quantity' =>
                                    $quantity,

                                'unit' =>
                                    $item['unit'],

                                'estimated_unit_cost' =>
                                    $unitCost,

                                'estimated_amount' =>
                                    $estimatedAmount,
                            ]);
                    }
                }

                return $operationRequest;
            }
        );

        /*
        |--------------------------------------------------------------------------
        | REDIRECT TO SHOW
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request submitted successfully.'
            );
    }

    /**
     * Approve the current workflow step.
     */
    public function approve(
        Request $request,
        OperationRequest $operationRequest
    ): RedirectResponse {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD CURRENT STEP
        |--------------------------------------------------------------------------
        */

        $operationRequest->load([
            'workflow',
            'currentWorkflowStep',
        ]);

        $currentStep =
            $operationRequest->currentWorkflowStep;

        if (!$currentStep) {

            return back()
                ->withErrors([
                    'workflow' =>
                        'This request does not have an active workflow step.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION
        |--------------------------------------------------------------------------
        */

        if (
            !$this->userCanActOnStep(
                $user,
                $operationRequest,
                $currentStep
            )
        ) {

            abort(
                403,
                'You are not authorized to approve this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | APPROVE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $operationRequest,
                $currentStep,
                $user
            ) {

            $operationRequest->actions()->create([
                'workflow_step_id' => $currentStep->id,
                'user_id' => $user->id,
                'action' => 'approved',
                'reason' => null,
            ]);

                $nextStep =
                    $operationRequest
                        ->workflow
                        ->steps()
                        ->where(
                            'step_order',
                            '>',
                            $currentStep->step_order
                        )
                        ->orderBy(
                            'step_order'
                        )
                        ->first();

                /*
                |--------------------------------------------------------------------------
                | NO NEXT STEP
                |--------------------------------------------------------------------------
                */

                if (!$nextStep) {

                    $operationRequest->update([
                        'status' =>
                            'completed',

                        'current_workflow_step_id' =>
                            null,
                    ]);

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | COMPLETED STEP
                |--------------------------------------------------------------------------
                */

                if (
                    $nextStep->code ===
                    'COMPLETED'
                ) {

                    $operationRequest->update([
                        'status' =>
                            'completed',

                        'current_workflow_step_id' =>
                            $nextStep->id,
                    ]);

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | MOVE TO NEXT STEP
                |--------------------------------------------------------------------------
                */

                $operationRequest->update([
                    'status' =>
                        'pending',

                    'current_workflow_step_id' =>
                        $nextStep->id,
                ]);
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
                $operationRequest
            )
            ->with(
                'success',
                'Request approved and forwarded to the next workflow step.'
            );
    }


    /**
 * Show the edit form for a returned request.
 */
public function edit(
    Request $request,
    OperationRequest $operationRequest
): Response {
    $user = $request->user();

    if (!$user) {
        abort(403);
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY RETURNED/DRAFT REQUESTS
    |--------------------------------------------------------------------------
    */

    if ($operationRequest->status !== 'draft') {
        abort(
            403,
            'Only returned requests can be edited.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY REQUESTER
    |--------------------------------------------------------------------------
    */

    if (
        (int) $operationRequest->user_id !==
        (int) $user->id
    ) {
        abort(
            403,
            'Only the requester can edit this request.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD DATA
    |--------------------------------------------------------------------------
    */

    $operationRequest->load([
        'user',
        'department',
        'purchaseRequest.items',
    ]);

    return Inertia::render(
        'operations/requests/edit',
        [
            'request' => $operationRequest,
        ]
    );
}


/**
 * Update a returned request.
 */
public function update(
    Request $request,
    OperationRequest $operationRequest
): RedirectResponse {
    $user = $request->user();

    if (!$user) {
        abort(403);
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY RETURNED/DRAFT REQUESTS
    |--------------------------------------------------------------------------
    */

    if ($operationRequest->status !== 'draft') {
        abort(
            403,
            'Only returned requests can be edited.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY REQUESTER
    |--------------------------------------------------------------------------
    */

    if (
        (int) $operationRequest->user_id !==
        (int) $user->id
    ) {
        abort(
            403,
            'Only the requester can edit this request.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE COMMON REQUEST DATA
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([
        'description' => [
            'nullable',
            'string',
        ],

        'priority' => [
            'required',
            'in:low,normal,high,urgent',
        ],
    ]);

    /*
    |--------------------------------------------------------------------------
    | PURCHASE REQUEST VALIDATION
    |--------------------------------------------------------------------------
    */

    if ($operationRequest->type === 'purchase') {

        $purchaseValidated =
            $request->validate([
                'purpose' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'justification' => [
                    'required',
                    'string',
                ],

                'requested_date' => [
                    'required',
                    'date',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'items.*.description' => [
                    'required',
                    'string',
                    'max:1000',
                ],

                'items.*.quantity' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],

                'items.*.unit' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'items.*.estimated_unit_cost' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
            ]);

        $validated = array_merge(
            $validated,
            $purchaseValidated
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE DATABASE
    |--------------------------------------------------------------------------
    */

    DB::transaction(
        function () use (
            $operationRequest,
            $validated
        ) {

            /*
            |--------------------------------------------------------------------------
            | UPDATE OPERATION REQUEST
            |--------------------------------------------------------------------------
            */

            $operationRequest->update([
                'title' =>
                    $validated['purpose']
                    ?? $operationRequest->title,

                'description' =>
                    $validated['description']
                    ?? null,

                'priority' =>
                    $validated['priority'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | UPDATE PURCHASE REQUEST
            |--------------------------------------------------------------------------
            */

            if (
                $operationRequest->type ===
                'purchase'
            ) {

                $purchaseRequest =
                    $operationRequest
                        ->purchaseRequest;

                if (!$purchaseRequest) {
                    throw new \RuntimeException(
                        'Purchase request details were not found.'
                    );
                }

                $purchaseRequest->update([
                    'purpose' =>
                        $validated['purpose'],

                    'justification' =>
                        $validated['justification'],

                    'requested_date' =>
                        $validated['requested_date'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | REPLACE PURCHASE ITEMS
                |--------------------------------------------------------------------------
                |
                | Since this is still a draft, we can safely
                | replace the existing requested items.
                |
                */

                $purchaseRequest
                    ->items()
                    ->delete();

                foreach (
                    $validated['items']
                    as $item
                ) {

                    $quantity =
                        (float) $item['quantity'];

                    $unitCost =
                        (float) $item[
                            'estimated_unit_cost'
                        ];

                    $purchaseRequest
                        ->items()
                        ->create([
                            'description' =>
                                $item[
                                    'description'
                                ],

                            'quantity' =>
                                $quantity,

                            'unit' =>
                                $item['unit'],

                            'estimated_unit_cost' =>
                                $unitCost,

                            'estimated_amount' =>
                                $quantity *
                                $unitCost,
                        ]);
                }
            }
        }
    );

    return redirect()
        ->route(
            'operations.requests.show',
            $operationRequest
        )
        ->with(
            'success',
            'Request updated successfully.'
        );
}


    /**
     * Resubmit a returned request.
     */
    public function resubmit(
        Request $request,
        OperationRequest $operationRequest
    ): RedirectResponse {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | ONLY DRAFT / RETURNED REQUESTS
        |--------------------------------------------------------------------------
        */

        if ($operationRequest->status !== 'draft') {
            abort(
                403,
                'Only returned requests can be resubmitted.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ONLY REQUESTER
        |--------------------------------------------------------------------------
        */

        if (
            (int) $operationRequest->user_id !==
            (int) $user->id
        ) {
            abort(
                403,
                'Only the requester can resubmit this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD WORKFLOW
        |--------------------------------------------------------------------------
        */

        $operationRequest->load([
            'workflow',
            'currentWorkflowStep',
        ]);

        if (!$operationRequest->workflow) {
            abort(
                422,
                'This request has no workflow configured.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FIND FIRST REVIEW STEP
        |--------------------------------------------------------------------------
        |
        | Step 1 = Submission
        | Step 2 = Department Head Review
        |
        */

        $reviewStep =
            $operationRequest
                ->workflow
                ->steps()
                ->where(
                    'step_order',
                    '>',
                    1
                )
                ->orderBy(
                    'step_order'
                )
                ->first();

        if (!$reviewStep) {
            abort(
                422,
                'The request workflow has no review step.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RESUBMIT
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $operationRequest,
                $reviewStep,
                $user
            ) {

                /*
                |--------------------------------------------------------------------------
                | RECORD HISTORY
                |--------------------------------------------------------------------------
                */

                $operationRequest
                    ->actions()
                    ->create([
                        'workflow_step_id' =>
                            $reviewStep->id,

                        'user_id' =>
                            $user->id,

                        'action' =>
                            'resubmitted',

                        'reason' =>
                            'Request corrected and resubmitted.',
                    ]);

                /*
                |--------------------------------------------------------------------------
                | MOVE BACK TO DEPARTMENT HEAD
                |--------------------------------------------------------------------------
                */

                $operationRequest->update([
                    'status' =>
                        'pending',

                    'current_workflow_step_id' =>
                        $reviewStep->id,
                ]);
            }
        );

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request resubmitted successfully and forwarded to Department Head Review.'
            );
    }

    /**
 * Reject the current workflow step.
 */
    public function reject(
        Request $request,
        OperationRequest $operationRequest
    ): RedirectResponse {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE REJECTION REASON
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'min:5',
                'max:2000',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | LOAD CURRENT WORKFLOW STEP
        |--------------------------------------------------------------------------
        */

        $operationRequest->load([
            'currentWorkflowStep',
        ]);

        $currentStep =
            $operationRequest->currentWorkflowStep;

        if (!$currentStep) {
            return back()
                ->withErrors([
                    'workflow' =>
                        'This request does not have an active workflow step.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION
        |--------------------------------------------------------------------------
        |
        | Only the user assigned to the current workflow step
        | can reject the request.
        |
        */

        if (
            !$this->userCanActOnStep(
                $user,
                $operationRequest,
                $currentStep
            )
        ) {
            abort(
                403,
                'You are not authorized to reject this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RECORD REJECTION + UPDATE REQUEST
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $operationRequest,
            $currentStep,
            $user,
            $validated
        ) {

            /*
            |--------------------------------------------------------------------------
            | CREATE ACTION HISTORY
            |--------------------------------------------------------------------------
            */

            $operationRequest->actions()->create([
                'workflow_step_id' =>
                    $currentStep->id,

                'user_id' =>
                    $user->id,

                'action' =>
                    'rejected',

                'reason' =>
                    $validated['reason'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | REJECT REQUEST
            |--------------------------------------------------------------------------
            */

            $operationRequest->update([
                'status' => 'rejected',
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request rejected successfully.'
            );
    }

    /**
 * Return the request to the previous workflow step.
 */
    public function returnRequest(
        Request $request,
        OperationRequest $operationRequest
    ): RedirectResponse {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE RETURN REASON
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'min:5',
                'max:2000',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | LOAD WORKFLOW
        |--------------------------------------------------------------------------
        */

        $operationRequest->load([
            'workflow',
            'currentWorkflowStep',
        ]);

        $currentStep =
            $operationRequest->currentWorkflowStep;

        if (!$currentStep) {
            return back()
                ->withErrors([
                    'workflow' =>
                        'This request does not have an active workflow step.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION
        |--------------------------------------------------------------------------
        |
        | Only the user assigned to the current workflow step
        | can return the request.
        |
        */

        if (
            !$this->userCanActOnStep(
                $user,
                $operationRequest,
                $currentStep
            )
        ) {
            abort(
                403,
                'You are not authorized to return this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FIND PREVIOUS WORKFLOW STEP
        |--------------------------------------------------------------------------
        */

        $previousStep =
            $operationRequest
                ->workflow
                ->steps()
                ->where(
                    'step_order',
                    '<',
                    $currentStep->step_order
                )
                ->orderByDesc(
                    'step_order'
                )
                ->first();

        if (!$previousStep) {
            return back()
                ->withErrors([
                    'workflow' =>
                        'There is no previous workflow step.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | RECORD RETURN + UPDATE REQUEST
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $operationRequest,
            $currentStep,
            $previousStep,
            $user,
            $validated
        ) {

            /*
            |--------------------------------------------------------------------------
            | CREATE ACTION HISTORY
            |--------------------------------------------------------------------------
            */

            $operationRequest->actions()->create([
                'workflow_step_id' =>
                    $currentStep->id,

                'user_id' =>
                    $user->id,

                'action' =>
                    'returned',

                'reason' =>
                    $validated['reason'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | MOVE REQUEST BACK
            |--------------------------------------------------------------------------
            */

            $operationRequest->update([
                'status' =>
                    'draft',

                'current_workflow_step_id' =>
                    $previousStep->id,
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request returned successfully.'
            );
    }
    /**
     * Determine whether the authenticated user can act
     * on the current workflow step.
     */
    private function userCanActOnStep(
        $user,
        OperationRequest $operationRequest,
        WorkflowStep $step
    ): bool {

        /*
        |--------------------------------------------------------------------------
        | REQUESTING DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            $step->assignment_type ===
            'requesting_department'
        ) {

            if (
                (int) $user->department_id !==
                (int) $operationRequest->department_id
            ) {

                return false;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | FIXED DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            $step->assignment_type ===
            'fixed'
        ) {

            if (
                !$step->department_id ||
                (int) $user->department_id !==
                (int) $step->department_id
            ) {

                return false;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ROLE
        |--------------------------------------------------------------------------
        */

        if ($step->role_id) {

            $userHasRole =
                $user->roles()
                    ->where(
                        'roles.id',
                        $step->role_id
                    )
                    ->exists();

            if (!$userHasRole) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generate a unique request number.
     */
    private function generateRequestNumber(): string
    {
        do {

            $number =
                'REQ-' .
                now()->format('Y') .
                '-' .
                str_pad(
                    (string) random_int(
                        1,
                        999999
                    ),
                    6,
                    '0',
                    STR_PAD_LEFT
                );

        } while (
            OperationRequest::where(
                'request_no',
                $number
            )->exists()
        );

        return $number;
    }
}