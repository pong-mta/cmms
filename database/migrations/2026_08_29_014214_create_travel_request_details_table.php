<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_request_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete()
                ->unique();

            $table->string('destination');

            $table->text('purpose')
                ->nullable();

            $table->date('departure_date');

            $table->date('return_date');

            $table->string('mode_of_travel')
                ->nullable();

            $table->string('accommodation')
                ->nullable();

            $table->decimal('estimated_transportation', 15, 2)
                ->default(0);

            $table->decimal('estimated_accommodation', 15, 2)
                ->default(0);

            $table->decimal('estimated_meals', 15, 2)
                ->default(0);

            $table->decimal('estimated_registration', 15, 2)
                ->default(0);

            $table->decimal('estimated_other', 15, 2)
                ->default(0);

            $table->decimal('estimated_total', 15, 2)
                ->default(0);

            $table->string('funding_source')
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->index('service_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_request_details');
    }
};