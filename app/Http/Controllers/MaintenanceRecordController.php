<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\MaintenanceRecord;
use App\Models\MaintenanceType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceRecordController extends Controller
{
    /**
     * Display maintenance records.
     */
    public function index(): Response
    {
        $records = MaintenanceRecord::query()
            ->with([
                'asset',
                'maintenanceType',
                'department',
                'requestedBy',
                'assignedTo',
            ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $types = MaintenanceType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
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
            'maintenance/index',
            [
                'records' => $records,
                'types' => $types,
                'departments' => $departments,
            ]
        );
    }


    /**
     * Show maintenance record form.
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

        $types = MaintenanceType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        $departments = Department::query()
            ->where('status', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        $users = User::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_id',
            ]);

        return Inertia::render(
            'maintenance/create',
            [
                'assets' => $assets,
                'types' => $types,
                'departments' => $departments,
                'users' => $users,
            ]
        );
    }


    /**
     * Store maintenance record.
     */
    public function store(
        Request $request
    ): RedirectResponse {

        $validated = $request->validate([
            'maintenance_code' => [
                'required',
                'string',
                'max:100',
                'unique:maintenance_records,maintenance_code',
            ],

            'asset_id' => [
                'required',
                'exists:assets,id',
            ],

            'maintenance_type_id' => [
                'required',
                'exists:maintenance_types,id',
            ],

            'department_id' => [
                'nullable',
                'exists:departments,id',
            ],

            'requested_by' => [
                'nullable',
                'exists:users,id',
            ],

            'assigned_to' => [
                'nullable',
                'exists:users,id',
            ],

            'scheduled_date' => [
                'nullable',
                'date',
            ],

            'started_at' => [
                'nullable',
                'date',
            ],

            'completed_at' => [
                'nullable',
                'date',
                'after_or_equal:started_at',
            ],

            'problem' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'work_performed' => [
                'nullable',
                'string',
            ],

            'labor_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'parts_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'other_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'status' => [
                'required',
                'in:pending,scheduled,in_progress,completed,cancelled',
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
        | CALCULATE TOTAL COST
        |--------------------------------------------------------------------------
        */

        $laborCost = (float) (
            $validated['labor_cost'] ?? 0
        );

        $partsCost = (float) (
            $validated['parts_cost'] ?? 0
        );

        $otherCost = (float) (
            $validated['other_cost'] ?? 0
        );

        $validated['total_cost'] =
            $laborCost +
            $partsCost +
            $otherCost;


        /*
        |--------------------------------------------------------------------------
        | CREATE RECORD
        |--------------------------------------------------------------------------
        */

        $record = MaintenanceRecord::create(
            $validated
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE ASSET STATUS
        |--------------------------------------------------------------------------
        */

        $asset = Asset::find(
            $validated['asset_id']
        );

        if (
            $asset &&
            $validated['status'] ===
            'in_progress'
        ) {
            $asset->update([
                'status' =>
                'under_maintenance',
            ]);
        }


        return redirect()
            ->route(
                'maintenance.index'
            )
            ->with(
                'success',
                'Maintenance record created successfully.'
            );
    }
}
