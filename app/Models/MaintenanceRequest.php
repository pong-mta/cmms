<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class MaintenanceRequest extends Model
{
    protected $fillable = [
        'request_code',

        'asset_id',
        'department_id',

        'requested_by',
        'assessed_by',
        'assigned_to',

        'title',
        'description',
        'priority',
        'status',

        'requested_at',
        'assessed_at',
        'approved_at',
        'started_at',
        'completed_at',

        'assessment',
        'work_scope',

        'estimated_labor_cost',
        'estimated_parts_cost',
        'estimated_other_cost',
        'estimated_total_cost',

        'head_reviewed_by',
        'head_reviewed_at',
        'head_remarks',

        'budget_reviewed_by',
        'budget_reviewed_at',
        'budget_remarks',

        'funding_source',
        'budget_amount',

        'remarks',

        'gso_reviewed_by',
        'gso_reviewed_at',
        'gso_remarks',

        'accounting_reviewed_by',
        'accounting_reviewed_at',
        'accounting_reference_no',
        'accounting_remarks',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'assessed_at' => 'datetime',
        'approved_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',

        'estimated_labor_cost' => 'decimal:2',
        'estimated_parts_cost' => 'decimal:2',
        'estimated_other_cost' => 'decimal:2',
        'estimated_total_cost' => 'decimal:2',

        'budget_amount' => 'decimal:2',
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
    | ASSESSED BY
    |--------------------------------------------------------------------------
    */

    public function assessedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assessed_by'
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


    /*
    |--------------------------------------------------------------------------
    | HEAD REVIEWED BY
    |--------------------------------------------------------------------------
    */

    public function headReviewedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'head_reviewed_by'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | BUDGET REVIEWED BY
    |--------------------------------------------------------------------------
    */

    public function budgetReviewedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'budget_reviewed_by'
        );
    }

    /*
|--------------------------------------------------------------------------
| COST ITEMS
|--------------------------------------------------------------------------
*/

    public function costItems(): HasMany
    {
        return $this->hasMany(
            MaintenanceRequestCostItem::class
        );
    }

    public function gsoReviewedBy()
    {
        return $this->belongsTo(
            User::class,
            'gso_reviewed_by'
        );
    }

    public function accountingReviewer()
    {
        return $this->belongsTo(
            User::class,
            'accounting_reviewed_by'
        );
    }
}
