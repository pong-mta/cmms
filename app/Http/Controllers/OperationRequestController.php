<?php

namespace App\Http\Controllers;

use App\Models\OperationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'purchaseRequest',
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
    public function show(
        OperationRequest $operationRequest
    ): Response {
        $operationRequest->load([
            'user',
            'department',
            'purchaseRequest.items',
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
        /*
        |--------------------------------------------------------------------------
        | COMMON REQUEST VALIDATION
        |--------------------------------------------------------------------------
        */

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
        | PURCHASE REQUEST VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($request->input('type') === 'purchase') {
            $purchaseValidated = $request->validate([
                'purpose' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'justification' => [
                    'required',
                    'string',
                ],

                'requested_date' => [
                    'required',
                    'date',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'items.*.description' => [
                    'required',
                    'string',
                    'max:1000',
                ],

                'items.*.quantity' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],

                'items.*.unit' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'items.*.estimated_unit_cost' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
            ]);

            $validated = array_merge(
                $validated,
                $purchaseValidated
            );
        }

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
        | DATABASE TRANSACTION
        |--------------------------------------------------------------------------
        |
        | Everything must succeed together.
        |
        */

        $operationRequest = DB::transaction(function () use (
            $validated,
            $user
        ) {
            /*
            |--------------------------------------------------------------------------
            | CREATE COMMON REQUEST
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
            | PURCHASE REQUEST
            |--------------------------------------------------------------------------
            */

            if ($validated['type'] === 'purchase') {

                $purchaseRequest =
                    $operationRequest->purchaseRequest()->create([
                        'purpose' => $validated['purpose'],

                        'justification' =>
                            $validated['justification'],

                        'requested_date' =>
                            $validated['requested_date'],
                    ]);

                /*
                |--------------------------------------------------------------------------
                | PURCHASE ITEMS
                |--------------------------------------------------------------------------
                */

                foreach ($validated['items'] as $item) {

                    $quantity = (float) $item['quantity'];

                    $unitCost =
                        (float) $item['estimated_unit_cost'];

                    $estimatedAmount =
                        round(
                            $quantity * $unitCost,
                            2
                        );

                    $purchaseRequest->items()->create([
                        'description' =>
                            $item['description'],

                        'quantity' =>
                            $quantity,

                        'unit' =>
                            $item['unit'],

                        'estimated_unit_cost' =>
                            $unitCost,

                        'estimated_amount' =>
                            $estimatedAmount,
                    ]);
                }
            }

            return $operationRequest;
        });

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
            $number =
                'REQ-' .
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
                $number
            )->exists()
        );

        return $number;
    }
}