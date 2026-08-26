<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | IDENTIFICATION
            |--------------------------------------------------------------------------
            */

            $table->string('asset_code')->unique();

            $table->string('name');

            $table->string('serial_number')
                ->nullable()
                ->unique();

            $table->string('description')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | CLASSIFICATION
            |--------------------------------------------------------------------------
            */

            $table->foreignId('asset_category_id')
                ->constrained('asset_categories')
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | DEPARTMENT
            |--------------------------------------------------------------------------
            */

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | RESPONSIBLE USER
            |--------------------------------------------------------------------------
            */

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | LOCATION
            |--------------------------------------------------------------------------
            |
            | We'll make a proper locations table later.
            | For now, keep the location as text.
            |
            */

            $table->string('location')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | ACQUISITION
            |--------------------------------------------------------------------------
            */

            $table->date('acquisition_date')
                ->nullable();

            $table->decimal('acquisition_cost', 15, 2)
                ->nullable();

            $table->string('supplier')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | WARRANTY
            |--------------------------------------------------------------------------
            */

            $table->date('warranty_start')
                ->nullable();

            $table->date('warranty_end')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | ASSET STATUS
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'active',
                'under_maintenance',
                'out_of_service',
                'disposed',
                'lost',
            ])->default('active');


            /*
            |--------------------------------------------------------------------------
            | CONDITION
            |--------------------------------------------------------------------------
            */

            $table->enum('condition', [
                'excellent',
                'good',
                'fair',
                'poor',
                'critical',
            ])->default('good');


            /*
            |--------------------------------------------------------------------------
            | NOTES
            |--------------------------------------------------------------------------
            */

            $table->text('notes')
                ->nullable();


            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index('status');
            $table->index('department_id');
            $table->index('asset_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
