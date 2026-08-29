<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reimbursement_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->date('expense_date');

            $table->string('expense_type');

            $table->string('description');

            $table->decimal('amount', 15, 2)
                ->default(0);

            $table->string('receipt_reference')
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->index('service_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reimbursement_items');
    }
};