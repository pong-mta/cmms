<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\MaintenanceRecord;
use App\Models\MaintenanceRequest;

class Asset extends Model
{
    protected $fillable = [
        'asset_code',
        'name',
        'serial_number',
        'description',
        'asset_category_id',
        'department_id',
        'assigned_to',
        'location',
        'acquisition_date',
        'acquisition_cost',
        'supplier',
        'warranty_start',
        'warranty_end',
        'status',
        'condition',
        'notes',
    ];

    protected $casts = [
        'acquisition_date' => 'date',
        'acquisition_cost' => 'decimal:2',
        'warranty_start' => 'date',
        'warranty_end' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            AssetCategory::class,
            'asset_category_id'
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
    | ASSIGNED USER
    |--------------------------------------------------------------------------
    */

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_to'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE RECORDS
    |--------------------------------------------------------------------------
    |
    | These tables don't exist yet.
    | We'll create them later.
    |
    */

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(
            MaintenanceRecord::class,
            'asset_id'
        )->latest();
    }

    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(
            MaintenanceRequest::class,
            'asset_id'
        )->latest();
    }

    /*
|--------------------------------------------------------------------------
| PREVENTIVE MAINTENANCE
|--------------------------------------------------------------------------
*/

    public function preventiveMaintenanceSchedules(): HasMany
    {
        return $this->hasMany(
            PreventiveMaintenanceSchedule::class,
            'asset_id'
        )->latest('next_due_date');
    }
}
