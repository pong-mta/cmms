<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            $table->foreignId('mayor_reviewed_by')
                ->nullable()
                ->after('accounting_remarks')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('mayor_reviewed_at')
                ->nullable()
                ->after('mayor_reviewed_by');

            $table->text('mayor_remarks')
                ->nullable()
                ->after('mayor_reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            $table->dropForeign([
                'mayor_reviewed_by',
            ]);

            $table->dropColumn([
                'mayor_reviewed_by',
                'mayor_reviewed_at',
                'mayor_remarks',
            ]);
        });
    }
};
