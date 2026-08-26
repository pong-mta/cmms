<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Department;
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
}
