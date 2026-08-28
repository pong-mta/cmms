<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_request_histories', function (Blueprint $table) {

            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('action');

            $table->string('from_status')
                ->nullable();

            $table->string('to_status')
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index([
                'service_request_id',
                'created_at',
            ]);

            $table->index('user_id');

            $table->index('action');

            $table->index('to_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'service_request_histories'
        );
    }
};