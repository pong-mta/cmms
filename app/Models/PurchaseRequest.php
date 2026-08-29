<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'operation_request_id',
        'purpose',
        'justification',
        'requested_date',
    ];

    protected $casts = [
        'requested_date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | OPERATION REQUEST
    |--------------------------------------------------------------------------
    */

    public function operationRequest(): BelongsTo
    {
        return $this->belongsTo(
            OperationRequest::class,
            'operation_request_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ITEMS
    |--------------------------------------------------------------------------
    */

    public function items(): HasMany
    {
        return $this->hasMany(
            PurchaseRequestItem::class,
            'purchase_request_id'
        );
    }
}