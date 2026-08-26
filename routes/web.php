<?php

use App\Http\Controllers\AssetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


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
    Route::get('dashboard', function (Request $request) {
        return Inertia::render('dashboard', [
            'user' => $request->user()->load([
                'department',
                'roles',
            ]),
        ]);
    })->name('dashboard');


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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
