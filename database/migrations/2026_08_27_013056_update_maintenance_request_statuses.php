<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convert existing statuses first.
        DB::statement("
            UPDATE maintenance_requests
            SET status = 'assessment'
            WHERE status = 'reviewing'
        ");

        DB::statement("
            UPDATE maintenance_requests
            SET status = 'head_approved'
            WHERE status = 'approved'
        ");

        // Change the status enum.
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
            ) NOT NULL DEFAULT 'submitted'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE maintenance_requests
            MODIFY status ENUM(
                'submitted',
                'reviewing',
                'approved',
                'assigned',
                'in_progress',
                'completed',
                'rejected',
                'cancelled'
            ) NOT NULL DEFAULT 'submitted'
        ");
    }
};
