<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | PRIMARY KEY
            |--------------------------------------------------------------------------
            */

            $table->id();


            /*
            |--------------------------------------------------------------------------
            | REQUEST INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('request_code')
                ->unique();

            $table->string('request_type');

            $table->string('subject');

            $table->text('description')
                ->nullable();

            $table->string('priority')
                ->default('normal');

            $table->string('status')
                ->default('pending');


            /*
            |--------------------------------------------------------------------------
            | REQUESTER
            |--------------------------------------------------------------------------
            */

            $table->foreignId('requested_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('department_id')
                ->constrained('departments')
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | ASSIGNMENT
            |--------------------------------------------------------------------------
            */

            $table->foreignId('assigned_department_id')
                ->nullable()
                ->constrained(
                    'departments'
                )
                ->nullOnDelete();

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained(
                    'users'
                )
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | RELATED INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('location')
                ->nullable();

            $table->foreignId('asset_id')
                ->nullable()
                ->constrained(
                    'assets'
                )
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | WORKFLOW
            |--------------------------------------------------------------------------
            */

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained(
                    'users'
                )
                ->nullOnDelete();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained(
                    'users'
                )
                ->nullOnDelete();

            $table->foreignId('completed_by')
                ->nullable()
                ->constrained(
                    'users'
                )
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | WORKFLOW DATES
            |--------------------------------------------------------------------------
            */

            $table->timestamp('requested_at')
                ->nullable();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->timestamp('approved_at')
                ->nullable();

            $table->timestamp('assigned_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | REMARKS
            |--------------------------------------------------------------------------
            */

            $table->text('remarks')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */

            $table->timestamps();


            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index([
                'department_id',
                'status',
            ]);

            $table->index([
                'requested_by',
                'status',
            ]);

            $table->index([
                'assigned_department_id',
                'status',
            ]);

            $table->index([
                'assigned_to',
                'status',
            ]);

            $table->index('request_type');

            $table->index('priority');

            $table->index('requested_at');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'service_requests'
        );
    }
};