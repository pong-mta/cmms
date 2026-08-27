<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceRequestCostItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'assessedBy',
                'headReviewedBy',
                'budgetReviewedBy',
                'costItems',
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
            'assessedBy',
            'headReviewedBy',
            'gsoReviewedBy',
            'budgetReviewedBy',
            'costItems',
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

        $user = auth()->user();

        $userRoles = $user
            ? $user->roles()->pluck('name')->values()->all()
            : [];

        return Inertia::render(
            'maintenance-requests/show',
            [
                'request' =>
                $maintenanceRequest,

                'technicians' =>
                $technicians,

                'userRoles' =>
                $userRoles,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR ASSESSMENT
    |--------------------------------------------------------------------------
    |
    | submitted
    |     ↓
    | assessment
    |     ↓
    | for_head_review
    |
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
        |
        | A request can be assessed when:
        |
        | submitted
        | OR
        | returned by Head as assessment
        |
        */

        if (!in_array(
            $maintenanceRequest->status,
            [
                'submitted',
                'assessment',
            ],
            true
        )) {
            return back()->with(
                'error',
                'This request cannot be assessed at its current status.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE ASSESSMENT
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

            'cost_items' => [
                'required',
                'array',
                'min:1',
            ],

            'cost_items.*.type' => [
                'required',
                'in:labor,parts,other',
            ],

            'cost_items.*.description' => [
                'required',
                'string',
                'max:255',
            ],

            'cost_items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'cost_items.*.unit' => [
                'required',
                'string',
                'max:50',
            ],

            'cost_items.*.unit_cost' => [
                'required',
                'numeric',
                'min:0',
            ],

            'cost_items.*.remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | SAVE ASSESSMENT + COST ITEMS
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $maintenanceRequest,
            $user,
            $validated
        ) {
            /*
            |--------------------------------------------------------------------------
            | DELETE OLD COST ITEMS
            |--------------------------------------------------------------------------
            |
            | Important when the Head returns the request to the Supervisor.
            |
            */

            $maintenanceRequest
                ->costItems()
                ->delete();

            $laborTotal = 0;
            $partsTotal = 0;
            $otherTotal = 0;

            /*
            |--------------------------------------------------------------------------
            | CREATE COST ITEMS
            |--------------------------------------------------------------------------
            */

            foreach (
                $validated['cost_items']
                as $item
            ) {
                $quantity =
                    (float) $item['quantity'];

                $unitCost =
                    (float) $item['unit_cost'];

                $total =
                    $quantity * $unitCost;

                MaintenanceRequestCostItem::create([
                    'maintenance_request_id' =>
                    $maintenanceRequest->id,

                    'type' =>
                    $item['type'],

                    'description' =>
                    $item['description'],

                    'quantity' =>
                    $quantity,

                    'unit' =>
                    $item['unit'],

                    'unit_cost' =>
                    $unitCost,

                    'total_cost' =>
                    $total,

                    'remarks' =>
                    $item['remarks'] ?? null,
                ]);

                /*
                |--------------------------------------------------------------------------
                | TOTALS
                |--------------------------------------------------------------------------
                */

                if ($item['type'] === 'labor') {
                    $laborTotal += $total;
                }

                if ($item['type'] === 'parts') {
                    $partsTotal += $total;
                }

                if ($item['type'] === 'other') {
                    $otherTotal += $total;
                }
            }

            $estimatedTotal =
                $laborTotal +
                $partsTotal +
                $otherTotal;

            /*
            |--------------------------------------------------------------------------
            | UPDATE REQUEST
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

                /*
                |--------------------------------------------------------------------------
                | KEEP SUMMARY TOTALS
                |--------------------------------------------------------------------------
                |
                | These existing columns remain useful for quick reporting.
                |
                */

                'estimated_labor_cost' =>
                $laborTotal,

                'estimated_parts_cost' =>
                $partsTotal,

                'estimated_other_cost' =>
                $otherTotal,

                'estimated_total_cost' =>
                $estimatedTotal,

                'status' =>
                'for_head_review',
            ]);
        });

        return back()->with(
            'success',
            'Assessment and detailed costing submitted for Department Head review.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HEAD APPROVE
    |--------------------------------------------------------------------------
    |
    | for_head_review
    |       ↓
    | head_approved
    |       ↓
    | for_budget_review
    |
    */

    public function headApprove(
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->status !==
            'for_head_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Department Head review can be approved.'
            );
        }

        $maintenanceRequest->update([
            'head_reviewed_by' =>
            $user->id,

            'head_reviewed_at' =>
            now(),

            'status' =>
            'for_gso_review',

            'approved_at' =>
            now(),
        ]);

        return back()->with(
            'success',
            'Maintenance request approved and sent to GSO for validation.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HEAD RETURN
    |--------------------------------------------------------------------------
    |
    | for_head_review
    |       ↓
    | assessment
    |
    */

    public function headReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->status !==
            'for_head_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Department Head review can be returned.'
            );
        }

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

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
    | for_budget_review
    |       ↓
    | budget_approved
    |       ↓
    | ready_for_work
    |
    */

    /*
|--------------------------------------------------------------------------
| GSO APPROVE
|--------------------------------------------------------------------------
|
| for_gso_review
|       ↓
| for_budget_review
|
*/

    public function gsoApprove(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

        $isGso = $user
            ->roles()
            ->where('name', 'gso')
            ->exists();

        if (!$isGso) {
            abort(
                403,
                'Only the General Services Office can validate maintenance requests.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'for_gso_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for GSO review can be validated.'
            );
        }

        $maintenanceRequest->update([
            'gso_reviewed_by' => $user->id,
            'gso_reviewed_at' => now(),
            'status' => 'for_budget_review',
        ]);

        return back()->with(
            'success',
            'GSO validation completed. Maintenance request sent to Budget Office.'
        );
    }


    /*
|--------------------------------------------------------------------------
| GSO RETURN
|--------------------------------------------------------------------------
|
| for_gso_review
|       ↓
| assessment
|
*/

    public function gsoReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

        $isGso = $user
            ->roles()
            ->where('name', 'gso')
            ->exists();

        if (!$isGso) {
            abort(
                403,
                'Only the General Services Office can return maintenance requests.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'for_gso_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for GSO review can be returned.'
            );
        }

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        $maintenanceRequest->update([
            'remarks' => $validated['remarks'],
            'status' => 'assessment',
        ]);

        return back()->with(
            'success',
            'Maintenance request returned to the Supervisor for reassessment.'
        );
    }

    public function budgetApprove(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->status !==
            'for_budget_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Budget review can be approved.'
            );
        }

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
            $validated['remarks'] ?? null,

            'status' =>
            'for_accounting_review',
        ]);

        return back()->with(
            'success',
            'Budget approved. Maintenance request sent to Accounting for review.'
        );
    }


    public function accountingApprove(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

        $isAccountingOfficer = $user
            ->roles()
            ->where('name', 'accounting_officer')
            ->exists();

        if (!$isAccountingOfficer) {
            abort(
                403,
                'Only an Accounting Office Officer can approve accounting review.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'for_accounting_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Accounting review can be approved.'
            );
        }

        $validated = $request->validate([
            'accounting_reference_no' => [
                'required',
                'string',
                'max:255',
            ],

            'accounting_remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $maintenanceRequest->update([
            'accounting_reviewed_by' =>
            $user->id,

            'accounting_reviewed_at' =>
            now(),

            'accounting_reference_no' =>
            $validated['accounting_reference_no'],

            'accounting_remarks' =>
            $validated['accounting_remarks'] ?? null,

            'status' =>
            'for_mayor_approval',
        ]);

        return back()->with(
            'success',
            'Accounting review approved. Maintenance request is now waiting for Mayor approval.'
        );
    }

    public function accountingReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

        $isAccountingOfficer = $user
            ->roles()
            ->where('name', 'accounting_officer')
            ->exists();

        if (!$isAccountingOfficer) {
            abort(
                403,
                'Only an Accounting Office Officer can return the request.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'for_accounting_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Accounting review can be returned.'
            );
        }

        $validated = $request->validate([
            'accounting_remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        $maintenanceRequest->update([
            'accounting_remarks' =>
            $validated['accounting_remarks'],

            'status' =>
            'for_budget_review',
        ]);

        return back()->with(
            'success',
            'Maintenance request returned to Budget Office for review.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | BUDGET RETURN
    |--------------------------------------------------------------------------
    |
    | for_budget_review
    |       ↓
    | for_head_review
    |
    */

    public function budgetReturn(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->status !==
            'for_budget_review'
        ) {
            return back()->with(
                'error',
                'Only requests waiting for Budget review can be returned.'
            );
        }

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

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
    | ready_for_work
    |       ↓
    | assigned
    |
    */

    public function assign(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->status !==
            'ready_for_work'
        ) {
            return back()->with(
                'error',
                'Only budget-approved requests ready for work can be assigned.'
            );
        }

        $validated = $request->validate([
            'assigned_to' => [
                'required',
                'exists:users,id',
            ],
        ]);

        $technician = User::findOrFail(
            $validated['assigned_to']
        );

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

        if (
            $technician->department_id !==
            $maintenanceRequest->department_id
        ) {
            return back()->with(
                'error',
                'The technician must belong to the same department as the maintenance request.'
            );
        }

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
    | assigned
    |     ↓
    | in_progress
    |
    */

    public function startWork(
        MaintenanceRequest $maintenanceRequest
    ): RedirectResponse {
        $user = auth()->user();

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

        if (
            $maintenanceRequest->assigned_to !==
            $user->id
        ) {
            abort(
                403,
                'This maintenance request is not assigned to you.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'assigned'
        ) {
            return back()->with(
                'error',
                'Only assigned requests can be started.'
            );
        }

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

        if (
            $maintenanceRequest->assigned_to !==
            $user->id
        ) {
            abort(
                403,
                'This maintenance request is not assigned to you.'
            );
        }

        if (
            $maintenanceRequest->status !==
            'in_progress'
        ) {
            return back()->with(
                'error',
                'Only maintenance work in progress can be completed.'
            );
        }

        $validated = $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

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

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

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
