<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TerrainController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

Route::middleware("auth:sanctum")->group(function () {
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::put("/profile", [AuthController::class, "updateProfile"]);
    Route::put("/password", [AuthController::class, "updatePassword"]);
    Route::post("/onboarding", [AgencyController::class, "storeOnboarding"]);
    Route::get("/dashboard/stats", [\App\Http\Controllers\DashboardController::class, "stats"]);

    // Terrain routes
    Route::apiResource("terrains", TerrainController::class);
    Route::delete("terrains/{terrain}/documents", [TerrainController::class, "deleteDocument"]);

    // Immeuble routes
    Route::apiResource("immeubles", \App\Http\Controllers\ImmeubleController::class);
    Route::delete("immeubles/{immeuble}/documents", [\App\Http\Controllers\ImmeubleController::class, "deleteDocument"]);

    // Appartement routes
    Route::apiResource("appartements", \App\Http\Controllers\AppartementController::class);
    Route::delete("appartements/{appartement}/documents", [\App\Http\Controllers\AppartementController::class, "deleteDocument"]);

    // Employee routes
    Route::apiResource("employees", EmployeeController::class);

    // Client routes
    Route::apiResource("clients", \App\Http\Controllers\ClientController::class);

    // Paiement routes
    Route::get("paiements/{id}/pdf", [\App\Http\Controllers\PaiementController::class, "downloadPdf"]);
    Route::apiResource("paiements", \App\Http\Controllers\PaiementController::class);

    // Contract routes
    Route::get("contracts/revenue", [\App\Http\Controllers\ContractController::class, "revenue"]);
    Route::get("contracts/{id}/pdf", [\App\Http\Controllers\ContractController::class, "downloadPdf"]);
    Route::apiResource("contracts", \App\Http\Controllers\ContractController::class);

    // Milestone routes (add/edit/delete tranches)
    Route::post("contracts/{contract}/milestones", [\App\Http\Controllers\PaymentMilestoneController::class, "store"]);
    Route::patch("milestones/{milestone}", [\App\Http\Controllers\PaymentMilestoneController::class, "update"]);
    Route::delete("milestones/{milestone}", [\App\Http\Controllers\PaymentMilestoneController::class, "destroy"]);

    // Roles & Permissions
    Route::middleware('role:admin')->group(function() {
        Route::get("roles", [\App\Http\Controllers\RoleController::class, "index"]);
        Route::get("permissions", [\App\Http\Controllers\RoleController::class, "listPermissions"]);
        Route::put("roles/{id}/permissions", [\App\Http\Controllers\RoleController::class, "updatePermissions"]);
    });

    // Commission routes
    Route::post("commissions/{commission}/payments", [\App\Http\Controllers\CommissionController::class, "storePayment"]);
    Route::apiResource("commissions", \App\Http\Controllers\CommissionController::class);

    // Authenticated user info
    Route::get("/user", function (Request $request) {
        $user = $request->user()->load(['role.permissions', 'agency']);
        return response()->json([
            "user" => $user,
            "agency" => $user->agency,
            "employee" => $user,
            "permissions" => (is_object($user->role) && method_exists($user->role, 'permissions')) 
                ? $user->role->permissions->pluck('slug') 
                : [],
        ]);
    });
});
