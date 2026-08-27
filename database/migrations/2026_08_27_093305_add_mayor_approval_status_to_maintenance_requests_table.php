<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY COLUMN status ENUM(
                'submitted',
                'assessment',
                'for_head_review',
                'for_gso_review',
                'for_budget_review',
                'for_accounting_review',
                'for_mayor_approval',
                'budget_approved',
                'ready_for_work',
                'assigned',
                'in_progress',
                'completed',
                'rejected',
                'cancelled'
            ) NOT NULL DEFAULT 'submitted'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY COLUMN status ENUM(
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
            ) NOT NULL DEFAULT 'submitted'
        ");
    }
};
