<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceWorkLog extends Model
{
    protected $fillable = [
        'maintenance_request_id',
        'performed_by',
        'work_performed',
        'materials_used',
        'remarks',
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

    /*
    |--------------------------------------------------------------------------
    | PERFORMED BY
    |--------------------------------------------------------------------------
    */

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'performed_by'
        );
    }
}
