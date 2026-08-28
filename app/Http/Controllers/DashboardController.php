<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceRecord;
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
        | Default dashboard data
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

        $recentMaintenance = collect();

        $pendingActions = collect();


        /*
        |--------------------------------------------------------------------------
        | No department
        |--------------------------------------------------------------------------
        |
        | A user without a department should not see another department's
        | operational data.
        |
        */

        if (!$departmentId) {
            return Inertia::render('dashboard', [
                'user' => $user,
                'stats' => $stats,
                'recentMaintenance' => $recentMaintenance,
                'pendingActions' => $pendingActions,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | ASSETS
        |--------------------------------------------------------------------------
        */

        $assetQuery = Asset::query()
            ->where('department_id', $departmentId);

        $stats['assets'] = $assetQuery->count();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE REQUESTS
        |--------------------------------------------------------------------------
        */

        $maintenanceRequestQuery = MaintenanceRequest::query()
            ->whereHas('asset', function ($query) use ($departmentId) {
                $query->where(
                    'department_id',
                    $departmentId
                );
            });


        $stats['requests'] =
            (clone $maintenanceRequestQuery)->count();


        /*
        |--------------------------------------------------------------------------
        | PENDING MAINTENANCE REQUESTS
        |--------------------------------------------------------------------------
        */

        $pendingStatuses = [
            'pending',
            'approved',
            'assigned',
            'in_progress',
        ];


        $stats['pending'] =
            (clone $maintenanceRequestQuery)
                ->whereIn(
                    'status',
                    $pendingStatuses
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | COMPLETED MAINTENANCE REQUESTS
        |--------------------------------------------------------------------------
        */

        $stats['completed'] =
            (clone $maintenanceRequestQuery)
                ->where(
                    'status',
                    'completed'
                )
                ->count();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE RECORDS
        |--------------------------------------------------------------------------
        */

        $maintenanceRecordQuery =
            MaintenanceRecord::query()
                ->where('department_id', $departmentId);


        $stats['maintenance'] =
            (clone $maintenanceRecordQuery)
                ->count();


        /*
        |--------------------------------------------------------------------------
        | RECENT MAINTENANCE
        |--------------------------------------------------------------------------
        */

        $recentMaintenance =
            (clone $maintenanceRecordQuery)
                ->with([
                    'asset:id,asset_code,name',
                ])
                ->latest()
                ->limit(8)
                ->get([
                    'id',
                    'asset_id',
                    'status',
                    'created_at',
                ])
                ->map(function ($record) {

                    return [
                        'id' => $record->id,

                        'title' =>
                            'Maintenance Record',

                        'status' =>
                            $record->status,

                        'completed_at' =>
                            null,

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
                });


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE DUE
        |--------------------------------------------------------------------------
        |
        | We will connect this to your preventive-maintenance schedule
        | once we confirm the exact schedule columns.
        |
        */

        $stats['maintenance_due'] = 0;


        /*
        |--------------------------------------------------------------------------
        | OVERDUE
        |--------------------------------------------------------------------------
        */

        $stats['overdue'] = 0;


        /*
        |--------------------------------------------------------------------------
        | PENDING ACTIONS
        |--------------------------------------------------------------------------
        */

        $pendingRequests =
            (clone $maintenanceRequestQuery)
                ->whereIn(
                    'status',
                    $pendingStatuses
                )
                ->with([
                    'asset:id,asset_code,name',
                ])
                ->latest()
                ->limit(5)
                ->get();


        $pendingActions =
            $pendingRequests
                ->map(function ($request) {

                    return [
                        'id' =>
                            $request->id,

                        'title' =>
                            'Maintenance Request',

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
        | RETURN DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render('dashboard', [

            'user' => $user,

            'stats' => $stats,

            'recentMaintenance' =>
                $recentMaintenance,

            'pendingActions' =>
                $pendingActions,

        ]);
    }
}