<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->string('description');

            $table->decimal('quantity', 12, 2)
                ->default(1);

            $table->string('unit', 50)
                ->nullable();

            $table->decimal('estimated_unit_price', 15, 2)
                ->default(0);

            $table->decimal('estimated_amount', 15, 2)
                ->default(0);

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->index('service_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_items');
    }
};