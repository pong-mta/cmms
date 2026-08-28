<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\PreventiveMaintenanceSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\MaintenanceRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PreventiveMaintenanceScheduleController extends Controller
{

    /*
|--------------------------------------------------------------------------
| INDEX
|--------------------------------------------------------------------------
*/

    public function index(): Response
    {
        $schedules = PreventiveMaintenanceSchedule::query()
            ->with([
                'asset:id,asset_code,name,department_id',
                'asset.department:id,name,code',
                'assignedTo:id,name',
            ])
            ->with([
                'maintenanceRequests' => function ($query) {
                    $query
                        ->whereIn('status', [
                            'submitted',
                            'assessed',
                            'head_approved',
                            'gso_approved',
                            'budget_approved',
                            'accounting_approved',
                            'mayor_approved',
                            'assigned',
                            'in_progress',
                        ])
                        ->latest('id');
                },
            ])
            ->orderBy('next_due_date')
            ->get()
            ->map(function ($schedule) {
                $activeRequest = $schedule->maintenanceRequests->first();

                return [
                    'id' => $schedule->id,

                    'asset_id' => $schedule->asset_id,

                    'title' => $schedule->title,

                    'description' => $schedule->description,

                    'frequency_type' => $schedule->frequency_type,

                    'frequency_value' => $schedule->frequency_value,

                    'start_date' => $schedule->start_date,

                    'next_due_date' => $schedule->next_due_date,

                    'last_completed_at' => $schedule->last_completed_at,

                    'status' => $schedule->status,

                    'notes' => $schedule->notes,

                    'asset' => $schedule->asset,

                    'assigned_to' => $schedule->assignedTo,

                    'has_active_request' =>
                    $activeRequest !== null,

                    'active_request_id' =>
                    $activeRequest?->id,
                ];
            });

        return Inertia::render(
            'maintenance/preventive',
            [
                'schedules' => $schedules,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    public function create(
        Asset $asset
    ): Response {
        $users = User::query()
            ->where(
                'department_id',
                $asset->department_id
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_id',
            ]);

        return Inertia::render(
            'preventive-maintenance/create',
            [
                'asset' => $asset,
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
        Request $request,
        Asset $asset
    ): RedirectResponse {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'frequency_type' => [
                'required',
                'in:days,weeks,months,years',
            ],

            'frequency_value' => [
                'required',
                'integer',
                'min:1',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'next_due_date' => [
                'required',
                'date',
            ],

            'assigned_to' => [
                'nullable',
                'exists:users,id',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $asset->preventiveMaintenanceSchedules()->create(
            [
                'title' =>
                $validated['title'],

                'description' =>
                $validated['description']
                    ?? null,

                'frequency_type' =>
                $validated['frequency_type'],

                'frequency_value' =>
                $validated['frequency_value'],

                'start_date' =>
                $validated['start_date'],

                'next_due_date' =>
                $validated['next_due_date'],

                'status' =>
                'active',

                'assigned_to' =>
                $validated['assigned_to']
                    ?? null,

                'notes' =>
                $validated['notes']
                    ?? null,
            ]
        );

        return redirect()
            ->route(
                'assets.show',
                $asset
            )
            ->with(
                'success',
                'Preventive maintenance schedule created successfully.'
            );
    }


    public function createMaintenanceRequest(
        Request $request,
        PreventiveMaintenanceSchedule $schedule
    ): RedirectResponse {

        $schedule->load([
            'asset',
        ]);

        $asset = $schedule->asset;

        if (!$asset) {
            return back()->with(
                'error',
                'The asset assigned to this preventive maintenance schedule no longer exists.'
            );
        }

        /*
    |--------------------------------------------------------------------------
    | Prevent duplicate request for the same PM occurrence
    |--------------------------------------------------------------------------
    */

        $existingRequest = MaintenanceRequest::query()
            ->where(
                'preventive_maintenance_schedule_id',
                $schedule->id
            )
            ->whereIn(
                'status',
                [
                    'submitted',
                    'assessed',
                    'head_approved',
                    'gso_approved',
                    'budget_approved',
                    'accounting_approved',
                    'mayor_approved',
                    'assigned',
                    'in_progress',
                ]
            )
            ->first();

        if ($existingRequest) {
            return back()->with(
                'error',
                'A maintenance request already exists for this preventive maintenance schedule.'
            );
        }

        /*
    |--------------------------------------------------------------------------
    | Generate request code
    |--------------------------------------------------------------------------
    */

        $year = now()->year;

        $lastRequest = MaintenanceRequest::query()
            ->whereYear(
                'created_at',
                $year
            )
            ->orderByDesc('id')
            ->first();

        $sequence = 1;

        if ($lastRequest) {
            preg_match(
                '/(\d+)$/',
                $lastRequest->request_code,
                $matches
            );

            if (!empty($matches[1])) {
                $sequence = ((int) $matches[1]) + 1;
            }
        }

        $requestCode = sprintf(
            'MRQ-%d-%04d',
            $year,
            $sequence
        );

        /*
    |--------------------------------------------------------------------------
    | Create Maintenance Request
    |--------------------------------------------------------------------------
    */

        MaintenanceRequest::create([
            'request_code' =>
            $requestCode,

            'asset_id' =>
            $asset->id,

            'department_id' =>
            $asset->department_id,

            'requested_by' =>
            $request->user()->id,

            'title' =>
            $schedule->title,

            'description' =>
            $schedule->description,

            'priority' =>
            'normal',

            'status' =>
            'submitted',

            'requested_at' =>
            now(),

            'remarks' =>
            'Generated from Preventive Maintenance Schedule #' .
                $schedule->id,

            'preventive_maintenance_schedule_id' =>
            $schedule->id,
        ]);

        return back()->with(
            'success',
            'Maintenance request ' .
                $requestCode .
                ' created successfully.'
        );
    }

    /*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

    public function edit(
        PreventiveMaintenanceSchedule $schedule
    ): Response {

        $schedule->load([
            'asset',
        ]);

        $users = User::query()
            ->where(
                'department_id',
                $schedule->asset->department_id
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_id',
            ]);

        return Inertia::render(
            'preventive-maintenance/edit',
            [
                'schedule' => $schedule,
                'asset' => $schedule->asset,
                'users' => $users,
            ]
        );
    }

    /*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

    public function update(
        Request $request,
        PreventiveMaintenanceSchedule $schedule
    ): RedirectResponse {

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'frequency_type' => [
                'required',
                'in:days,weeks,months,years',
            ],

            'frequency_value' => [
                'required',
                'integer',
                'min:1',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'next_due_date' => [
                'required',
                'date',
            ],

            'assigned_to' => [
                'nullable',
                'exists:users,id',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $schedule->update([
            'title' =>
            $validated['title'],

            'description' =>
            $validated['description']
                ?? null,

            'frequency_type' =>
            $validated['frequency_type'],

            'frequency_value' =>
            $validated['frequency_value'],

            'start_date' =>
            $validated['start_date'],

            'next_due_date' =>
            $validated['next_due_date'],

            'assigned_to' =>
            $validated['assigned_to']
                ?? null,

            'notes' =>
            $validated['notes']
                ?? null,
        ]);

        return redirect()
            ->route(
                'maintenance.preventive'
            )
            ->with(
                'success',
                'Preventive maintenance schedule updated successfully.'
            );
    }


    /*
|--------------------------------------------------------------------------
| PAUSE
|--------------------------------------------------------------------------
*/

    public function pause(
        PreventiveMaintenanceSchedule $schedule
    ): RedirectResponse {

        if ($schedule->status !== 'active') {
            return back()->with(
                'error',
                'Only active preventive maintenance schedules can be paused.'
            );
        }

        $schedule->update([
            'status' => 'paused',
        ]);

        return back()->with(
            'success',
            'Preventive maintenance schedule paused successfully.'
        );
    }


    /*
|--------------------------------------------------------------------------
| RESUME
|--------------------------------------------------------------------------
*/

    public function resume(
        PreventiveMaintenanceSchedule $schedule
    ): RedirectResponse {

        if ($schedule->status !== 'paused') {
            return back()->with(
                'error',
                'Only paused preventive maintenance schedules can be resumed.'
            );
        }

        $schedule->update([
            'status' => 'active',
        ]);

        return back()->with(
            'success',
            'Preventive maintenance schedule resumed successfully.'
        );
    }


    /*
|--------------------------------------------------------------------------
| CANCEL
|--------------------------------------------------------------------------
*/

    public function cancel(
        PreventiveMaintenanceSchedule $schedule
    ): RedirectResponse {

        if (
            in_array(
                $schedule->status,
                [
                    'completed',
                    'cancelled',
                ],
                true
            )
        ) {
            return back()->with(
                'error',
                'This preventive maintenance schedule can no longer be cancelled.'
            );
        }

        $schedule->update([
            'status' => 'cancelled',
        ]);

        return back()->with(
            'success',
            'Preventive maintenance schedule cancelled successfully.'
        );
    }
}
