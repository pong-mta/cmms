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
        Schema::create(
            'preventive_maintenance_schedules',
            function (Blueprint $table) {

                $table->id();

                /*
                |--------------------------------------------------------------------------
                | ASSET
                |--------------------------------------------------------------------------
                */

                $table->foreignId(
                    'asset_id'
                )
                    ->constrained(
                        'assets'
                    )
                    ->cascadeOnDelete();


                /*
                |--------------------------------------------------------------------------
                | SCHEDULE
                |--------------------------------------------------------------------------
                */

                $table->string(
                    'title'
                );

                $table->text(
                    'description'
                )->nullable();


                /*
                |--------------------------------------------------------------------------
                | FREQUENCY
                |--------------------------------------------------------------------------
                */

                $table->enum(
                    'frequency_type',
                    [
                        'days',
                        'weeks',
                        'months',
                        'years',
                    ]
                );

                $table->unsignedInteger(
                    'frequency_value'
                );


                /*
                |--------------------------------------------------------------------------
                | DATES
                |--------------------------------------------------------------------------
                */

                $table->date(
                    'start_date'
                );

                $table->date(
                    'next_due_date'
                );

                $table->timestamp(
                    'last_completed_at'
                )->nullable();


                /*
                |--------------------------------------------------------------------------
                | STATUS
                |--------------------------------------------------------------------------
                */

                $table->enum(
                    'status',
                    [
                        'active',
                        'paused',
                        'completed',
                        'cancelled',
                    ]
                )->default(
                    'active'
                );


                /*
                |--------------------------------------------------------------------------
                | RESPONSIBILITY
                |--------------------------------------------------------------------------
                */

                $table->foreignId(
                    'assigned_to'
                )
                    ->nullable()
                    ->constrained(
                        'users'
                    )
                    ->nullOnDelete();


                /*
                |--------------------------------------------------------------------------
                | NOTES
                |--------------------------------------------------------------------------
                */

                $table->text(
                    'notes'
                )->nullable();

                $table->timestamps();


                /*
                |--------------------------------------------------------------------------
                | INDEXES
                |--------------------------------------------------------------------------
                */

                $table->index(
                    [
                        'asset_id',
                        'status',
                    ]
                );

                $table->index(
                    'next_due_date'
                );
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'preventive_maintenance_schedules'
        );
    }
};
