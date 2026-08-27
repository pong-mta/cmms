<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            $table->enum('assignment_type', [
                'lgu_employee',
                'external_contractor',
            ])
                ->nullable()
                ->after('assigned_to');

            $table->string('external_contractor')
                ->nullable()
                ->after('assignment_type');

            $table->string('external_worker_name')
                ->nullable()
                ->after('external_contractor');

            $table->string('external_worker_contact')
                ->nullable()
                ->after('external_worker_name');

            $table->text('assignment_remarks')
                ->nullable()
                ->after('external_worker_contact');

            $table->timestamp('assigned_at')
                ->nullable()
                ->after('assignment_remarks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {

            $table->dropColumn([
                'assignment_type',
                'external_contractor',
                'external_worker_name',
                'external_worker_contact',
                'assignment_remarks',
                'assigned_at',
            ]);
        });
    }
};
