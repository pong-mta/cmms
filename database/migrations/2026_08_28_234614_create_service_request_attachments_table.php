<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_request_attachments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('original_name');

            $table->string('file_name');

            $table->string('disk')
                ->default('public');

            $table->string('path');

            $table->string('mime_type')
                ->nullable();

            $table->unsignedBigInteger('size')
                ->nullable();

            $table->text('description')
                ->nullable();

            $table->timestamps();

            $table->index('service_request_id');

            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'service_request_attachments'
        );
    }
};