<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'operation_request_id',
        'workflow_step_id',
        'user_id',
        'action',
        'reason',
    ];

    public function operationRequest(): BelongsTo
    {
        return $this->belongsTo(
            OperationRequest::class
        );
    }

    public function workflowStep(): BelongsTo
    {
        return $this->belongsTo(
            WorkflowStep::class
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}