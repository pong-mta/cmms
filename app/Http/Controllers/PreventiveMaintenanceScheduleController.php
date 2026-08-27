<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\PreventiveMaintenanceSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PreventiveMaintenanceScheduleController extends Controller
{

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

        return back()->with(
            'success',
            'Preventive maintenance schedule created successfully.'
        );
    }
}
