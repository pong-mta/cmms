<?php

namespace Database\Seeders;

use App\Models\AssetCategory;
use Illuminate\Database\Seeder;

class AssetCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Vehicles',
                'code' => 'VEH',
                'description' => 'Municipal vehicles and transportation equipment.',
            ],
            [
                'name' => 'Heavy Equipment',
                'code' => 'HE',
                'description' => 'Heavy machinery and construction equipment.',
            ],
            [
                'name' => 'Office Equipment',
                'code' => 'OE',
                'description' => 'Computers, printers, scanners, and other office equipment.',
            ],
            [
                'name' => 'IT Equipment',
                'code' => 'IT',
                'description' => 'Servers, network equipment, communication devices, and related IT assets.',
            ],
            [
                'name' => 'Emergency Equipment',
                'code' => 'EMG',
                'description' => 'Emergency response and disaster management equipment.',
            ],
            [
                'name' => 'Power Equipment',
                'code' => 'PWR',
                'description' => 'Generators, electrical equipment, and power systems.',
            ],
            [
                'name' => 'Tools',
                'code' => 'TLS',
                'description' => 'Hand tools, power tools, and maintenance tools.',
            ],
            [
                'name' => 'Buildings & Facilities',
                'code' => 'FAC',
                'description' => 'Municipal buildings and physical facilities.',
            ],
            [
                'name' => 'Other',
                'code' => 'OTH',
                'description' => 'Other municipal assets not covered by the standard categories.',
            ],
        ];

        foreach ($categories as $category) {
            AssetCategory::updateOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}
