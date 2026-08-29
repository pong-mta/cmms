<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'step_order',
        'name',
        'code',
        'department_id',
        'role_id',
        'assignment_type',
        'action',
        'description',
        'is_required',
    ];

    protected $casts = [
        'step_order' => 'integer',
        'is_required' => 'boolean',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(
            Workflow::class
        );
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            Department::class
        );
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(
            Role::class
        );
    }
}