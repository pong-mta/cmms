<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationRequestController;



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


    //REQUEST
  
    Route::get(
        '/operations/requests',
        [OperationRequestController::class, 'index']
    )->name('operations.requests.index');

    Route::get(
        '/operations/requests/create',
        [OperationRequestController::class, 'create']
    )->name('operations.requests.create');

    Route::post(
        '/operations/requests',
        [OperationRequestController::class, 'store']
    )->name('operations.requests.store');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
