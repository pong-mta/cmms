<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
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

            'asset_id' => $validated['asset_id'],

            'department_id' =>
            $asset->department_id,

            'requested_by' => auth()->id(),

            'assigned_to' => null,

            'title' => $validated['title'],

            'description' =>
            $validated['description'],

            'priority' =>
            $validated['priority'],

            'status' => 'submitted',

            'requested_at' => now(),

            'approved_at' => null,

            'started_at' => null,

            'completed_at' => null,

            'remarks' =>
            $validated['remarks']
                ?? null,
        ]);


        /*
    |--------------------------------------------------------------------------
    | REDIRECT
    |--------------------------------------------------------------------------
    */

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

        return Inertia::render(
            'maintenance-requests/show',
            [
                'request' => $maintenanceRequest,
            ]
        );
    }

    /*
|--------------------------------------------------------------------------
| START REVIEW
|--------------------------------------------------------------------------
*/

    public function review(
        MaintenanceRequest $maintenanceRequest
    ) {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

        $isDepartmentHead = $user
            ->roles()
            ->where('name', 'department_head')
            ->exists();

        if (!$isDepartmentHead) {
            abort(403, 'Only a Department Head can review maintenance requests.');
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
                'You can only review requests from your department.'
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
                'This request cannot be moved to review.'
            );
        }


        /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

        $maintenanceRequest->update([
            'status' => 'reviewing',
        ]);


        /*
    |--------------------------------------------------------------------------
    | REDIRECT
    |--------------------------------------------------------------------------
    */

        return back()->with(
            'success',
            'Maintenance request is now under review.'
        );
    }

    /*
|--------------------------------------------------------------------------
| APPROVE
|--------------------------------------------------------------------------
*/

    public function approve(
        MaintenanceRequest $maintenanceRequest
    ) {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

        $isDepartmentHead = $user
            ->roles()
            ->where('name', 'department_head')
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
            'reviewing'
        ) {
            return back()->with(
                'error',
                'Only requests under review can be approved.'
            );
        }


        /*
    |--------------------------------------------------------------------------
    | APPROVE
    |--------------------------------------------------------------------------
    */

        $maintenanceRequest->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);


        return back()->with(
            'success',
            'Maintenance request approved successfully.'
        );
    }

    /*
|--------------------------------------------------------------------------
| REJECT
|--------------------------------------------------------------------------
*/

    public function reject(
        Request $request,
        MaintenanceRequest $maintenanceRequest
    ) {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

        $isDepartmentHead = $user
            ->roles()
            ->where('name', 'department_head')
            ->exists();

        if (!$isDepartmentHead) {
            abort(
                403,
                'Only a Department Head can reject maintenance requests.'
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
                'You can only reject requests from your department.'
            );
        }


        /*
    |--------------------------------------------------------------------------
    | CHECK STATUS
    |--------------------------------------------------------------------------
    */

        if (
            $maintenanceRequest->status !==
            'reviewing'
        ) {
            return back()->with(
                'error',
                'Only requests under review can be rejected.'
            );
        }


        /*
    |--------------------------------------------------------------------------
    | VALIDATE REASON
    |--------------------------------------------------------------------------
    */

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);


        /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

        $maintenanceRequest->update([
            'status' => 'rejected',

            'remarks' =>
            $validated['reason'],
        ]);


        return back()->with(
            'success',
            'Maintenance request rejected.'
        );
    }
}
