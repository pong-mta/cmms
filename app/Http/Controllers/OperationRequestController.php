<?php

namespace App\Http\Controllers;

use App\Models\OperationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OperationRequestController extends Controller
{
    /**
     * Display all requests.
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

    /**
     * Show the create request form.
     */
    public function create(): Response
    {
        return Inertia::render('operations/requests/create');
    }

    /**
     * Display a specific request.
     */
    public function show(OperationRequest $operationRequest): Response
    {
        $operationRequest->load([
            'user',
            'department',
        ]);

        return Inertia::render('operations/requests/show', [
            'request' => $operationRequest,
        ]);
    }

    /**
     * Store a new request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => [
                'required',
                'string',
                'max:50',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'priority' => [
                'required',
                'in:low,normal,high,urgent',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATED USER
        |--------------------------------------------------------------------------
        */

        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT CHECK
        |--------------------------------------------------------------------------
        */

        if (!$user->department_id) {
            return back()
                ->withErrors([
                    'department' => 'Your account is not assigned to a department.',
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

        $operationRequest = OperationRequest::create([
            'request_no' => $this->generateRequestNumber(),

            'user_id' => $user->id,

            'department_id' => $user->department_id,

            'type' => $validated['type'],

            'title' => $validated['title'],

            'description' => $validated['description'] ?? null,

            'priority' => $validated['priority'],

            'status' => 'submitted',
        ]);

        /*
        |--------------------------------------------------------------------------
        | REDIRECT TO REQUEST DETAILS
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'operations.requests.show',
                $operationRequest
            )
            ->with(
                'success',
                'Request submitted successfully.'
            );
    }

    /**
     * Generate a unique request number.
     */
    private function generateRequestNumber(): string
    {
        do {
            $number = 'REQ-' .
                now()->format('Y') .
                '-' .
                str_pad(
                    (string) random_int(1, 999999),
                    6,
                    '0',
                    STR_PAD_LEFT,
                );
        } while (
            OperationRequest::where(
                'request_no',
                $number,
            )->exists()
        );

        return $number;
    }
}