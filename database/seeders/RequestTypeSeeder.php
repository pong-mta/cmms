<?php

namespace Database\Seeders;

use App\Models\RequestType;
use Illuminate\Database\Seeder;

class RequestTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [

            /*
            |--------------------------------------------------------------------------
            | GENERAL
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'GENERAL',
                'name' => 'General Request',
                'category' => 'General',
                'description' => 'General departmental request.',
                'icon' => 'clipboard-list',
                'workflow' => 'standard',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => false,
                'sort_order' => 10,
            ],

            [
                'code' => 'ADMINISTRATIVE',
                'name' => 'Administrative Request',
                'category' => 'General',
                'description' => 'General administrative request.',
                'icon' => 'briefcase',
                'workflow' => 'standard',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => false,
                'sort_order' => 20,
            ],

            [
                'code' => 'OTHER',
                'name' => 'Other Request',
                'category' => 'General',
                'description' => 'Other request not covered by the available request types.',
                'icon' => 'ellipsis',
                'workflow' => 'standard',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => false,
                'sort_order' => 30,
            ],


            /*
            |--------------------------------------------------------------------------
            | PROCUREMENT
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'PURCHASE',
                'name' => 'Purchase Request',
                'category' => 'Procurement',
                'description' => 'Request for the purchase of goods, supplies, materials, or equipment.',
                'icon' => 'shopping-cart',
                'workflow' => 'purchase',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 100,
            ],

            [
                'code' => 'PROCUREMENT',
                'name' => 'Procurement Request',
                'category' => 'Procurement',
                'description' => 'Request requiring procurement processing.',
                'icon' => 'shopping-bag',
                'workflow' => 'procurement',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 110,
            ],

            [
                'code' => 'SUPPLIES',
                'name' => 'Supplies Request',
                'category' => 'Procurement',
                'description' => 'Request for office, operational, or departmental supplies.',
                'icon' => 'package',
                'workflow' => 'purchase',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 120,
            ],


            /*
            |--------------------------------------------------------------------------
            | ASSET & FACILITIES
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'MAINTENANCE',
                'name' => 'Maintenance Request',
                'category' => 'Asset & Facilities',
                'description' => 'Request for preventive or corrective maintenance.',
                'icon' => 'wrench',
                'workflow' => 'maintenance',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 200,
            ],

            [
                'code' => 'REPAIR',
                'name' => 'Repair Request',
                'category' => 'Asset & Facilities',
                'description' => 'Request for repair of an asset, equipment, or facility.',
                'icon' => 'settings',
                'workflow' => 'maintenance',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 210,
            ],

            [
                'code' => 'VEHICLE',
                'name' => 'Vehicle / Transportation Request',
                'category' => 'Asset & Facilities',
                'description' => 'Request for official vehicle or transportation support.',
                'icon' => 'truck',
                'workflow' => 'vehicle',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 220,
            ],

            [
                'code' => 'FACILITY',
                'name' => 'Facility / Venue Request',
                'category' => 'Asset & Facilities',
                'description' => 'Request to use or prepare an LGU facility or venue.',
                'icon' => 'building',
                'workflow' => 'facility',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => false,
                'sort_order' => 230,
            ],


            /*
            |--------------------------------------------------------------------------
            | FINANCE
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'REIMBURSEMENT',
                'name' => 'Reimbursement Request',
                'category' => 'Finance',
                'description' => 'Request for reimbursement of authorized expenses.',
                'icon' => 'receipt',
                'workflow' => 'reimbursement',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 300,
            ],

            [
                'code' => 'CASH_ADVANCE',
                'name' => 'Cash Advance Request',
                'category' => 'Finance',
                'description' => 'Request for authorized cash advance.',
                'icon' => 'wallet',
                'workflow' => 'cash_advance',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 310,
            ],

            [
                'code' => 'LIQUIDATION',
                'name' => 'Liquidation Request',
                'category' => 'Finance',
                'description' => 'Submission and processing of expenses for liquidation.',
                'icon' => 'file-check',
                'workflow' => 'liquidation',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 320,
            ],

            [
                'code' => 'PAYMENT',
                'name' => 'Payment Request',
                'category' => 'Finance',
                'description' => 'Request for processing of an authorized payment.',
                'icon' => 'credit-card',
                'workflow' => 'payment',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 330,
            ],

            [
                'code' => 'BUDGET',
                'name' => 'Budget Request',
                'category' => 'Finance',
                'description' => 'Request involving budget allocation, certification, or availability.',
                'icon' => 'landmark',
                'workflow' => 'budget',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 340,
            ],

            [
                'code' => 'ACCOUNTING',
                'name' => 'Accounting Request',
                'category' => 'Finance',
                'description' => 'Request requiring accounting processing or assistance.',
                'icon' => 'calculator',
                'workflow' => 'accounting',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 350,
            ],


            /*
            |--------------------------------------------------------------------------
            | TRAVEL
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'TRAVEL',
                'name' => 'Travel Request',
                'category' => 'Travel',
                'description' => 'Request for official travel.',
                'icon' => 'map',
                'workflow' => 'travel',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 400,
            ],

            [
                'code' => 'TRAVEL_ORDER',
                'name' => 'Travel Order Request',
                'category' => 'Travel',
                'description' => 'Request for issuance or processing of a travel order.',
                'icon' => 'map-pin',
                'workflow' => 'travel_order',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 410,
            ],


            /*
            |--------------------------------------------------------------------------
            | DOCUMENTS
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'DOCUMENT',
                'name' => 'Document Request',
                'category' => 'Documents',
                'description' => 'Request for preparation, routing, release, or processing of a document.',
                'icon' => 'file-text',
                'workflow' => 'document',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => true,
                'sort_order' => 500,
            ],

            [
                'code' => 'CERTIFICATION',
                'name' => 'Certification Request',
                'category' => 'Documents',
                'description' => 'Request for an official certification or certificate.',
                'icon' => 'badge-check',
                'workflow' => 'certification',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => true,
                'sort_order' => 510,
            ],


            /*
            |--------------------------------------------------------------------------
            | INFORMATION TECHNOLOGY
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'IT_TECHNICAL',
                'name' => 'IT / Technical Request',
                'category' => 'Information Technology',
                'description' => 'Request for IT, software, hardware, network, or technical assistance.',
                'icon' => 'monitor',
                'workflow' => 'technical',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 600,
            ],

            [
                'code' => 'COMMUNICATION',
                'name' => 'Communication / Internet Request',
                'category' => 'Information Technology',
                'description' => 'Request involving communication systems, connectivity, telephone, or internet.',
                'icon' => 'wifi',
                'workflow' => 'technical',
                'requires_items' => false,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 610,
            ],


            /*
            |--------------------------------------------------------------------------
            | HUMAN RESOURCES
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'PERSONNEL',
                'name' => 'Personnel / HR Request',
                'category' => 'Human Resources',
                'description' => 'Personnel or human resource related request.',
                'icon' => 'users',
                'workflow' => 'hr',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => true,
                'sort_order' => 700,
            ],

            [
                'code' => 'TRAINING',
                'name' => 'Training / Seminar Request',
                'category' => 'Human Resources',
                'description' => 'Request for training, seminar, workshop, or related activity.',
                'icon' => 'graduation-cap',
                'workflow' => 'training',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 710,
            ],


            /*
            |--------------------------------------------------------------------------
            | EVENTS
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'EVENT',
                'name' => 'Meeting / Event Request',
                'category' => 'Events',
                'description' => 'Request for meeting, event, program, or activity support.',
                'icon' => 'calendar',
                'workflow' => 'event',
                'requires_items' => true,
                'requires_cost' => true,
                'requires_attachment' => true,
                'sort_order' => 800,
            ],


            /*
            |--------------------------------------------------------------------------
            | LEGAL
            |--------------------------------------------------------------------------
            */

            [
                'code' => 'LEGAL',
                'name' => 'Legal Request',
                'category' => 'Legal',
                'description' => 'Request for legal review, advice, document review, or legal assistance.',
                'icon' => 'scale',
                'workflow' => 'legal',
                'requires_items' => false,
                'requires_cost' => false,
                'requires_attachment' => true,
                'sort_order' => 900,
            ],

        ];


        foreach ($types as $type) {

            RequestType::updateOrCreate(
                [
                    'code' =>
                        $type['code'],
                ],
                $type
            );

        }
    }
}