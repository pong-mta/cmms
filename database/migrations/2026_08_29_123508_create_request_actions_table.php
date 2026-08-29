<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_actions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('operation_request_id')
                ->constrained('operation_requests')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('workflow_step_id')
                ->nullable()
                ->constrained('workflow_steps')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('action', 50);

            $table->text('reason')->nullable();

            $table->timestamps();

            $table->index('operation_request_id');
            $table->index('workflow_step_id');
            $table->index('user_id');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_actions');
    }
};