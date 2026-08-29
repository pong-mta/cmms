<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestType extends Model
{
    protected $fillable = [

        'code',

        'name',

        'category',

        'description',

        'icon',

        'workflow',

        'requires_items',

        'requires_cost',

        'requires_attachment',

        'active',

        'sort_order',

    ];


    protected $casts = [

        'requires_items' =>
            'boolean',

        'requires_cost' =>
            'boolean',

        'requires_attachment' =>
            'boolean',

        'active' =>
            'boolean',

        'sort_order' =>
            'integer',

    ];


    /*
    |--------------------------------------------------------------------------
    | SERVICE REQUESTS
    |--------------------------------------------------------------------------
    */

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(
            ServiceRequest::class
        );
    }
}