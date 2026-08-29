<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ServiceRequest extends Model
{
    protected $fillable = [
        'request_code',
        'request_type',
        'request_type_id',

        'subject',
        'description',

        'priority',
        'status',

        'requested_by',
        'department_id',

        'assigned_department_id',
        'assigned_to',

        'location',
        'asset_id',

        'reviewed_by',
        'approved_by',
        'completed_by',

        'requested_at',
        'reviewed_at',
        'approved_at',
        'assigned_at',
        'completed_at',

        'remarks',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];


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
    | DEPARTMENT
    |--------------------------------------------------------------------------
    */

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            Department::class,
            'department_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ASSIGNED DEPARTMENT
    |--------------------------------------------------------------------------
    */

    public function assignedDepartment(): BelongsTo
    {
        return $this->belongsTo(
            Department::class,
            'assigned_department_id'
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
    | ASSET
    |--------------------------------------------------------------------------
    */

    public function asset(): BelongsTo
    {
        return $this->belongsTo(
            Asset::class,
            'asset_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REVIEWED BY
    |--------------------------------------------------------------------------
    */

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | APPROVED BY
    |--------------------------------------------------------------------------
    */

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | COMPLETED BY
    |--------------------------------------------------------------------------
    */

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'completed_by'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REQUEST TYPE
    |--------------------------------------------------------------------------
    */

    public function requestType(): BelongsTo
    {
        return $this->belongsTo(
            RequestType::class,
            'request_type_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | HISTORIES
    |--------------------------------------------------------------------------
    */

    public function histories(): HasMany
    {
        return $this->hasMany(
            ServiceRequestHistory::class,
            'service_request_id'
        )->latest();
    }


    /*
    |--------------------------------------------------------------------------
    | ATTACHMENTS
    |--------------------------------------------------------------------------
    */

    public function attachments(): HasMany
    {
        return $this->hasMany(
            ServiceRequestAttachment::class,
            'service_request_id'
        )->latest();
    }


    /*
    |--------------------------------------------------------------------------
    | PURCHASE ITEMS
    |--------------------------------------------------------------------------
    */

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(
            PurchaseRequestItem::class,
            'service_request_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REIMBURSEMENT ITEMS
    |--------------------------------------------------------------------------
    */

    public function reimbursementItems(): HasMany
    {
        return $this->hasMany(
            ReimbursementItem::class,
            'service_request_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | TRAVEL DETAILS
    |--------------------------------------------------------------------------
    */

    public function travelDetails(): HasOne
    {
        return $this->hasOne(
            TravelRequestDetail::class,
            'service_request_id'
        );
    }
}