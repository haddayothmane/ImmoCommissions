<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AgencyController extends Controller
{
    public function storeOnboarding(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'employees' => 'nullable|array',
            'employees.*.name' => 'required|string|max:255',
            'employees.*.email' => 'required|email|unique:users,email',
            'employees.*.role' => 'required|string|in:agent,comptable',
        ]);

        return DB::transaction(function () use ($request) {
            $user = Auth::user();

            // 1. Create the Agency
            $agency = Agency::create([
                'name' => $request->name,
                'city' => $request->city,
                'address' => $request->address,
                'phone' => $request->phone,
                'plan_type' => 'pro', // Default plan for onboarding
                'subscription_status' => 'active',
            ]);

            // 2. Link the current user to the agency
            $user->update([
                'agence_id' => $agency->id,
                'role' => 'admin', // Ensure the creator is the admin
            ]);

            // 3. Create invited employees
            if ($request->has('employees')) {
                foreach ($request->employees as $empData) {
                    User::create([
                        'name' => $empData['name'],
                        'email' => $empData['email'],
                        'role' => $empData['role'],
                        'agence_id' => $agency->id,
                        'password' => Hash::make('password'), // Default password
                        'active' => true,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Onboarding completed successfully',
                'agency' => $agency,
                'user' => $user->fresh(),
            ]);
        });
    }
}
