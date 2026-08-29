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
        Schema::create('operation_requests', function (Blueprint $table) {
            $table->id();

            $table->string('request_no')->unique();

            /*
            |--------------------------------------------------------------------------
            | REQUESTER
            |--------------------------------------------------------------------------
            */

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | DEPARTMENT
            |--------------------------------------------------------------------------
            */

            $table->foreignId('department_id')
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | REQUEST INFORMATION
            |--------------------------------------------------------------------------
            */

            $table->string('type')->default('general');

            $table->string('title');

            $table->text('description')->nullable();

            $table->enum('priority', [
                'low',
                'normal',
                'high',
                'urgent',
            ])->default('normal');

            $table->enum('status', [
                'draft',
                'submitted',
                'pending',
                'approved',
                'rejected',
                'completed',
            ])->default('draft');

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index('type');
            $table->index('priority');
            $table->index('status');
            $table->index('department_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operation_requests');
    }
};