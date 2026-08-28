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
}