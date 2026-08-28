<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequestAttachment extends Model
{
    protected $fillable = [
        'service_request_id',
        'uploaded_by',
        'original_name',
        'file_name',
        'disk',
        'path',
        'mime_type',
        'size',
        'description',
    ];


    protected $casts = [
        'size' => 'integer',
    ];


    /*
    |--------------------------------------------------------------------------
    | SERVICE REQUEST
    |--------------------------------------------------------------------------
    */

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(
            ServiceRequest::class,
            'service_request_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | UPLOADED BY
    |--------------------------------------------------------------------------
    */

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'uploaded_by'
        );
    }
}