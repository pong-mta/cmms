<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\RequestType;
use App\Models\Role;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class PurchaseRequestWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | REQUEST TYPE
        |--------------------------------------------------------------------------
        */

        $requestType = RequestType::updateOrCreate(
            [
                'code' => 'PURCHASE',
            ],
            [
                'name' => 'Purchase Request',
                'description' => 'Request for the procurement of goods, supplies, equipment, and other authorized purchases.',
                'is_active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | DEPARTMENTS
        |--------------------------------------------------------------------------
        */

        $budgetDepartment = Department::where(
            'code',
            'BUDGET'
        )->firstOrFail();

        $gsoDepartment = Department::where(
            'code',
            'GSO'
        )->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        $departmentHeadRole = Role::where(
            'name',
            'department_head'
        )->firstOrFail();

        $budgetOfficerRole = Role::where(
            'name',
            'budget_officer'
        )->firstOrFail();

        $procurementOfficerRole = Role::where(
            'name',
            'procurement_officer'
        )->firstOrFail();

        $supplyOfficerRole = Role::where(
            'name',
            'supply_officer'
        )->firstOrFail();

        $inspectorRole = Role::where(
            'name',
            'inspector'
        )->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | WORKFLOW
        |--------------------------------------------------------------------------
        */

        $workflow = Workflow::updateOrCreate(
            [
                'code' => 'PURCHASE_REQUEST',
                'version' => 1,
            ],
            [
                'request_type_id' => $requestType->id,
                'name' => 'Purchase Request Workflow v1',
                'description' => 'Standard workflow for municipal purchase requests.',
                'is_active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | REMOVE OLD STEPS
        |--------------------------------------------------------------------------
        |
        | This makes the seeder safe to run repeatedly.
        |
        */

        $workflow->steps()->delete();

        /*
        |--------------------------------------------------------------------------
        | STEP 1
        |--------------------------------------------------------------------------
        | REQUESTER SUBMISSION
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 1,
            'name' => 'Request Submission',
            'code' => 'SUBMIT',
            'department_id' => null,
            'role_id' => null,
            'assignment_type' => 'requesting_department',
            'action' => 'submit',
            'description' => 'The requesting employee submits the purchase request.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 2
        |--------------------------------------------------------------------------
        | DEPARTMENT HEAD
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 2,
            'name' => 'Department Head Review',
            'code' => 'DEPARTMENT_HEAD_REVIEW',
            'department_id' => null,
            'role_id' => $departmentHeadRole->id,
            'assignment_type' => 'requesting_department',
            'action' => 'approve',
            'description' => 'The requesting department head reviews and approves the purchase request.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 3
        |--------------------------------------------------------------------------
        | BUDGET OFFICE
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 3,
            'name' => 'Budget Review',
            'code' => 'BUDGET_REVIEW',
            'department_id' => $budgetDepartment->id,
            'role_id' => $budgetOfficerRole->id,
            'assignment_type' => 'fixed',
            'action' => 'certify',
            'description' => 'The Municipal Budget Office reviews the availability and certification of funds.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 4
        |--------------------------------------------------------------------------
        | PROCUREMENT
        |--------------------------------------------------------------------------
        |
        | BAC / procurement organizational structure will be refined later
        | using a dedicated workflow participant structure.
        |
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 4,
            'name' => 'Procurement Processing',
            'code' => 'PROCUREMENT',
            'department_id' => $gsoDepartment->id,
            'role_id' => $procurementOfficerRole->id,
            'assignment_type' => 'fixed',
            'action' => 'process',
            'description' => 'The procurement function processes the approved purchase request.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 5
        |--------------------------------------------------------------------------
        | SUPPLY / PURCHASING
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 5,
            'name' => 'Supply and Purchasing',
            'code' => 'SUPPLY_PURCHASING',
            'department_id' => $gsoDepartment->id,
            'role_id' => $supplyOfficerRole->id,
            'assignment_type' => 'fixed',
            'action' => 'process',
            'description' => 'The General Services Office handles purchasing, supply processing, and receiving.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 6
        |--------------------------------------------------------------------------
        | INSPECTION
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 6,
            'name' => 'Inspection and Acceptance',
            'code' => 'INSPECTION',
            'department_id' => $gsoDepartment->id,
            'role_id' => $inspectorRole->id,
            'assignment_type' => 'fixed',
            'action' => 'inspect',
            'description' => 'The assigned inspection personnel inspect and accept the delivered items.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 7
        |--------------------------------------------------------------------------
        | REQUESTING OFFICE RECEIPT
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 7,
            'name' => 'Requesting Office Receipt',
            'code' => 'END_USER_RECEIPT',
            'department_id' => null,
            'role_id' => null,
            'assignment_type' => 'requesting_department',
            'action' => 'receive',
            'description' => 'The requesting office acknowledges receipt of the purchased items.',
            'is_required' => true,
        ]);

        /*
        |--------------------------------------------------------------------------
        | STEP 8
        |--------------------------------------------------------------------------
        | COMPLETION
        */

        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'step_order' => 8,
            'name' => 'Completed',
            'code' => 'COMPLETED',
            'department_id' => null,
            'role_id' => null,
            'assignment_type' => 'system',
            'action' => 'complete',
            'description' => 'The purchase request workflow is completed.',
            'is_required' => true,
        ]);
    }
}