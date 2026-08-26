<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    /**
     * Display all assets.
     */
    public function index(): Response
    {
        $assets = Asset::query()
            ->with([
                'category',
                'department',
                'assignedUser',
            ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $categories = AssetCategory::query()
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

        return Inertia::render('assets/index', [
            'assets' => $assets,
            'categories' => $categories,
            'departments' => $departments,
        ]);
    }


    /**
     * Show the asset registration form.
     */
    public function create(): Response
    {
        $categories = AssetCategory::query()
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
            ->with('department')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'department_id',
            ]);

        return Inertia::render('assets/create', [
            'categories' => $categories,
            'departments' => $departments,
            'users' => $users,
        ]);
    }


    /**
     * Store a newly registered asset.
     */
    public function store(
        Request $request
    ): RedirectResponse {

        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | IDENTIFICATION
            |--------------------------------------------------------------------------
            */

            'asset_code' => [
                'required',
                'string',
                'max:100',
                'unique:assets,asset_code',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:assets,serial_number',
            ],

            'description' => [
                'nullable',
                'string',
            ],


            /*
            |--------------------------------------------------------------------------
            | CLASSIFICATION
            |--------------------------------------------------------------------------
            */

            'asset_category_id' => [
                'required',
                'exists:asset_categories,id',
            ],


            /*
            |--------------------------------------------------------------------------
            | DEPARTMENT
            |--------------------------------------------------------------------------
            */

            'department_id' => [
                'nullable',
                'exists:departments,id',
            ],


            /*
            |--------------------------------------------------------------------------
            | ASSIGNED USER
            |--------------------------------------------------------------------------
            */

            'assigned_to' => [
                'nullable',
                'exists:users,id',
            ],


            /*
            |--------------------------------------------------------------------------
            | LOCATION
            |--------------------------------------------------------------------------
            */

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],


            /*
            |--------------------------------------------------------------------------
            | ACQUISITION
            |--------------------------------------------------------------------------
            */

            'acquisition_date' => [
                'nullable',
                'date',
            ],

            'acquisition_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'supplier' => [
                'nullable',
                'string',
                'max:255',
            ],


            /*
            |--------------------------------------------------------------------------
            | WARRANTY
            |--------------------------------------------------------------------------
            */

            'warranty_start' => [
                'nullable',
                'date',
            ],

            'warranty_end' => [
                'nullable',
                'date',
                'after_or_equal:warranty_start',
            ],


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            'status' => [
                'required',
                'in:active,under_maintenance,out_of_service,disposed,lost',
            ],


            /*
            |--------------------------------------------------------------------------
            | CONDITION
            |--------------------------------------------------------------------------
            */

            'condition' => [
                'required',
                'in:excellent,good,fair,poor,critical',
            ],


            /*
            |--------------------------------------------------------------------------
            | NOTES
            |--------------------------------------------------------------------------
            */

            'notes' => [
                'nullable',
                'string',
            ],
        ]);


        Asset::create($validated);


        return redirect()
            ->route('assets.index')
            ->with(
                'success',
                'Asset registered successfully.'
            );
    }

    /**
     * Display a single asset.
     */
    public function show(Asset $asset): Response
    {
        $asset->load([
            'category',
            'department',
            'assignedUser',
        ]);

        return Inertia::render('assets/show', [
            'asset' => $asset,
        ]);
    }
}
