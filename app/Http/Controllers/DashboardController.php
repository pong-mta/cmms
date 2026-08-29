<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the unified LGU Operations dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'users' => User::count(),
            'departments' => Department::count(),
            'roles' => Role::count(),

            // Temporary values until the request/task modules exist.
            'requests' => 0,
            'pending' => 0,
            'in_progress' => 0,
            'completed' => 0,
            'overdue' => 0,
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}