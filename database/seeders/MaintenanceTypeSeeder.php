<?php

namespace Database\Seeders;

use App\Models\MaintenanceType;
use Illuminate\Database\Seeder;

class MaintenanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Preventive Maintenance',
                'code' => 'PM',
                'description' => 'Scheduled maintenance performed to prevent equipment failure and extend asset life.',
            ],
            [
                'name' => 'Corrective Maintenance',
                'code' => 'CM',
                'description' => 'Maintenance performed to correct a detected fault, defect, or equipment failure.',
            ],
            [
                'name' => 'Emergency Maintenance',
                'code' => 'EM',
                'description' => 'Urgent maintenance required to restore critical equipment or operations.',
            ],
            [
                'name' => 'Inspection',
                'code' => 'INS',
                'description' => 'Inspection or assessment performed to determine the condition and operational readiness of an asset.',
            ],
        ];

        foreach ($types as $type) {
            MaintenanceType::updateOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'description' => $type['description'],
                    'status' => true,
                ]
            );
        }
    }
}
