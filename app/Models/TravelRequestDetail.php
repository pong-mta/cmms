<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelRequestDetail extends Model
{
    protected $fillable = [
        'service_request_id',

        'destination',

        'purpose',

        'departure_date',

        'return_date',

        'mode_of_travel',

        'accommodation',

        'estimated_transportation',

        'estimated_accommodation',

        'estimated_meals',

        'estimated_registration',

        'estimated_other',

        'estimated_total',

        'funding_source',

        'remarks',
    ];

    protected $casts = [
        'departure_date' => 'date',

        'return_date' => 'date',

        'estimated_transportation' => 'decimal:2',

        'estimated_accommodation' => 'decimal:2',

        'estimated_meals' => 'decimal:2',

        'estimated_registration' => 'decimal:2',

        'estimated_other' => 'decimal:2',

        'estimated_total' => 'decimal:2',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(
            ServiceRequest::class
        );
    }
}