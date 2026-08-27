<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Change maintenance request status workflow
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
            ) NOT NULL DEFAULT 'submitted'
        ");
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Restore previous status workflow
        |--------------------------------------------------------------------------
        */

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
