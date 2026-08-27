<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\MaintenanceRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(): Response
    {
        $requests = MaintenanceRequest::query()
            ->with([
                'asset',
                'department',
                'requestedBy',
                'assignedTo',
            ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render(
            'maintenance-requests/index',
            [
                'requests' => $requests,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    public function create(): Response
    {
        $assets = Asset::query()
            ->whereNotIn('status', [
                'disposed',
                'lost',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'asset_code',
                'name',
                'department_id',
            ]);

        $departments = Department::query()
            ->where('status', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        return Inertia::render(
            'maintenance-requests/create',
            [
                'assets' => $assets,
                'departments' => $departments,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): RedirectResponse {
        $validated = $request->validate([
            'asset_id' => [
                'required',
                'exists:assets,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
                'string',
            ],

            'priority' => [
                'required',
                'in:low,normal,high,critical',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        $asset = Asset::findOrFail(
            $validated['asset_id']
        );


        /*
        |--------------------------------------------------------------------------
        | REQUEST CODE
        |--------------------------------------------------------------------------
        */

        $year = now()->year;

        $lastRequest = MaintenanceRequest::query()
            ->whereYear('created_at', $year)
            ->latest('id')
            ->first();

        $nextNumber = $lastRequest
            ? ((int) str_replace(
                "MRQ-{$year}-",
                '',
                $lastRequest->request_code
            ) + 1)
            : 1;

        $requestCode = sprintf(
            'MRQ-%d-%04d',
            $year,
            $nextNumber
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

        MaintenanceRequest::create([
            'request_code' => $requestCode,

            'asset_id' =>
            $validated['asset_id'],

            'department_id' =>
            $asset->department_id,

            'requested_by' =>
            auth()->id(),

            'assigned_to' =>
            null,

            'title' =>
            $validated['title'],

            'description' =>
            $validated['description'],

            'priority' =>
            $validated['priority'],

            'status' =>
            'submitted',

            'requested_at' =>
            now(),

            'approved_at' =>
            null,

            'started_at' =>
            null,

            'completed_at' =>
            null,

            'remarks' =>
            $validated['remarks'] ?? null,
        ]);


        return redirect()
            ->route('maintenance-requests.index')
            ->with(
                'success',
                'Maintenance request submitted successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(
        MaintenanceRequest $maintenanceRequest
    ): Response {
        $maintenanceRequest->load([
            'asset',
            'department',
            'requestedBy',
            'assignedTo',
        ]);

        $technicians = User::query()
            ->where(
                'department_id',
                $maintenanceRequest->department_id
            )
            ->whereHas(
                'roles',
                function ($query) {
                    $query->where(
                        'name',
                        'technician'
                    );
                }
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'phone',
                'department_id',
            ]);

        return Inertia::render(
            'maintenance-requests/show',
            [
                'request' =>
                $maintenanceRequest,

                'technicians' =>
                $technicians,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR ASSESSMENT
    |--------------------------------------------------------------------------
    */

    public function assess(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $isSupervisor = $user
            ->roles()
            ->where(
                'name',
                'maintenance_supervisor'
            )
            ->exists();

        if (!$isSupervisor) {
            abort(
                403,
                'Only a Maintenance Supervisor can assess maintenance requests.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$user->department_id ||
            $user->department_id !==
            $maintenanceRequest->department_id
        ) {
            abort(
                403,
                'You can only assess requests from your department.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'submitted'
        ) {
            return back()->with(
                'error',
                'Only submitted requests can be assessed.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'assessment' => [
                'required',
                'string',
            ],

            'work_scope' => [
                'required',
                'string',
            ],

            'estimated_labor_cost' => [
                'required',
                'numeric',
                'min:0',
            ],

            'estimated_parts_cost' => [
                'required',
                'numeric',
                'min:0',
            ],

            'estimated_other_cost' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | CALCULATE TOTAL
        |--------------------------------------------------------------------------
        */

        $estimatedLabor =
            (float) $validated['estimated_labor_cost'];

        $estimatedParts =
            (float) $validated['estimated_parts_cost'];

        $estimatedOther =
            (float) $validated['estimated_other_cost'];

        $estimatedTotal =
            $estimatedLabor +
            $estimatedParts +
            $estimatedOther;


        /*
        |--------------------------------------------------------------------------
        | SAVE ASSESSMENT
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'assessed_by' =>
            $user->id,

            'assessed_at' =>
            now(),

            'assessment' =>
            $validated['assessment'],

            'work_scope' =>
            $validated['work_scope'],

            'estimated_labor_cost' =>
            $estimatedLabor,

            'estimated_parts_cost' =>
            $estimatedParts,

            'estimated_other_cost' =>
            $estimatedOther,

            'estimated_total_cost' =>
            $estimatedTotal,

            'status' =>
            'for_head_review',
        ]);


        return back()->with(
            'success',
            'Assessment and estimated costing submitted for Department Head review.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | HEAD APPROVE
    |--------------------------------------------------------------------------
    |
    | FOR HEAD REVIEW
    |       ↓
    | HEAD APPROVED
    |       ↓
    | FOR BUDGET REVIEW
    |
    */

    public function headApprove(
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $isDepartmentHead = $user
            ->roles()
            ->where(
                'name',
                'department_head'
            )
            ->exists();

        if (!$isDepartmentHead) {
            abort(
                403,
                'Only a Department Head can approve maintenance requests.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$user->department_id ||
            $user->department_id !==
            $maintenanceRequest->department_id
        ) {
            abort(
                403,
                'You can only approve requests from your department.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'for_head_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Department Head review can be approved.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | APPROVE
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'head_reviewed_by' =>
            $user->id,

            'head_reviewed_at' =>
            now(),

            'status' =>
            'head_approved',

            'approved_at' =>
            now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | SEND TO BUDGET
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'status' =>
            'for_budget_review',
        ]);


        return back()->with(
            'success',
            'Maintenance request approved and sent to Budget Office for review.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | HEAD RETURN
    |--------------------------------------------------------------------------
    |
    | FOR HEAD REVIEW
    |       ↓
    | SUBMITTED
    |
    */

    public function headReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $isDepartmentHead = $user
            ->roles()
            ->where(
                'name',
                'department_head'
            )
            ->exists();

        if (!$isDepartmentHead) {
            abort(
                403,
                'Only a Department Head can return maintenance requests.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$user->department_id ||
            $user->department_id !==
            $maintenanceRequest->department_id
        ) {
            abort(
                403,
                'You can only return requests from your department.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'for_head_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Department Head review can be returned.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE REMARKS
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'head_reviewed_by' =>
            $user->id,

            'head_reviewed_at' =>
            now(),

            'head_remarks' =>
            $validated['remarks'],

            'status' =>
            'assessment',
        ]);


        return back()->with(
            'success',
            'Maintenance request returned to the Supervisor for reassessment.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | BUDGET APPROVE
    |--------------------------------------------------------------------------
    |
    | FOR BUDGET REVIEW
    |       ↓
    | BUDGET APPROVED
    |       ↓
    | READY FOR WORK
    |
    */

    public function budgetApprove(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $isBudgetOfficer = $user
            ->roles()
            ->where(
                'name',
                'budget_officer'
            )
            ->exists();

        if (!$isBudgetOfficer) {
            abort(
                403,
                'Only a Budget Office Officer can approve the budget.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'for_budget_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Budget review can be approved.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'funding_source' => [
                'required',
                'string',
                'max:255',
            ],

            'budget_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | SAVE BUDGET APPROVAL
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'budget_reviewed_by' =>
            $user->id,

            'budget_reviewed_at' =>
            now(),

            'funding_source' =>
            $validated['funding_source'],

            'budget_amount' =>
            $validated['budget_amount'],

            'budget_remarks' =>
            $validated['remarks']
                ?? null,

            'status' =>
            'budget_approved',
        ]);


        /*
        |--------------------------------------------------------------------------
        | READY FOR WORK
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'status' =>
            'ready_for_work',
        ]);


        return back()->with(
            'success',
            'Budget approved. Maintenance request is ready for work.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | BUDGET RETURN
    |--------------------------------------------------------------------------
    |
    | FOR BUDGET REVIEW
    |       ↓
    | FOR HEAD REVIEW
    |
    */

    public function budgetReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $isBudgetOfficer = $user
            ->roles()
            ->where(
                'name',
                'budget_officer'
            )
            ->exists();

        if (!$isBudgetOfficer) {
            abort(
                403,
                'Only a Budget Office Officer can return budget requests.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'for_budget_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Budget review can be returned.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN TO HEAD
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'budget_reviewed_by' =>
            $user->id,

            'budget_reviewed_at' =>
            now(),

            'budget_remarks' =>
            $validated['remarks'],

            'status' =>
            'for_head_review',
        ]);


        return back()->with(
            'success',
            'Budget review returned to the Department Head.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ASSIGN TECHNICIAN
    |--------------------------------------------------------------------------
    |
    | READY FOR WORK
    |       ↓
    | ASSIGNED
    |
    */

    public function assign(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK ROLE
        |--------------------------------------------------------------------------
        */

        $canAssign = $user
            ->roles()
            ->whereIn(
                'name',
                [
                    'maintenance_supervisor',
                    'system_admin',
                ]
            )
            ->exists();

        if (!$canAssign) {
            abort(
                403,
                'Only a Maintenance Supervisor or System Administrator can assign maintenance requests.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'ready_for_work'
        ) {
            return back()->with(
                'error',
                'Only budget-approved requests ready for work can be assigned.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'assigned_to' => [
                'required',
                'exists:users,id',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | GET TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $technician = User::findOrFail(
            $validated['assigned_to']
        );


        /*
        |--------------------------------------------------------------------------
        | CHECK TECHNICIAN ROLE
        |--------------------------------------------------------------------------
        */

        $isTechnician = $technician
            ->roles()
            ->where(
                'name',
                'technician'
            )
            ->exists();

        if (!$isTechnician) {
            return back()->with(
                'error',
                'The selected user is not a Maintenance Technician.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DEPARTMENT
        |--------------------------------------------------------------------------
        */

        if (
            $technician->department_id !==
            $maintenanceRequest->department_id
        ) {
            return back()->with(
                'error',
                'The technician must belong to the same department as the maintenance request.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ASSIGN
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'assigned_to' =>
            $technician->id,

            'status' =>
            'assigned',
        ]);


        return back()->with(
            'success',
            'Maintenance request assigned successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | START WORK
    |--------------------------------------------------------------------------
    |
    | ASSIGNED
    |    ↓
    | IN PROGRESS
    |
    */

    public function startWork(
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $isTechnician = $user
            ->roles()
            ->where(
                'name',
                'technician'
            )
            ->exists();

        if (!$isTechnician) {
            abort(
                403,
                'Only a Maintenance Technician can start work.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK ASSIGNMENT
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->assigned_to !==
            $user->id
        ) {
            abort(
                403,
                'This maintenance request is not assigned to you.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'assigned'
        ) {
            return back()->with(
                'error',
                'Only assigned requests can be started.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | START
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'status' =>
            'in_progress',

            'started_at' =>
            now(),
        ]);


        return back()->with(
            'success',
            'Maintenance work started.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETE
    |--------------------------------------------------------------------------
    */

    public function complete(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $isTechnician = $user
            ->roles()
            ->where(
                'name',
                'technician'
            )
            ->exists();

        if (!$isTechnician) {
            abort(
                403,
                'Only a Maintenance Technician can complete work.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK ASSIGNMENT
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->assigned_to !==
            $user->id
        ) {
            abort(
                403,
                'This maintenance request is not assigned to you.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $maintenanceRequest->status !==
            'in_progress'
        ) {
            return back()->with(
                'error',
                'Only maintenance work in progress can be completed.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE REMARKS
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | COMPLETE
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'status' =>
            'completed',

            'completed_at' =>
            now(),

            'remarks' =>
            $validated['remarks']
                ?? $maintenanceRequest->remarks,
        ]);


        return back()->with(
            'success',
            'Maintenance request completed successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CANCEL
    |--------------------------------------------------------------------------
    */

    public function cancel(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | CHECK AUTHORIZED ROLES
        |--------------------------------------------------------------------------
        */

        $canCancel = $user
            ->roles()
            ->whereIn(
                'name',
                [
                    'maintenance_supervisor',
                    'department_head',
                    'system_admin',
                ]
            )
            ->exists();

        if (!$canCancel) {
            abort(
                403,
                'You are not authorized to cancel this request.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK FINAL STATUS
        |--------------------------------------------------------------------------
        */

        if (
            in_array(
                $maintenanceRequest->status,
                [
                    'completed',
                    'cancelled',
                ],
                true
            )
        ) {
            return back()->with(
                'error',
                'This request can no longer be cancelled.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | CANCEL
        |--------------------------------------------------------------------------
        */

        $maintenanceRequest->update([
            'status' =>
            'cancelled',

            'remarks' =>
            $validated['remarks'],
        ]);


        return back()->with(
            'success',
            'Maintenance request cancelled.'
        );
    }
}
