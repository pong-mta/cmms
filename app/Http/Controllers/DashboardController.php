<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceRecord;
use App\Models\MaintenanceRequest;
use App\Models\PreventiveMaintenanceSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the department dashboard.
     */
    public function index(Request $request): Response
    {
        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $user = $request->user()->load([
            'department',
            'roles',
        ]);

        $departmentId = $user->department_id;


        /*
        |--------------------------------------------------------------------------
        | DEFAULT DASHBOARD DATA
        |--------------------------------------------------------------------------
        */

        $stats = [
            'assets' => 0,
            'maintenance' => 0,
            'requests' => 0,
            'pending' => 0,
            'maintenance_due' => 0,
            'overdue' => 0,
            'completed' => 0,
        ];

        $maintenanceStatuses = collect();

        $monthlyMaintenance = collect();

        $recentMaintenance = collect();

        $pendingActions = collect();


        /*
        |--------------------------------------------------------------------------
        | NO DEPARTMENT
        |--------------------------------------------------------------------------
        |
        | A user without a department must not see another department's
        | operational data.
        |
        */

        if (!$departmentId) {
            return Inertia::render('dashboard', [
                'user' => $user,

                'stats' => $stats,

                'maintenanceStatuses' =>
                    $maintenanceStatuses,

                'monthlyMaintenance' =>
                    $monthlyMaintenance,

                'recentMaintenance' =>
                    $recentMaintenance,

                'pendingActions' =>
                    $pendingActions,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT ASSETS
        |--------------------------------------------------------------------------
        */

        $assetQuery = Asset::query()
            ->where(
                'department_id',
                $departmentId
            );

        $stats['assets'] =
            (clone $assetQuery)->count();


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT MAINTENANCE REQUESTS
        |--------------------------------------------------------------------------
        |
        | MaintenanceRequest already contains department_id.
        |
        */

        $requestQuery = MaintenanceRequest::query()
            ->where(
                'department_id',
                $departmentId
            );


        /*
        |--------------------------------------------------------------------------
        | TOTAL REQUESTS
        |--------------------------------------------------------------------------
        */

        $stats['requests'] =
            (clone $requestQuery)->count();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE
        |--------------------------------------------------------------------------
        |
        | Completed maintenance requests are treated as completed
        | maintenance activities.
        |
        */

        $stats['maintenance'] =
            (clone $requestQuery)
                ->where(
                    'status',
                    'completed'
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | PENDING
        |--------------------------------------------------------------------------
        |
        | These are requests that still require action.
        |
        */

        $pendingStatuses = [
            'pending',
            'approved',
            'assigned',
            'in_progress',
            'for_head_review',
            'for_budget_review',
            'for_gso_review',
            'for_accounting_review',
            'for_mayor_review',
        ];


        $stats['pending'] =
            (clone $requestQuery)
                ->whereIn(
                    'status',
                    $pendingStatuses
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | COMPLETED
        |--------------------------------------------------------------------------
        */

        $stats['completed'] =
            (clone $requestQuery)
                ->where(
                    'status',
                    'completed'
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE STATUS CHART
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | For Head Review    1
        | Completed          5
        |
        */

        $statusCounts =
            (clone $requestQuery)
                ->selectRaw(
                    'status, COUNT(*) as total'
                )
                ->groupBy('status')
                ->orderBy('status')
                ->pluck(
                    'total',
                    'status'
                );


        $maintenanceStatuses =
            $statusCounts
                ->map(
                    function ($total, $status) {

                        return [
                            'status' => str($status)
                                ->replace(
                                    '_',
                                    ' '
                                )
                                ->title()
                                ->toString(),

                            'total' =>
                                (int) $total,
                        ];
                    }
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | MONTHLY MAINTENANCE TREND
        |--------------------------------------------------------------------------
        |
        | Last 12 months.
        |
        | Uses completed_at because this chart represents completed
        | maintenance activity.
        |
        */

        $monthlyResults =
            (clone $requestQuery)
                ->selectRaw(
                    "
                    DATE_FORMAT(
                        completed_at,
                        '%Y-%m'
                    ) as month_key,

                    COUNT(*) as total
                    "
                )
                ->where(
                    'status',
                    'completed'
                )
                ->whereNotNull(
                    'completed_at'
                )
                ->where(
                    'completed_at',
                    '>=',
                    now()
                        ->subMonths(11)
                        ->startOfMonth()
                )
                ->groupBy(
                    'month_key'
                )
                ->orderBy(
                    'month_key'
                )
                ->pluck(
                    'total',
                    'month_key'
                );


        $monthlyMaintenance =
            collect();


        for (
            $i = 11;
            $i >= 0;
            $i--
        ) {

            $date = now()
                ->copy()
                ->subMonths($i);


            $monthKey =
                $date->format('Y-m');


            $monthlyMaintenance->push([
                'month' =>
                    $date->format('M Y'),

                'total' =>
                    (int) (
                        $monthlyResults[
                            $monthKey
                        ] ?? 0
                    ),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | RECENT MAINTENANCE
        |--------------------------------------------------------------------------
        |
        | Show the most recently completed maintenance requests
        | belonging to this department.
        |
        */

        $recentMaintenance =
            (clone $requestQuery)
                ->with([
                    'asset:id,asset_code,name',
                ])
                ->where(
                    'status',
                    'completed'
                )
                ->whereNotNull(
                    'completed_at'
                )
                ->latest(
                    'completed_at'
                )
                ->limit(8)
                ->get([
                    'id',
                    'request_code',
                    'asset_id',
                    'title',
                    'status',
                    'priority',
                    'requested_at',
                    'completed_at',
                ])
                ->map(
                    function ($request) {

                        return [
                            'id' =>
                                $request->id,

                            'request_code' =>
                                $request->request_code,

                            'title' =>
                                $request->title
                                ?: 'Maintenance Request',

                            'status' =>
                                $request->status,

                            'priority' =>
                                $request->priority,

                            'created_at' =>
                                $request
                                    ->requested_at
                                    ?->toISOString(),

                            'completed_at' =>
                                $request
                                    ->completed_at
                                    ?->toISOString(),

                            'asset' =>
                                $request->asset
                                    ? [
                                        'id' =>
                                            $request
                                                ->asset
                                                ->id,

                                        'asset_code' =>
                                            $request
                                                ->asset
                                                ->asset_code,

                                        'name' =>
                                            $request
                                                ->asset
                                                ->name,
                                    ]
                                    : null,
                        ];
                    }
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | PENDING ACTIONS
        |--------------------------------------------------------------------------
        |
        | Department requests that still need attention.
        |
        */

        $pendingRequests =
            (clone $requestQuery)
                ->whereIn(
                    'status',
                    $pendingStatuses
                )
                ->with([
                    'asset:id,asset_code,name',
                ])
                ->latest(
                    'requested_at'
                )
                ->limit(8)
                ->get([
                    'id',
                    'request_code',
                    'asset_id',
                    'title',
                    'description',
                    'priority',
                    'status',
                    'requested_at',
                ]);


        $pendingActions =
            $pendingRequests
                ->map(
                    function ($request) {

                        return [
                            'id' =>
                                $request->id,

                            'request_code' =>
                                $request
                                    ->request_code,

                            'title' =>
                                $request->title
                                ?: 'Maintenance Request',

                            'description' =>
                                $request->asset
                                    ? $request
                                        ->asset
                                        ->asset_code
                                        . ' — ' .
                                        $request
                                            ->asset
                                            ->name
                                    : (
                                        $request
                                            ->description
                                        ?: 'Maintenance request requires attention'
                                    ),

                            'type' =>
                                'maintenance_request',

                            'status' =>
                                $request->status,

                            'priority' =>
                                $request->priority,

                            'requested_at' =>
                                $request
                                    ->requested_at
                                    ?->toISOString(),

                            'href' =>
                                '/maintenance-requests/' .
                                $request->id,
                        ];
                    }
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | PREVENTIVE MAINTENANCE
        |--------------------------------------------------------------------------
        |
        | Upcoming preventive maintenance within the next 30 days.
        |
        | Overdue schedules are counted separately.
        |
        */

        $preventiveMaintenanceQuery =
            PreventiveMaintenanceSchedule::query()
                ->whereHas(
                    'asset',
                    function ($query) use ($departmentId) {

                        $query->where(
                            'department_id',
                            $departmentId
                        );
                    }
                )
                ->whereNotNull(
                    'next_due_date'
                );


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE DUE
        |--------------------------------------------------------------------------
        */

        $stats['maintenance_due'] =
            (clone $preventiveMaintenanceQuery)
                ->whereBetween(
                    'next_due_date',
                    [
                        now()->startOfDay(),

                        now()
                            ->addDays(30)
                            ->endOfDay(),
                    ]
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | OVERDUE
        |--------------------------------------------------------------------------
        */

        $stats['overdue'] =
            (clone $preventiveMaintenanceQuery)
                ->where(
                    'next_due_date',
                    '<',
                    now()->startOfDay()
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | RETURN DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'dashboard',
            [

                /*
                |--------------------------------------------------------------------------
                | AUTHENTICATED USER
                |--------------------------------------------------------------------------
                */

                'user' => $user,


                /*
                |--------------------------------------------------------------------------
                | STATISTICS
                |--------------------------------------------------------------------------
                */

                'stats' => $stats,


                /*
                |--------------------------------------------------------------------------
                | MAINTENANCE STATUS CHART
                |--------------------------------------------------------------------------
                */

                'maintenanceStatuses' =>
                    $maintenanceStatuses,


                /*
                |--------------------------------------------------------------------------
                | MONTHLY MAINTENANCE CHART
                |--------------------------------------------------------------------------
                */

                'monthlyMaintenance' =>
                    $monthlyMaintenance,


                /*
                |--------------------------------------------------------------------------
                | RECENT MAINTENANCE
                |--------------------------------------------------------------------------
                */

                'recentMaintenance' =>
                    $recentMaintenance,


                /*
                |--------------------------------------------------------------------------
                | PENDING ACTIONS
                |--------------------------------------------------------------------------
                */

                'pendingActions' =>
                    $pendingActions,
            ]
        );
    }
}