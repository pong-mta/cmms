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
                'description' => 'Department Head',
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
                'name' => 'staff',
                'description' => 'Department Staff',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                ['description' => $role['description']]
            );
        }
    }
}
