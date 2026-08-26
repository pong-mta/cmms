<?php

namespace App\Models;

use App\Models\MaintenanceRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceType extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(
            MaintenanceRecord::class
        );
    }
}
