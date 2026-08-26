<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    protected $fillable = [
        'maintenance_code',

        'asset_id',
        'maintenance_type_id',
        'department_id',

        'requested_by',
        'assigned_to',

        'scheduled_date',
        'started_at',
        'completed_at',

        'problem',
        'description',
        'work_performed',

        'labor_cost',
        'parts_cost',
        'other_cost',
        'total_cost',

        'status',
        'priority',

        'remarks',
    ];

    protected $casts = [
        'scheduled_date' => 'date',

        'started_at' => 'datetime',
        'completed_at' => 'datetime',

        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'other_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
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
    | MAINTENANCE TYPE
    |--------------------------------------------------------------------------
    */

    public function maintenanceType(): BelongsTo
    {
        return $this->belongsTo(
            MaintenanceType::class
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
