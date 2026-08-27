<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'maintenance_requests',
            function (Blueprint $table) {

                $table->foreignId(
                    'preventive_maintenance_schedule_id'
                )
                    ->nullable()
                    ->after('asset_id')
                    ->constrained(
                        'preventive_maintenance_schedules'
                    )
                    ->nullOnDelete();

                $table->index(
                    'preventive_maintenance_schedule_id'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'maintenance_requests',
            function (Blueprint $table) {

                $table->dropForeign([
                    'preventive_maintenance_schedule_id'
                ]);

                $table->dropIndex([
                    'preventive_maintenance_schedule_id'
                ]);

                $table->dropColumn(
                    'preventive_maintenance_schedule_id'
                );
            }
        );
    }
};
