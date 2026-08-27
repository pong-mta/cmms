<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY status ENUM(
                'submitted',
                'assessment',
                'for_head_review',
                'for_gso_review',
                'for_budget_review',
                'for_accounting_review',
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
        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY status ENUM(
                'submitted',
                'assessment',
                'for_head_review',
                'for_gso_review',
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
