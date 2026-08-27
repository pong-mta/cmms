<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_request_cost_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('maintenance_request_id')
                ->constrained('maintenance_requests')
                ->cascadeOnDelete();

            $table->enum('type', [
                'labor',
                'parts',
                'other',
            ]);

            $table->string('description');

            $table->decimal('quantity', 15, 2)
                ->default(1);

            $table->string('unit')
                ->default('unit');

            $table->decimal('unit_cost', 15, 2)
                ->default(0);

            $table->decimal('total_cost', 15, 2)
                ->default(0);

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->index([
                'maintenance_request_id',
                'type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'maintenance_request_cost_items'
        );
    }
};
