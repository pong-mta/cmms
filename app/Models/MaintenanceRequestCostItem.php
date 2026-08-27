<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRequestCostItem extends Model
{
    protected $fillable = [
        'maintenance_request_id',
        'type',
        'description',
        'quantity',
        'unit',
        'unit_cost',
        'total_cost',
        'remarks',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE REQUEST
    |--------------------------------------------------------------------------
    */

    public function maintenanceRequest(): BelongsTo
    {
        return $this->belongsTo(
            MaintenanceRequest::class
        );
    }
}
