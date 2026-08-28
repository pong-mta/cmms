<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Department;
use App\Models\MaintenanceRecord;
use App\Models\MaintenanceType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\PreventiveMaintenanceSchedule;
use App\Models\MaintenanceRequest;
use Carbon\Carbon;

class MaintenanceRecordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
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

        $maintenanceRequests = MaintenanceRequest::query()
            ->with([
                'asset:id,asset_code,name,department_id',
                'department:id,name,code',
                'requestedBy:id,name',
                'assignedTo:id,name',
                'completedBy:id,name',
                'preventiveMaintenanceSchedule:id,title',
            ])
            ->where('status', 'completed')
            ->latest('completed_at')
            ->get();

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

            /*
            |--------------------------------------------------------------------------
            | MAINTENANCE CHART DATA
            |--------------------------------------------------------------------------
            */

            $year = now()->year;


            /*
            |--------------------------------------------------------------------------
            | COMPLETED MAINTENANCE TREND
            |--------------------------------------------------------------------------
            */

            $completedByMonth = MaintenanceRequest::query()
                ->where('status', 'completed')
                ->whereYear('completed_at', $year)
                ->selectRaw('MONTH(completed_at) as month')
                ->selectRaw('COUNT(*) as total')
                ->groupByRaw('MONTH(completed_at)')
                ->pluck('total', 'month');

            $maintenanceTrend = collect(range(1, 12))
                ->map(function ($month) use ($completedByMonth, $year) {
                    return [
                        'month' => Carbon::create($year, $month, 1)->format('M'),
                        'total' => (int) ($completedByMonth[$month] ?? 0),
                    ];
                })
                ->values();


            /*
            |--------------------------------------------------------------------------
            | MAINTENANCE TYPE
            |--------------------------------------------------------------------------
            */

            $preventiveCount = MaintenanceRequest::query()
                ->where('status', 'completed')
                ->whereNotNull('preventive_maintenance_schedule_id')
                ->count();

            $regularCount = MaintenanceRequest::query()
                ->where('status', 'completed')
                ->whereNull('preventive_maintenance_schedule_id')
                ->count();

            $maintenanceTypes = [
                [
                    'type' => 'Preventive Maintenance',
                    'total' => $preventiveCount,
                ],
                [
                    'type' => 'Regular Maintenance',
                    'total' => $regularCount,
                ],
            ];


            /*
            |--------------------------------------------------------------------------
            | MAINTENANCE STATUS
            |--------------------------------------------------------------------------
            */

            $statusCounts = MaintenanceRequest::query()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $maintenanceStatuses = $statusCounts
                ->map(function ($total, $status) {
                    return [
                        'status' => str($status)
                            ->replace('_', ' ')
                            ->title()
                            ->toString(),

                        'total' => (int) $total,
                    ];
                })
                ->values();

        return Inertia::render(
            'maintenance/index',
            [
                'records' => $records,

                'maintenanceRequests' => $maintenanceRequests,

                'types' => $types,

                'departments' => $departments,

                'maintenanceTrend' => $maintenanceTrend,

                'maintenanceTypes' => $maintenanceTypes,

                'maintenanceStatuses' => $maintenanceStatuses,
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


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): RedirectResponse {

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

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
        | NORMALIZE COSTS
        |--------------------------------------------------------------------------
        |
        | Empty cost fields must become 0 instead of NULL.
        |
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


        /*
        |--------------------------------------------------------------------------
        | SAVE NORMALIZED COSTS
        |--------------------------------------------------------------------------
        */

        $validated['labor_cost'] =
            $laborCost;

        $validated['parts_cost'] =
            $partsCost;

        $validated['other_cost'] =
            $otherCost;


        /*
        |--------------------------------------------------------------------------
        | CALCULATE TOTAL COST
        |--------------------------------------------------------------------------
        */

        $validated['total_cost'] =
            $laborCost +
            $partsCost +
            $otherCost;


        /*
        |--------------------------------------------------------------------------
        | CREATE MAINTENANCE RECORD
        |--------------------------------------------------------------------------
        */

        $record =
            MaintenanceRecord::create(
                $validated
            );


        /*
        |--------------------------------------------------------------------------
        | UPDATE ASSET STATUS
        |--------------------------------------------------------------------------
        |
        | If maintenance actually starts, automatically put the asset
        | into UNDER MAINTENANCE status.
        |
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


        /*
        |--------------------------------------------------------------------------
        | COMPLETED MAINTENANCE
        |--------------------------------------------------------------------------
        |
        | If the maintenance was already completed, make sure the asset
        | is returned to ACTIVE unless it was already disposed/lost.
        |
        */

        if (
            $asset &&
            $validated['status'] ===
            'completed' &&
            ! in_array(
                $asset->status,
                [
                    'disposed',
                    'lost',
                ],
                true
            )
        ) {

            $asset->update([
                'status' => 'active',
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'maintenance.index'
            )
            ->with(
                'success',
                'Maintenance record created successfully.'
            );
    }

    /*
|--------------------------------------------------------------------------
| SHOW
|--------------------------------------------------------------------------
*/

    public function show(
        MaintenanceRecord $maintenanceRecord
    ): Response {

        $maintenanceRecord->load([
            'asset',
            'maintenanceType',
            'department',
            'requestedBy',
            'assignedTo',
        ]);

        return Inertia::render(
            'maintenance/show',
            [
                'record' => $maintenanceRecord,
            ]
        );
    }

    /*
|--------------------------------------------------------------------------
| SCHEDULE
|--------------------------------------------------------------------------
*/

    public function schedule(): Response
    {
        $records = MaintenanceRecord::query()
            ->with([
                'asset:id,asset_code,name',
                'maintenanceType:id,name,code',
                'department:id,name,code',
                'assignedTo:id,name',
            ])
            ->whereNotNull('scheduled_date')
            ->whereNotIn('status', [
                'cancelled',
            ])
            ->orderBy('scheduled_date')
            ->get();

        $preventiveSchedules =
            PreventiveMaintenanceSchedule::query()
            ->with([
                'asset:id,asset_code,name,department_id',
                'asset.department:id,name,code',
                'assignedTo:id,name',
            ])
            ->where('status', 'active')
            ->whereNotNull('next_due_date')
            ->orderBy('next_due_date')
            ->get();

        return Inertia::render(
            'maintenance/schedule',
            [
                'records' => $records,
                'preventiveSchedules' => $preventiveSchedules,
            ]
        );
    }



    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE HISTORY
    |--------------------------------------------------------------------------
    */

    public function history(): Response
    {
        $requests = MaintenanceRequest::query()
            ->with([
                'asset:id,asset_code,name,department_id',
                'asset.department:id,name,code',

                'requestedBy:id,name',

                'completedBy:id,name',

                'preventiveMaintenanceSchedule:id,title,frequency_type,frequency_value',

                'workLogs' => function ($query) {
                    $query
                        ->with([
                            'performedBy:id,name',
                        ])
                        ->latest('id');
                },
            ])
            ->where('status', 'completed')
            ->latest('completed_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render(
            'maintenance/history',
            [
                'requests' => $requests,
            ]
        );
    }
}
