<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE service_requests
            MODIFY status ENUM(
                'pending',
                'for_head_review',
                'approved',

                'for_gso_review',
                'for_budget_review',
                'for_accounting_review',
                'for_mayor_approval',

                'ready_for_work',
                'assigned',
                'in_progress',

                'for_procurement',
                'for_delivery',
                'for_inspection',
                'for_payment',
                'paid',

                'for_financial_review',
                'for_disbursement',
                'reimbursed',

                'for_travel_authorization',
                'travel_authorized',
                'traveling',
                'for_liquidation',
                'liquidated',

                'completed',
                'rejected',
                'cancelled'
            )
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE service_requests
            MODIFY status ENUM(
                'pending',
                'for_head_review',
                'approved',

                'for_gso_review',
                'for_budget_review',
                'for_accounting_review',
                'for_mayor_approval',

                'ready_for_work',
                'assigned',
                'in_progress',

                'completed',
                'rejected',
                'cancelled'
            )
            NOT NULL DEFAULT 'pending'
        ");
    }
};