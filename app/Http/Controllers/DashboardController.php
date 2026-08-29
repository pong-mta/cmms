<?php

namespace App\Http\Controllers;

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
       

        return Inertia::render(
            'dashboard',
            [

                'user' => $user,
            ]
        );
    }
}