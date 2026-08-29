<?php

namespace App\Http\Controllers;

use App\Models\OperationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OperationRequestController extends Controller
{
    /**
     * Display requests.
     */
    public function index(Request $request): Response
    {
        $requests = OperationRequest::with([
            'user',
            'department',
        ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('operations/requests/index', [
            'requests' => $requests,
        ]);
    }
}