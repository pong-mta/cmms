<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\MaintenanceRequest;

class PreventiveMaintenanceSchedule extends Model
{
    protected $fillable = [
        'asset_id',
        'title',
        'description',

        'frequency_type',
        'frequency_value',

        'start_date',
        'next_due_date',
        'last_completed_at',

        'status',

        'assigned_to',

        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'next_due_date' => 'date',
        'last_completed_at' => 'datetime',

        'frequency_value' => 'integer',
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
    | ASSIGNED USER
    |--------------------------------------------------------------------------
    */

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_to'
        );
    }

    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(
            MaintenanceRequest::class,
            'preventive_maintenance_schedule_id'
        );
    }
}
