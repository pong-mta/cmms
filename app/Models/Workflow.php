<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_type_id',
        'name',
        'code',
        'version',
        'is_active',
        'description',
    ];

    protected $casts = [
        'version' => 'integer',
        'is_active' => 'boolean',
    ];

    public function requestType(): BelongsTo
    {
        return $this->belongsTo(
            RequestType::class
        );
    }

    public function steps(): HasMany
    {
        return $this->hasMany(
            WorkflowStep::class
        )->orderBy('step_order');
    }
}