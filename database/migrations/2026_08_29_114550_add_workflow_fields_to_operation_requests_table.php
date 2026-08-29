<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operation_requests', function (Blueprint $table) {

            $table->foreignId('workflow_id')
                ->nullable()
                ->after('department_id')
                ->constrained('workflows')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('current_workflow_step_id')
                ->nullable()
                ->after('workflow_id')
                ->constrained('workflow_steps')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->index('workflow_id');
            $table->index('current_workflow_step_id');
        });
    }

    public function down(): void
    {
        Schema::table('operation_requests', function (Blueprint $table) {
            $table->dropForeign([
                'workflow_id',
            ]);

            $table->dropForeign([
                'current_workflow_step_id',
            ]);

            $table->dropIndex([
                'operation_requests_workflow_id_index',
            ]);

            $table->dropIndex([
                'operation_requests_current_workflow_step_id_index',
            ]);

            $table->dropColumn([
                'workflow_id',
                'current_workflow_step_id',
            ]);
        });
    }
};