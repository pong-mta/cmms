<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Add GSO Review Status
        |--------------------------------------------------------------------------
        |
        | Current:
        |
        | for_head_review
        |       ↓
        | for_budget_review
        |
        | New:
        |
        | for_head_review
        |       ↓
        | for_gso_review
        |       ↓
        | for_budget_review
        |
        */

        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY status ENUM(
                'submitted',
                'assessment',
                'for_head_review',
                'for_gso_review',
                'head_approved',
                'for_budget_review',
                'budget_approved',
                'ready_for_work',
                'assigned',
                'in_progress',
                'completed',
                'rejected',
                'cancelled'
            )
            NOT NULL
            DEFAULT 'submitted'
        ");
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Remove GSO Review Status
        |--------------------------------------------------------------------------
        */

        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY status ENUM(
                'submitted',
                'assessment',
                'for_head_review',
                'head_approved',
                'for_budget_review',
                'budget_approved',
                'ready_for_work',
                'assigned',
                'in_progress',
                'completed',
                'rejected',
                'cancelled'
            )
            NOT NULL
            DEFAULT 'submitted'
        ");
    }
};
