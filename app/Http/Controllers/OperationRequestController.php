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
     * Display all requests.
     */
    public function index(Request $request): Response
    {
        $requests = OperationRequest::with([
            'user',
            'department',
            'purchaseRequest',
        ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('operations/requests/index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Show the create request form.
     */
    public function create(): Response
    {
        return Inertia::render('operations/requests/create');
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
        ]);

        return Inertia::render('operations/requests/show', [
            'request' => $operationRequest,
        ]);
    }

    /**
     * Store a new request.
     */
    public function store(Request $request): RedirectResponse
    {
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

        if ($request->input('type') === 'purchase') {
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
            function () use ($validated, $user) {

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
                    $title = $validated['purpose'];
                }

                /*
                |--------------------------------------------------------------------------
                | FIND WORKFLOW
                |--------------------------------------------------------------------------
                */

                $workflow = null;

                if ($validated['type'] === 'purchase') {
                    $workflow = Workflow::query()
                        ->where('code', 'PURCHASE_REQUEST')
                        ->where('is_active', true)
                        ->orderByDesc('version')
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
                | Once the requester submits the request, we start at
                | Department Head Review.
                |
                */

                $currentWorkflowStep = null;

                if ($workflow) {
                    $currentWorkflowStep = $workflow->steps()
                        ->where('step_order', '>', 1)
                        ->orderBy('step_order')
                        ->first();

                    if (!$currentWorkflowStep) {
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

                $operationRequest = OperationRequest::create([
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
                        $validated['description'] ?? null,

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
                            (float) $item['quantity'];

                        $unitCost =
                            (float)
                            $item['estimated_unit_cost'];

                        $estimatedAmount =
                            round(
                                $quantity * $unitCost,
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
            return back()->withErrors([
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

        DB::transaction(function () use (
            $operationRequest,
            $currentStep
        ) {
            $nextStep =
                $operationRequest
                    ->workflow
                    ->steps()
                    ->where(
                        'step_order',
                        '>',
                        $currentStep->step_order
                    )
                    ->orderBy('step_order')
                    ->first();

            /*
            |--------------------------------------------------------------------------
            | NO NEXT STEP
            |--------------------------------------------------------------------------
            */

            if (!$nextStep) {
                $operationRequest->update([
                    'status' => 'completed',
                    'current_workflow_step_id' => null,
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | COMPLETED STEP
            |--------------------------------------------------------------------------
            */

            if ($nextStep->code === 'COMPLETED') {
                $operationRequest->update([
                    'status' => 'completed',
                    'current_workflow_step_id' => $nextStep->id,
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | MOVE TO NEXT STEP
            |--------------------------------------------------------------------------
            */

            $operationRequest->update([
                'status' => 'pending',
                'current_workflow_step_id' => $nextStep->id,
            ]);
        });

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

        $operationRequest->load([
            'currentWorkflowStep',
        ]);

        $currentStep =
            $operationRequest->currentWorkflowStep;

        if (!$currentStep) {
            return back()->withErrors([
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
                'You are not authorized to reject this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | REJECT
        |--------------------------------------------------------------------------
        */

        $operationRequest->update([
            'status' => 'rejected',
        ]);

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request rejected.'
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

        $operationRequest->load([
            'workflow',
            'currentWorkflowStep',
        ]);

        $currentStep =
            $operationRequest->currentWorkflowStep;

        if (!$currentStep) {
            return back()->withErrors([
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
                'You are not authorized to return this request.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FIND PREVIOUS STEP
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
                ->orderByDesc('step_order')
                ->first();

        if (!$previousStep) {
            return back()->withErrors([
                'workflow' =>
                    'There is no previous workflow step.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        $operationRequest->update([
            'status' => 'draft',
            'current_workflow_step_id' => $previousStep->id,
        ]);

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request returned to the previous workflow step.'
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
        | DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            $step->assignment_type === 'requesting_department'
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
            $step->assignment_type === 'fixed'
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