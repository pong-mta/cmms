<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequestHistory extends Model
{
    protected $fillable = [
        'service_request_id',
        'user_id',
        'action',
        'from_status',
        'to_status',
        'remarks',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];


    /*
    |--------------------------------------------------------------------------
    | SERVICE REQUEST
    |--------------------------------------------------------------------------
    */

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(
            ServiceRequest::class,
            'service_request_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}