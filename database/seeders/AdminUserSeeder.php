<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed system and workflow test accounts.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | DEPARTMENTS
        |--------------------------------------------------------------------------
        */

        $departments = [];

        $departmentCodes = [
            'HRMO',
            'ENGINEERING',
            'BUDGET',
            'GSO',
            'ACCOUNTING',
            'MAYOR',
        ];

        foreach ($departmentCodes as $code) {
            $department = Department::where(
                'code',
                $code
            )->first();

            if (!$department) {
                throw new \RuntimeException(
                    "Department [{$code}] does not exist. Run DepartmentSeeder first."
                );
            }

            $departments[$code] = $department;
        }

        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        $roleNames = [
            'system_admin',
            'department_head',
            'maintenance_supervisor',
            'technician',
            'gso',
            'staff',
            'budget_officer',
            'accounting_officer',
            'procurement_officer',
            'bac_secretariat',
            'bac_member',
            'supply_officer',
            'property_officer',
            'inspector',
            'mayor',
        ];

        $roles = Role::whereIn(
            'name',
            $roleNames
        )->pluck(
            'id',
            'name'
        );

        foreach ($roleNames as $roleName) {
            if (!$roles->has($roleName)) {
                throw new \RuntimeException(
                    "Role [{$roleName}] does not exist. Run RoleSeeder first."
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | PASSWORD
        |--------------------------------------------------------------------------
        */

        $password = Hash::make(
            '12345678'
        );

        /*
        |--------------------------------------------------------------------------
        | SYSTEM ADMIN
        |--------------------------------------------------------------------------
        */

        $admin = User::updateOrCreate(
            [
                'phone' => '09156014662',
            ],
            [
                'name' => 'PONG ADMIN',
                'phone_verified' => true,
                'department_id' => $departments['HRMO']->id,
                'password' => $password,
            ]
        );

        $admin->roles()->sync([
            $roles['system_admin'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ENGINEERING DEPARTMENT HEAD
        |--------------------------------------------------------------------------
        */

        $engineeringHead = User::updateOrCreate(
            [
                'phone' => '09156014663',
            ],
            [
                'name' => 'Municipal Engineer',
                'phone_verified' => true,
                'department_id' => $departments['ENGINEERING']->id,
                'password' => $password,
            ]
        );

        $engineeringHead->roles()->sync([
            $roles['department_head'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE SUPERVISOR
        |--------------------------------------------------------------------------
        */

        $supervisor = User::updateOrCreate(
            [
                'phone' => '09156014664',
            ],
            [
                'name' => 'Maintenance Supervisor',
                'phone_verified' => true,
                'department_id' => $departments['ENGINEERING']->id,
                'password' => $password,
            ]
        );

        $supervisor->roles()->sync([
            $roles['maintenance_supervisor'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $technician = User::updateOrCreate(
            [
                'phone' => '09156014665',
            ],
            [
                'name' => 'Maintenance Technician',
                'phone_verified' => true,
                'department_id' => $departments['ENGINEERING']->id,
                'password' => $password,
            ]
        );

        $technician->roles()->sync([
            $roles['technician'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE STAFF
        |--------------------------------------------------------------------------
        */

        $staff = User::updateOrCreate(
            [
                'phone' => '09156014666',
            ],
            [
                'name' => 'Maintenance Staff',
                'phone_verified' => true,
                'department_id' => $departments['ENGINEERING']->id,
                'password' => $password,
            ]
        );

        $staff->roles()->sync([
            $roles['staff'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | BUDGET OFFICER
        |--------------------------------------------------------------------------
        */

        $budgetOfficer = User::updateOrCreate(
            [
                'phone' => '09156014667',
            ],
            [
                'name' => 'Municipal Budget Officer',
                'phone_verified' => true,
                'department_id' => $departments['BUDGET']->id,
                'password' => $password,
            ]
        );

        $budgetOfficer->roles()->sync([
            $roles['budget_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | GENERAL SERVICES OFFICER
        |--------------------------------------------------------------------------
        */

        $gso = User::updateOrCreate(
            [
                'phone' => '09156014668',
            ],
            [
                'name' => 'General Services Officer',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $gso->roles()->sync([
            $roles['gso'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ACCOUNTING OFFICER
        |--------------------------------------------------------------------------
        */

        $accountingOfficer = User::updateOrCreate(
            [
                'phone' => '09156014669',
            ],
            [
                'name' => 'Municipal Accounting Officer',
                'phone_verified' => true,
                'department_id' => $departments['ACCOUNTING']->id,
                'password' => $password,
            ]
        );

        $accountingOfficer->roles()->sync([
            $roles['accounting_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | MAYOR
        |--------------------------------------------------------------------------
        */

        $mayor = User::updateOrCreate(
            [
                'phone' => '09156014670',
            ],
            [
                'name' => 'Municipal Mayor',
                'phone_verified' => true,
                'department_id' => $departments['MAYOR']->id,
                'password' => $password,
            ]
        );

        $mayor->roles()->sync([
            $roles['mayor'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PROCUREMENT OFFICER
        |--------------------------------------------------------------------------
        |
        | For now, this test account is assigned to GSO because we have not
        | yet created a separate organizational-unit/committee table for BAC.
        |
        | We will fix this properly when we implement workflow participants.
        |
        */

        $procurementOfficer = User::updateOrCreate(
            [
                'phone' => '09156014671',
            ],
            [
                'name' => 'Procurement Officer',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $procurementOfficer->roles()->sync([
            $roles['procurement_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | BAC SECRETARIAT
        |--------------------------------------------------------------------------
        */

        $bacSecretariat = User::updateOrCreate(
            [
                'phone' => '09156014672',
            ],
            [
                'name' => 'BAC Secretariat',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $bacSecretariat->roles()->sync([
            $roles['bac_secretariat'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | BAC MEMBER
        |--------------------------------------------------------------------------
        */

        $bacMember = User::updateOrCreate(
            [
                'phone' => '09156014673',
            ],
            [
                'name' => 'BAC Member',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $bacMember->roles()->sync([
            $roles['bac_member'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | SUPPLY OFFICER
        |--------------------------------------------------------------------------
        */

        $supplyOfficer = User::updateOrCreate(
            [
                'phone' => '09156014674',
            ],
            [
                'name' => 'Supply Officer',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $supplyOfficer->roles()->sync([
            $roles['supply_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PROPERTY OFFICER
        |--------------------------------------------------------------------------
        */

        $propertyOfficer = User::updateOrCreate(
            [
                'phone' => '09156014675',
            ],
            [
                'name' => 'Property Officer',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $propertyOfficer->roles()->sync([
            $roles['property_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | INSPECTOR
        |--------------------------------------------------------------------------
        |
        | Temporarily assigned to GSO for testing.
        | We will later introduce proper committee/unit assignment.
        |
        */

        $inspector = User::updateOrCreate(
            [
                'phone' => '09156014676',
            ],
            [
                'name' => 'Inspection and Acceptance Officer',
                'phone_verified' => true,
                'department_id' => $departments['GSO']->id,
                'password' => $password,
            ]
        );

        $inspector->roles()->sync([
            $roles['inspector'],
        ]);
    }
}