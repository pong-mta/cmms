<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();

            $table->string('request_code')->unique();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->restrictOnDelete();

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            $table->foreignId('requested_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');

            $table->text('description');

            $table->enum('priority', [
                'low',
                'normal',
                'high',
                'critical',
            ])->default('normal');

            $table->enum('status', [
                'submitted',
                'reviewing',
                'approved',
                'assigned',
                'in_progress',
                'completed',
                'rejected',
                'cancelled',
            ])->default('submitted');

            $table->timestamp('requested_at')
                ->nullable();

            $table->timestamp('approved_at')
                ->nullable();

            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->index([
                'asset_id',
                'status',
            ]);

            $table->index([
                'department_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
