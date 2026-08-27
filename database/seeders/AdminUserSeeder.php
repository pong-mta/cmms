<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
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
        | ADMIN DEPARTMENT
        |--------------------------------------------------------------------------
        */

        $adminDepartment = Department::where(
            'code',
            'HRMO'
        )->first();

        if (!$adminDepartment) {
            throw new \RuntimeException(
                'HRMO department does not exist. Run DepartmentSeeder first.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE DEPARTMENT
        |--------------------------------------------------------------------------
        |
        | Your existing Department Heads are in Department 10.
        | We use Department 10 for the workflow test accounts.
        |
        */

        $maintenanceDepartment = Department::find(10);

        if (!$maintenanceDepartment) {
            throw new \RuntimeException(
                'Department ID 10 does not exist.'
            );
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

                'department_id' =>
                $adminDepartment->id,

                'password' => $password,
            ]
        );

        $admin->roles()->syncWithoutDetaching([
            'system_admin',
        ]);


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT HEAD
        |--------------------------------------------------------------------------
        */

        $head = User::updateOrCreate(
            [
                'phone' => '09156014663',
            ],
            [
                'name' =>
                'Maintenance Department Head',

                'phone_verified' => true,

                'department_id' =>
                $maintenanceDepartment->id,

                'password' => $password,
            ]
        );

        $head->roles()->syncWithoutDetaching([
            'department_head',
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
                'name' =>
                'Maintenance Supervisor',

                'phone_verified' => true,

                'department_id' =>
                $maintenanceDepartment->id,

                'password' => $password,
            ]
        );

        $supervisor->roles()->syncWithoutDetaching([
            'maintenance_supervisor',
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
                'name' =>
                'Maintenance Technician',

                'phone_verified' => true,

                'department_id' =>
                $maintenanceDepartment->id,

                'password' => $password,
            ]
        );

        $technician->roles()->syncWithoutDetaching([
            'technician',
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
                'name' =>
                'Maintenance Staff',

                'phone_verified' => true,

                'department_id' =>
                $maintenanceDepartment->id,

                'password' => $password,
            ]
        );

        $staff->roles()->syncWithoutDetaching([
            'staff',
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
                'name' =>
                'Budget Office Officer',

                'phone_verified' => true,

                'department_id' =>
                $maintenanceDepartment->id,

                'password' => $password,
            ]
        );

        $budgetOfficer->roles()->syncWithoutDetaching([
            'budget_officer',
        ]);
    }
}
