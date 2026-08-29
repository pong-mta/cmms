<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReimbursementItem extends Model
{
    protected $fillable = [
        'service_request_id',
        'expense_date',
        'expense_type',
        'description',
        'amount',
        'receipt_reference',
        'remarks',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(
            ServiceRequest::class
        );
    }
}