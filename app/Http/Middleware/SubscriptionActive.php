<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class SubscriptionActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->agence_id) {
            $agency = $user->agency;
            
            if (!$agency || $agency->subscription_status !== 'active') {
                return response()->json([
                    'message' => 'Your agency subscription is not active. Please contact support.',
                ], 403);
            }
        }

        return $next($request);
    }
}
