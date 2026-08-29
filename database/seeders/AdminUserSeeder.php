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

        $hrmoDepartment = Department::where(
            'code',
            'HRMO'
        )->first();

        $engineeringDepartment = Department::where(
            'code',
            'ENGINEERING'
        )->first();

        $budgetDepartment = Department::where(
            'code',
            'BUDGET'
        )->first();

        $accountingDepartment = Department::where(
            'code',
            'ACCOUNTING'
        )->first();

        $gsoDepartment = Department::where(
            'code',
            'GSO'
        )->first();

        $mayorDepartment = Department::where(
            'code',
            'MAYOR'
        )->first();

        /*
        |--------------------------------------------------------------------------
        | VERIFY DEPARTMENTS
        |--------------------------------------------------------------------------
        */

        $requiredDepartments = [
            'HRMO' => $hrmoDepartment,
            'ENGINEERING' => $engineeringDepartment,
            'BUDGET' => $budgetDepartment,
            'ACCOUNTING' => $accountingDepartment,
            'GSO' => $gsoDepartment,
            'MAYOR' => $mayorDepartment,
        ];

        foreach ($requiredDepartments as $code => $department) {
            if (!$department) {
                throw new \RuntimeException(
                    "Department [{$code}] does not exist. Run DepartmentSeeder first."
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | PASSWORD
        |--------------------------------------------------------------------------
        */

        $password = Hash::make('12345678');

        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        $roles = Role::whereIn('name', [
            'system_admin',
            'department_head',
            'maintenance_supervisor',
            'gso',
            'technician',
            'staff',
            'budget_officer',
            'accounting_officer',
            'mayor',
        ])->pluck('id', 'name');

        /*
        |--------------------------------------------------------------------------
        | VERIFY ROLES
        |--------------------------------------------------------------------------
        */

        $requiredRoles = [
            'system_admin',
            'department_head',
            'maintenance_supervisor',
            'gso',
            'technician',
            'staff',
            'budget_officer',
            'accounting_officer',
            'mayor',
        ];

        foreach ($requiredRoles as $roleName) {
            if (!$roles->has($roleName)) {
                throw new \RuntimeException(
                    "Role [{$roleName}] does not exist. Run RoleSeeder first."
                );
            }
        }

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
                'department_id' => $hrmoDepartment->id,
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
        |
        | This user approves requests submitted by the
        | Engineering Department.
        |
        */

        $engineeringHead = User::updateOrCreate(
            [
                'phone' => '09156014663',
            ],
            [
                'name' => 'Engineering Department Head',
                'phone_verified' => true,
                'department_id' => $engineeringDepartment->id,
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
        |
        | Requester for Engineering Department.
        |
        */

        $supervisor = User::updateOrCreate(
            [
                'phone' => '09156014664',
            ],
            [
                'name' => 'Maintenance Supervisor',
                'phone_verified' => true,
                'department_id' => $engineeringDepartment->id,
                'password' => $password,
            ]
        );

        $supervisor->roles()->sync([
            $roles['maintenance_supervisor'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | TECHNICIAN
        |--------------------------------------------------------------------------
        */

        $technician = User::updateOrCreate(
            [
                'phone' => '09156014665',
            ],
            [
                'name' => 'Maintenance Technician',
                'phone_verified' => true,
                'department_id' => $engineeringDepartment->id,
                'password' => $password,
            ]
        );

        $technician->roles()->sync([
            $roles['technician'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | STAFF
        |--------------------------------------------------------------------------
        */

        $staff = User::updateOrCreate(
            [
                'phone' => '09156014666',
            ],
            [
                'name' => 'Maintenance Staff',
                'phone_verified' => true,
                'department_id' => $engineeringDepartment->id,
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
        |
        | IMPORTANT:
        |
        | This account belongs to the MUNICIPAL BUDGET OFFICE.
        |
        | Previously this was incorrectly assigned to the
        | Engineering Department.
        |
        */

        $budgetOfficer = User::updateOrCreate(
            [
                'phone' => '09156014667',
            ],
            [
                'name' => 'Budget Office Officer',
                'phone_verified' => true,
                'department_id' => $budgetDepartment->id,
                'password' => $password,
            ]
        );

        $budgetOfficer->roles()->sync([
            $roles['budget_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | GSO / PURCHASING
        |--------------------------------------------------------------------------
        |
        | This account belongs to the General Services Office.
        |
        */

        $gso = User::updateOrCreate(
            [
                'phone' => '09156014668',
            ],
            [
                'name' => 'General Services Officer',
                'phone_verified' => true,
                'department_id' => $gsoDepartment->id,
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
                'name' => 'Accounting Office Officer',
                'phone_verified' => true,
                'department_id' => $accountingDepartment->id,
                'password' => $password,
            ]
        );

        $accountingOfficer->roles()->sync([
            $roles['accounting_officer'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | MUNICIPAL MAYOR
        |--------------------------------------------------------------------------
        */

        $mayor = User::updateOrCreate(
            [
                'phone' => '09156014670',
            ],
            [
                'name' => 'Municipal Mayor',
                'phone_verified' => true,
                'department_id' => $mayorDepartment->id,
                'password' => $password,
            ]
        );

        $mayor->roles()->sync([
            $roles['mayor'],
        ]);
    }
}