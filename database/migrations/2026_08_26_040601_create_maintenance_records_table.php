<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | IDENTIFICATION
            |--------------------------------------------------------------------------
            */

            $table->string('maintenance_code')->unique();


            /*
            |--------------------------------------------------------------------------
            | ASSET
            |--------------------------------------------------------------------------
            */

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | MAINTENANCE TYPE
            |--------------------------------------------------------------------------
            */

            $table->foreignId('maintenance_type_id')
                ->constrained('maintenance_types')
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
            | REQUESTED BY
            |--------------------------------------------------------------------------
            */

            $table->foreignId('requested_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | ASSIGNED TO
            |--------------------------------------------------------------------------
            */

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | MAINTENANCE DATES
            |--------------------------------------------------------------------------
            */

            $table->date('scheduled_date')
                ->nullable();

            $table->dateTime('started_at')
                ->nullable();

            $table->dateTime('completed_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | PROBLEM / WORK
            |--------------------------------------------------------------------------
            */

            $table->string('problem')
                ->nullable();

            $table->text('description')
                ->nullable();

            $table->text('work_performed')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | COST
            |--------------------------------------------------------------------------
            */

            $table->decimal('labor_cost', 15, 2)
                ->default(0);

            $table->decimal('parts_cost', 15, 2)
                ->default(0);

            $table->decimal('other_cost', 15, 2)
                ->default(0);

            $table->decimal('total_cost', 15, 2)
                ->default(0);


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'pending',
                'scheduled',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('pending');


            /*
            |--------------------------------------------------------------------------
            | PRIORITY
            |--------------------------------------------------------------------------
            */

            $table->enum('priority', [
                'low',
                'normal',
                'high',
                'critical',
            ])->default('normal');


            /*
            |--------------------------------------------------------------------------
            | RESULT / NOTES
            |--------------------------------------------------------------------------
            */

            $table->text('remarks')
                ->nullable();


            $table->timestamps();


            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index('asset_id');
            $table->index('maintenance_type_id');
            $table->index('department_id');
            $table->index('status');
            $table->index('priority');
            $table->index('scheduled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
