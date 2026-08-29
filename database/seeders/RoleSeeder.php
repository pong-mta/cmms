<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'system_admin',
                'description' => 'System Administrator',
            ],

            [
                'name' => 'department_head',
                'description' => 'Department Head / Office Head',
            ],

            [
                'name' => 'maintenance_supervisor',
                'description' => 'Maintenance Supervisor',
            ],

            [
                'name' => 'technician',
                'description' => 'Maintenance Technician',
            ],

            [
                'name' => 'gso',
                'description' => 'General Services Office Personnel',
            ],

            [
                'name' => 'staff',
                'description' => 'Department Staff',
            ],

            [
                'name' => 'budget_officer',
                'description' => 'Municipal Budget Officer',
            ],

            [
                'name' => 'accounting_officer',
                'description' => 'Municipal Accounting Officer',
            ],

            [
                'name' => 'procurement_officer',
                'description' => 'Procurement Officer',
            ],

            [
                'name' => 'bac_secretariat',
                'description' => 'Bids and Awards Committee Secretariat',
            ],

            [
                'name' => 'bac_member',
                'description' => 'Bids and Awards Committee Member',
            ],

            [
                'name' => 'supply_officer',
                'description' => 'Supply Officer',
            ],

            [
                'name' => 'property_officer',
                'description' => 'Property Officer',
            ],

            [
                'name' => 'inspector',
                'description' => 'Inspection and Acceptance Personnel',
            ],

            [
                'name' => 'mayor',
                'description' => 'Municipal Mayor / HoPE',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                [
                    'name' => $role['name'],
                ],
                [
                    'description' => $role['description'],
                ]
            );
        }
    }
}