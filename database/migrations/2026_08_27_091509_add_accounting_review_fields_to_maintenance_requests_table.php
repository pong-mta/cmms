<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->foreignId('accounting_reviewed_by')
                ->nullable()
                ->after('budget_remarks')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('accounting_reviewed_at')
                ->nullable()
                ->after('accounting_reviewed_by');

            $table->string('accounting_reference_no')
                ->nullable()
                ->after('accounting_reviewed_at');

            $table->text('accounting_remarks')
                ->nullable()
                ->after('accounting_reference_no');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->dropForeign(['accounting_reviewed_by']);

            $table->dropColumn([
                'accounting_reviewed_by',
                'accounting_reviewed_at',
                'accounting_reference_no',
                'accounting_remarks',
            ]);
        });
    }
};
