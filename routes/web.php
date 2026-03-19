<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Removed session-based auth routes for token-based auth in api.php


Route::get('/{any}', function () {
    if (request()->wantsJson()) {
        return response()->json(['message' => 'Not Found'], 404);
    }
    return view('app');
})->where('any', '^(?!api\/).*$');
