<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | SUPERVISOR ASSESSMENT
            |--------------------------------------------------------------------------
            */

            $table->foreignId('assessed_by')
                ->nullable()
                ->after('requested_by')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('assessed_at')
                ->nullable()
                ->after('assessed_by');

            $table->text('assessment')
                ->nullable()
                ->after('assessed_at');

            $table->text('work_scope')
                ->nullable()
                ->after('assessment');


            /*
            |--------------------------------------------------------------------------
            | ESTIMATED COST
            |--------------------------------------------------------------------------
            */

            $table->decimal('estimated_labor_cost', 15, 2)
                ->default(0)
                ->after('work_scope');

            $table->decimal('estimated_parts_cost', 15, 2)
                ->default(0)
                ->after('estimated_labor_cost');

            $table->decimal('estimated_other_cost', 15, 2)
                ->default(0)
                ->after('estimated_parts_cost');

            $table->decimal('estimated_total_cost', 15, 2)
                ->default(0)
                ->after('estimated_other_cost');


            /*
            |--------------------------------------------------------------------------
            | DEPARTMENT HEAD REVIEW
            |--------------------------------------------------------------------------
            */

            $table->foreignId('head_reviewed_by')
                ->nullable()
                ->after('estimated_total_cost')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('head_reviewed_at')
                ->nullable()
                ->after('head_reviewed_by');

            $table->text('head_remarks')
                ->nullable()
                ->after('head_reviewed_at');


            /*
            |--------------------------------------------------------------------------
            | BUDGET OFFICE REVIEW
            |--------------------------------------------------------------------------
            */

            $table->foreignId('budget_reviewed_by')
                ->nullable()
                ->after('head_remarks')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('budget_reviewed_at')
                ->nullable()
                ->after('budget_reviewed_by');

            $table->text('budget_remarks')
                ->nullable()
                ->after('budget_reviewed_at');

            $table->string('funding_source')
                ->nullable()
                ->after('budget_remarks');

            $table->decimal('budget_amount', 15, 2)
                ->nullable()
                ->after('funding_source');
        });
    }


    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            $table->dropForeign([
                'assessed_by',
            ]);

            $table->dropForeign([
                'head_reviewed_by',
            ]);

            $table->dropForeign([
                'budget_reviewed_by',
            ]);

            $table->dropColumn([
                'assessed_by',
                'assessed_at',
                'assessment',
                'work_scope',

                'estimated_labor_cost',
                'estimated_parts_cost',
                'estimated_other_cost',
                'estimated_total_cost',

                'head_reviewed_by',
                'head_reviewed_at',
                'head_remarks',

                'budget_reviewed_by',
                'budget_reviewed_at',
                'budget_remarks',
                'funding_source',
                'budget_amount',
            ]);
        });
    }
};
