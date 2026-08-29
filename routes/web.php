<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\PreventiveMaintenanceScheduleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationsRequestController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/verify-otp', function () {
    return Inertia::render('auth/verify-otp');
})->name('verify-otp');

Route::get('/forgot-password/verify', function () {
    return Inertia::render('auth/verify-forgot-password');
})->name('password.forgot.verify');

Route::get('/reset-password', function () {
    return Inertia::render('auth/reset-password');
})->name('reset-password');

Route::middleware(['auth'])->group(function () {
    Route::get(
        'dashboard',
        [DashboardController::class, 'index']
    )->name('dashboard');


   /*
|--------------------------------------------------------------------------
| OPERATIONS → REQUESTS
|--------------------------------------------------------------------------
*/

Route::prefix('operations/requests')
    ->name('operations.requests.')
    ->group(function () {

        Route::get(
            '/',
            [OperationsRequestController::class, 'index']
        )->name('index');

        Route::get(
            '/create',
            [OperationsRequestController::class, 'create']
        )->name('create');

        Route::post(
            '/',
            [OperationsRequestController::class, 'store']
        )->name('store');

        Route::get(
            '/{serviceRequest}',
            [OperationsRequestController::class, 'show']
        )->name('show');


        /*
        |--------------------------------------------------------------------------
        | WORKFLOW
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/{serviceRequest}/review',
            [OperationsRequestController::class, 'review']
        )->name('review');

        Route::post(
            '/{serviceRequest}/approve',
            [OperationsRequestController::class, 'approve']
        )->name('approve');

        Route::post(
            '/{serviceRequest}/reject',
            [OperationsRequestController::class, 'reject']
        )->name('reject');

        Route::post(
            '/{serviceRequest}/start',
            [OperationsRequestController::class, 'start']
        )->name('start');

        Route::post(
            '/{serviceRequest}/complete',
            [OperationsRequestController::class, 'complete']
        )->name('complete');

    });


    //ASSETS
    Route::get('/assets', [
        AssetController::class,
        'index',
    ])->name('assets.index');

    Route::get('/assets/create', [
        AssetController::class,
        'create',
    ])->name('assets.create');

    Route::post('/assets', [
        AssetController::class,
        'store',
    ])->name('assets.store');
    Route::get('/assets/{asset}', [
        AssetController::class,
        'show',
    ])->name('assets.show');
    Route::get('/assets/{asset}/edit', [
        AssetController::class,
        'edit',
    ])->name('assets.edit');

    Route::put('/assets/{asset}', [
        AssetController::class,
        'update',
    ])->name('assets.update');


    //MAINTENANCE
    Route::get('/maintenance', [
        MaintenanceRecordController::class,
        'index',
    ])->name('maintenance.index');

    Route::get('/maintenance/create', [
        MaintenanceRecordController::class,
        'create',
    ])->name('maintenance.create');

    Route::post('/maintenance', [
        MaintenanceRecordController::class,
        'store',
    ])->name('maintenance.store');
    Route::get('/maintenance/{maintenanceRecord}', [
        MaintenanceRecordController::class,
        'show',
    ])->name('maintenance.show');



    // Maintenance Request

    Route::get('/maintenance-requests', [
        MaintenanceRequestController::class,
        'index',
    ])->name('maintenance-requests.index');

    Route::get('/maintenance-requests/create', [
        MaintenanceRequestController::class,
        'create',
    ])->name('maintenance-requests.create');

    Route::post('/maintenance-requests', [
        MaintenanceRequestController::class,
        'store',
    ])->name('maintenance-requests.store');

    Route::get('/maintenance-requests/{maintenanceRequest}', [
        MaintenanceRequestController::class,
        'show',
    ])->name('maintenance-requests.show');


    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR ASSESSMENT
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/assess',
        [
            MaintenanceRequestController::class,
            'assess',
        ]
    )->name(
        'maintenance-requests.assess'
    );


    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT HEAD
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/head-approve',
        [
            MaintenanceRequestController::class,
            'headApprove',
        ]
    )->name(
        'maintenance-requests.head-approve'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/head-return',
        [
            MaintenanceRequestController::class,
            'headReturn',
        ]
    )->name(
        'maintenance-requests.head-return'
    );

    /*
    |--------------------------------------------------------------------------
    | GENERAL SERVICES OFFICE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/gso-approve',
        [
            MaintenanceRequestController::class,
            'gsoApprove',
        ]
    )->name(
        'maintenance-requests.gso-approve'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/gso-return',
        [
            MaintenanceRequestController::class,
            'gsoReturn',
        ]
    )->name(
        'maintenance-requests.gso-return'
    );


    /*
    |--------------------------------------------------------------------------
    | BUDGET OFFICE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/budget-approve',
        [
            MaintenanceRequestController::class,
            'budgetApprove',
        ]
    )->name(
        'maintenance-requests.budget-approve'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/budget-return',
        [
            MaintenanceRequestController::class,
            'budgetReturn',
        ]
    )->name(
        'maintenance-requests.budget-return'
    );

    /*
    |--------------------------------------------------------------------------
    | ACCOUNTING OFFICE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/accounting-approve',
        [
            MaintenanceRequestController::class,
            'accountingApprove',
        ]
    )->name(
        'maintenance-requests.accounting-approve'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/accounting-return',
        [
            MaintenanceRequestController::class,
            'accountingReturn',
        ]
    )->name(
        'maintenance-requests.accounting-return'
    );


    /*
    |--------------------------------------------------------------------------
    | MAYOR OFFICE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/mayor-approve',
        [
            MaintenanceRequestController::class,
            'mayorApprove',
        ]
    )->name(
        'maintenance-requests.mayor-approve'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/mayor-return',
        [
            MaintenanceRequestController::class,
            'mayorReturn',
        ]
    )->name(
        'maintenance-requests.mayor-return'
    );


    /*
    |--------------------------------------------------------------------------
    | ASSIGN TECHNICIAN
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/assign',
        [
            MaintenanceRequestController::class,
            'assign',
        ]
    )->name(
        'maintenance-requests.assign'
    );


    /*
    |--------------------------------------------------------------------------
    | TECHNICIAN
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/start',
        [
            MaintenanceRequestController::class,
            'startWork',
        ]
    )->name(
        'maintenance-requests.start'
    );

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/complete',
        [
            MaintenanceRequestController::class,
            'complete',
        ]
    )->name(
        'maintenance-requests.complete'
    );


    /*
    |--------------------------------------------------------------------------
    | CANCEL
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/maintenance-requests/{maintenanceRequest}/cancel',
        [
            MaintenanceRequestController::class,
            'cancel',
        ]
    )->name(
        'maintenance-requests.cancel'
    );


    // MAINTENANCE

    Route::get('/maintenance', [
        MaintenanceRecordController::class,
        'index',
    ])->name('maintenance.index');

    Route::get('/maintenance/create', [
        MaintenanceRecordController::class,
        'create',
    ])->name('maintenance.create');

    Route::post('/maintenance', [
        MaintenanceRecordController::class,
        'store',
    ])->name('maintenance.store');


    // PREVENTIVE MAINTENANCE

    Route::get(
        '/preventive-maintenance',
        [
            PreventiveMaintenanceScheduleController::class,
            'index',
        ]
    )->name(
        'maintenance.preventive'
    );

    Route::post(
        '/assets/{asset}/preventive-maintenance',
        [
            PreventiveMaintenanceScheduleController::class,
            'store',
        ]
    )->name(
        'assets.preventive-maintenance.store'
    );

    Route::get(
        '/assets/{asset}/preventive-maintenance/create',
        [
            PreventiveMaintenanceScheduleController::class,
            'create',
        ]
    )->name(
        'assets.preventive-maintenance.create'
    );


    // DYNAMIC MAINTENANCE RECORD ROUTE MUST COME AFTER

    Route::get('/maintenance/{maintenanceRecord}', [
        MaintenanceRecordController::class,
        'show',
    ])->name('maintenance.show');

    Route::post(
        '/preventive-maintenance/{schedule}/create-request',
        [
            PreventiveMaintenanceScheduleController::class,
            'createMaintenanceRequest',
        ]
    )->name(
        'preventive-maintenance.create-request'
    );
    Route::get(
        '/preventive-maintenance/{schedule}/edit',
        [
            PreventiveMaintenanceScheduleController::class,
            'edit',
        ]
    )->name(
        'preventive-maintenance.edit'
    );

    Route::put(
        '/preventive-maintenance/{schedule}',
        [
            PreventiveMaintenanceScheduleController::class,
            'update',
        ]
    )->name(
        'preventive-maintenance.update'
    );

    Route::post(
        '/preventive-maintenance/{schedule}/pause',
        [
            PreventiveMaintenanceScheduleController::class,
            'pause',
        ]
    )->name(
        'preventive-maintenance.pause'
    );

    Route::post(
        '/preventive-maintenance/{schedule}/resume',
        [
            PreventiveMaintenanceScheduleController::class,
            'resume',
        ]
    )->name(
        'preventive-maintenance.resume'
    );

    Route::post(
        '/preventive-maintenance/{schedule}/cancel',
        [
            PreventiveMaintenanceScheduleController::class,
            'cancel',
        ]
    )->name(
        'preventive-maintenance.cancel'
    );

    Route::get(
        '/preventive-maintenance/{schedule}/history',
        [
            PreventiveMaintenanceScheduleController::class,
            'history',
        ]
    )->name(
        'preventive-maintenance.history'
    );
    Route::get(
        '/maintenance-calendar',
        [
            MaintenanceRecordController::class,
            'schedule',
        ]
    )->name(
        'maintenance.schedule'
    );

    Route::get(
        '/maintenance-history',
        [
            MaintenanceRecordController::class,
            'history',
        ]
    )->name(
        'maintenance.history'
    );
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
