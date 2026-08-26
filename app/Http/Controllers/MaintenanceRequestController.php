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

            'department_id' => [
                'nullable',
                'exists:departments,id',
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
            $validated['department_id']
                ?? null,

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
}
