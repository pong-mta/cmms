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
        $user = $request->user()->load([
            'department',
            'roles',
        ]);

        $departmentId = $user->department_id;

        /*
        |--------------------------------------------------------------------------
        | EMPTY DEFAULTS
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
        | USER WITHOUT DEPARTMENT
        |--------------------------------------------------------------------------
        |
        | Do not expose another department's operational data.
        |
        */

        if (!$departmentId) {
            return Inertia::render('dashboard', [
                'user' => $user,
                'stats' => $stats,
                'maintenanceStatuses' => $maintenanceStatuses,
                'monthlyMaintenance' => $monthlyMaintenance,
                'recentMaintenance' => $recentMaintenance,
                'pendingActions' => $pendingActions,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT ASSETS
        |--------------------------------------------------------------------------
        */

        $assetQuery = Asset::query()
            ->where('department_id', $departmentId);

        $stats['assets'] = $assetQuery->count();


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT MAINTENANCE RECORDS
        |--------------------------------------------------------------------------
        */

        $maintenanceQuery = MaintenanceRecord::query()
            ->where('department_id', $departmentId);

        $stats['maintenance'] =
            (clone $maintenanceQuery)->count();


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT MAINTENANCE REQUESTS
        |--------------------------------------------------------------------------
        */

        $requestQuery = MaintenanceRequest::query()
            ->where('department_id', $departmentId);

        $stats['requests'] =
            (clone $requestQuery)->count();


        /*
        |--------------------------------------------------------------------------
        | PENDING REQUESTS
        |--------------------------------------------------------------------------
        */

        $pendingStatuses = [
            'pending',
            'approved',
            'assigned',
            'in_progress',
        ];

        $stats['pending'] =
            (clone $requestQuery)
                ->whereIn('status', $pendingStatuses)
                ->count();


        /*
        |--------------------------------------------------------------------------
        | COMPLETED REQUESTS
        |--------------------------------------------------------------------------
        */

        $stats['completed'] =
            (clone $requestQuery)
                ->where('status', 'completed')
                ->count();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE STATUS CHART
        |--------------------------------------------------------------------------
        |
        | Uses MaintenanceRequest because its status represents the
        | workflow of a maintenance request.
        |
        */

        $statusCounts =
            (clone $requestQuery)
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->orderBy('status')
                ->pluck('total', 'status');


        $maintenanceStatuses =
            $statusCounts
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


        /*
        |--------------------------------------------------------------------------
        | MONTHLY MAINTENANCE TREND
        |--------------------------------------------------------------------------
        |
        | Last 12 months.
        |
        */

        $monthlyResults =
            (clone $maintenanceQuery)
                ->selectRaw("
                    DATE_FORMAT(created_at, '%Y-%m') as month_key,
                    COUNT(*) as total
                ")
                ->where(
                    'created_at',
                    '>=',
                    now()->subMonths(11)->startOfMonth()
                )
                ->groupBy('month_key')
                ->orderBy('month_key')
                ->pluck('total', 'month_key');


        $monthlyMaintenance = collect();


        for ($i = 11; $i >= 0; $i--) {

            $date = now()
                ->copy()
                ->subMonths($i);

            $monthKey = $date->format('Y-m');

            $monthlyMaintenance->push([
                'month' => $date->format('M Y'),

                'total' => (int) (
                    $monthlyResults[$monthKey] ?? 0
                ),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | RECENT MAINTENANCE
        |--------------------------------------------------------------------------
        */

        $recentMaintenance =
            (clone $maintenanceQuery)
                ->with([
                    'asset:id,asset_code,name',
                ])
                ->latest('created_at')
                ->limit(8)
                ->get([
                    'id',
                    'asset_id',
                    'status',
                    'priority',
                    'created_at',
                    'completed_at',
                ])
                ->map(function ($record) {

                    return [
                        'id' => $record->id,

                        'title' =>
                            'Maintenance Record',

                        'status' =>
                            $record->status,

                        'priority' =>
                            $record->priority,

                        'created_at' =>
                            $record->created_at?->toISOString(),

                        'completed_at' =>
                            $record->completed_at?->toISOString(),

                        'asset' =>
                            $record->asset
                                ? [
                                    'id' =>
                                        $record->asset->id,

                                    'asset_code' =>
                                        $record->asset->asset_code,

                                    'name' =>
                                        $record->asset->name,
                                ]
                                : null,
                    ];
                })
                ->values();


        /*
        |--------------------------------------------------------------------------
        | PENDING ACTIONS
        |--------------------------------------------------------------------------
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
                ->latest('requested_at')
                ->limit(8)
                ->get([
                    'id',
                    'request_code',
                    'asset_id',
                    'title',
                    'priority',
                    'status',
                    'requested_at',
                ]);


        $pendingActions =
            $pendingRequests
                ->map(function ($request) {

                    return [
                        'id' =>
                            $request->id,

                        'title' =>
                            $request->title
                                ?: 'Maintenance Request',

                        'description' =>
                            $request->asset
                                ? $request->asset->asset_code .
                                    ' — ' .
                                    $request->asset->name
                                : 'Maintenance request requires attention',

                        'type' =>
                            'maintenance_request',

                        'href' =>
                            '/maintenance-requests/' .
                            $request->id,
                    ];
                })
                ->values();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE DUE
        |--------------------------------------------------------------------------
        |
        | Preventive maintenance schedules belong to assets.
        |
        | We therefore scope them through the asset's department.
        |
        */

        $stats['maintenance_due'] =
            PreventiveMaintenanceSchedule::query()
                ->whereHas('asset', function ($query) use ($departmentId) {

                    $query->where(
                        'department_id',
                        $departmentId
                    );

                })
                ->whereNotNull('next_due_date')
                ->whereBetween(
                    'next_due_date',
                    [
                        now()->startOfDay(),
                        now()->addDays(30)->endOfDay(),
                    ]
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | OVERDUE
        |--------------------------------------------------------------------------
        |
        | Preventive maintenance schedules whose next due date
        | has already passed.
        |
        */

        $stats['overdue'] =
            PreventiveMaintenanceSchedule::query()
                ->whereHas('asset', function ($query) use ($departmentId) {

                    $query->where(
                        'department_id',
                        $departmentId
                    );

                })
                ->whereNotNull('next_due_date')
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

        return Inertia::render('dashboard', [

            /*
            |--------------------------------------------------------------------------
            | USER
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
            | CHARTS
            |--------------------------------------------------------------------------
            */

            'maintenanceStatuses' =>
                $maintenanceStatuses,

            'monthlyMaintenance' =>
                $monthlyMaintenance,


            /*
            |--------------------------------------------------------------------------
            | ACTIVITY
            |--------------------------------------------------------------------------
            */

            'recentMaintenance' =>
                $recentMaintenance,

            'pendingActions' =>
                $pendingActions,
        ]);
    }
}