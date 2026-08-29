<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OperationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_no',
        'user_id',
        'department_id',
        'type',
        'title',
        'description',
        'priority',
        'status',

        'workflow_id',
        'current_workflow_step_id',
    ];

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT
    |--------------------------------------------------------------------------
    */

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function purchaseRequest(): HasOne
    {
        return $this->hasOne(
            PurchaseRequest::class,
            'operation_request_id'
        );
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(
            Workflow::class
        );
    }

    public function currentWorkflowStep(): BelongsTo
    {
        return $this->belongsTo(
            WorkflowStep::class,
            'current_workflow_step_id'
        );
    }

    public function actions(): HasMany
    {
        return $this->hasMany(
            RequestAction::class
        )->latest();
    }
}