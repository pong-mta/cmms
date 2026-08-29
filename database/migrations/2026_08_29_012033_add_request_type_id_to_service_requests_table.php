<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'service_requests',
            function (Blueprint $table) {

                $table->foreignId(
                    'request_type_id'
                )
                    ->nullable()
                    ->after('id')
                    ->constrained(
                        'request_types'
                    )
                    ->nullOnDelete();

            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'service_requests',
            function (Blueprint $table) {

                $table->dropForeign([
                    'request_type_id'
                ]);

                $table->dropColumn(
                    'request_type_id'
                );

            }
        );
    }
};