<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workflow_id')
                ->constrained('workflows')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unsignedInteger('step_order');

            $table->string('name');

            $table->string('code');

            /*
            |--------------------------------------------------------------------------
            | ASSIGNMENT
            |--------------------------------------------------------------------------
            |
            | These may point to an office/department, role, or a dynamic
            | requesting department.
            |
            */

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('role_id')
                ->nullable()
                ->constrained('roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | DYNAMIC ASSIGNMENT
            |--------------------------------------------------------------------------
            */

            $table->string('assignment_type')
                ->default('fixed');

            /*
            | fixed
            | requesting_department
            | committee
            | system
            */

            $table->string('action');

            $table->text('description')->nullable();

            $table->boolean('is_required')->default(true);

            $table->timestamps();

            $table->unique([
                'workflow_id',
                'step_order',
            ]);

            $table->index('department_id');
            $table->index('role_id');
            $table->index('assignment_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_steps');
    }
};