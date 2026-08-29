<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_types', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | BASIC INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('code')
                ->unique();

            $table->string('name');

            $table->string('category');


            /*
            |--------------------------------------------------------------------------
            | DESCRIPTION
            |--------------------------------------------------------------------------
            */

            $table->text('description')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | UI / WORKFLOW
            |--------------------------------------------------------------------------
            */

            $table->string('icon')
                ->nullable();

            $table->string('workflow')
                ->default('standard');

            $table->boolean('requires_items')
                ->default(false);

            $table->boolean('requires_cost')
                ->default(false);

            $table->boolean('requires_attachment')
                ->default(false);

            $table->boolean('active')
                ->default(true);


            /*
            |--------------------------------------------------------------------------
            | SORTING
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('sort_order')
                ->default(0);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_types');
    }
};