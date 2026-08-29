<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OperationsRequestController extends Controller
{
    /**
     * Display requests belonging to the authenticated user's department.
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

        $search = $request->string('search')->trim()->toString();

        $status = $request->string('status')->trim()->toString();

        $priority = $request->string('priority')->trim()->toString();

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
        */

        $requestTypes =
            ServiceRequest::query()
                ->when(
                    $departmentId,
                    function ($query) use ($departmentId) {

                        $query->where(
                            'department_id',
                            $departmentId
                        );
                    }
                )
                ->whereNotNull(
                    'request_type'
                )
                ->where(
                    'request_type',
                    '!=',
                    ''
                )
                ->distinct()
                ->orderBy(
                    'request_type'
                )
                ->pluck(
                    'request_type'
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENTS
        |--------------------------------------------------------------------------
        |
        | Used later for assignment.
        |
        | We expose active departments here, but the list displayed
        | to ordinary users can be restricted in the UI/controller
        | when the assignment workflow is implemented.
        |
        */

        $departments =
            Department::query()
                ->where(
                    'status',
                    true
                )
                ->orderBy(
                    'name'
                )
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

        $assets =
            Asset::query()
                ->where(
                    'department_id',
                    $departmentId
                )
                ->orderBy(
                    'name'
                )
                ->get([
                    'id',
                    'asset_code',
                    'name',
                ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN PAGE
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


    /**
     * Show the request creation form.
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

        $assets =
            Asset::query()
                ->where(
                    'department_id',
                    $departmentId
                )
                ->orderBy(
                    'name'
                )
                ->get([
                    'id',
                    'asset_code',
                    'name',
                ]);


        return Inertia::render(
            'operations/requests/create',
            [
                'user' =>
                    $user,

                'assets' =>
                    $assets,
            ]
        );
    }


    /**
     * Store a new service request.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'request_type' => [
                'required',
                'string',
                'max:100',
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
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->department_id) {

            return back()
                ->withErrors([
                    'department' =>
                        'Your account is not assigned to a department.',
                ]);
        }


        /*
        |--------------------------------------------------------------------------
        | ASSET SECURITY
        |--------------------------------------------------------------------------
        |
        | If an asset is supplied, make absolutely sure that it belongs
        | to the requester's department.
        |
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
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

        $serviceRequest =
            DB::transaction(function () use (
                $validated,
                $user
            ) {

                $serviceRequest =
                    ServiceRequest::create([
                        'request_code' =>
                            $this->generateRequestCode(),

                        'request_type' =>
                            $validated[
                                'request_type'
                            ],

                        'subject' =>
                            $validated[
                                'subject'
                            ],

                        'description' =>
                            $validated[
                                'description'
                            ] ?? null,

                        'priority' =>
                            $validated[
                                'priority'
                            ],

                        'status' =>
                            'pending',

                        'requested_by' =>
                            $user->id,

                        'department_id' =>
                            $user->department_id,

                        'location' =>
                            $validated[
                                'location'
                            ] ?? null,

                        'asset_id' =>
                            $validated[
                                'asset_id'
                            ] ?? null,

                        'requested_at' =>
                            now(),

                        'remarks' =>
                            $validated[
                                'remarks'
                            ] ?? null,
                    ]);


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
            });


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


    /**
     * Display a single request.
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


    /**
     * Generate a unique service request code.
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

    if ($serviceRequest->status !== 'pending') {

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


    DB::transaction(function () use (
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
                        ?? 'Request reviewed by supervisor.',
            ]);
    });


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


    DB::transaction(function () use (
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
                        ?? 'Request approved by department head.',
            ]);
    });


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
| Supervisor can reject:
|
| PENDING
|
| Head can reject:
|
| FOR HEAD REVIEW
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
        $serviceRequest->status === 'pending'
    ) {
        $allowed = true;
    }


    if (
        $isHead &&
        $serviceRequest->status === 'for_head_review'
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

    DB::transaction(function () use (
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
    });


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
    |
    | For now supervisors can start work.
    | Later we can introduce dedicated workers.
    |
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


    DB::transaction(function () use (
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
                    ?? $user->id,

            'assigned_at' =>
                $serviceRequest->assigned_at
                    ?? now(),
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
    });


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


    DB::transaction(function () use (
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
                    ?? $serviceRequest->remarks,
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
                        ?? 'Request completed.',
            ]);
    });


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
        ->contains(function ($role) {

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
        });
}


/*
|--------------------------------------------------------------------------
| ROLE: HEAD
|--------------------------------------------------------------------------
*/

protected function userIsHead($user): bool
{
    return $user->roles
        ->contains(function ($role) {

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
        });
}

}