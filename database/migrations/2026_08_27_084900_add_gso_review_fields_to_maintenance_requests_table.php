<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->foreignId('gso_reviewed_by')
                ->nullable()
                ->after('head_remarks')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('gso_reviewed_at')
                ->nullable()
                ->after('gso_reviewed_by');

            $table->text('gso_remarks')
                ->nullable()
                ->after('gso_reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->dropForeign(['gso_reviewed_by']);

            $table->dropColumn([
                'gso_reviewed_by',
                'gso_reviewed_at',
                'gso_remarks',
            ]);
        });
    }
};
