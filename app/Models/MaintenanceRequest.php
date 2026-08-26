<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRequest extends Model
{
    protected $fillable = [
        'request_code',
        'asset_id',
        'department_id',
        'requested_by',
        'assigned_to',
        'title',
        'description',
        'priority',
        'status',
        'requested_at',
        'approved_at',
        'started_at',
        'completed_at',
        'remarks',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | ASSET
    |--------------------------------------------------------------------------
    */

    public function asset(): BelongsTo
    {
        return $this->belongsTo(
            Asset::class
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT
    |--------------------------------------------------------------------------
    */

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            Department::class
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REQUESTED BY
    |--------------------------------------------------------------------------
    */

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requested_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGNED TO
    |--------------------------------------------------------------------------
    */

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_to'
        );
    }
}
