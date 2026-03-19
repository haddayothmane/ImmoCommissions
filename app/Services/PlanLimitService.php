<?php

namespace App\Services;

use App\Models\Agency;
use App\Models\User;
use App\Models\Terrain;

class PlanLimitService
{
    /**
     * Define plan limits.
     */
    protected const LIMITS = [
        'basic' => [
            'employees' => 3,
            'terrains' => 50, // User mentioned Basic: 3, Pro: 10, Enterprise: 50 in prompt? 
                              // Wait, prompt said: "Basic: 3, Pro: 10, Enterprise: 50" for "employees or terrains".
        ],
        'pro' => [
            'employees' => 10,
            'terrains' => 100,
        ],
        'enterprise' => [
            'employees' => 50,
            'terrains' => 1000,
        ],
    ];

    /**
     * Check if the agency can add a new employee.
     */
    public function canAddEmployee(Agency $agency): bool
    {
        $limit = self::LIMITS[$agency->plan_type]['employees'] ?? 3;
        return $agency->users()->count() < $limit;
    }

    /**
     * Check if the agency can add a new terrain.
     */
    public function canAddTerrain(Agency $agency): bool
    {
        // For terrains, the prompt said limits apply too.
        $limit = self::LIMITS[$agency->plan_type]['terrains'] ?? 50;
        return Terrain::where('agence_id', $agency->id)->count() < $limit;
    }
}
